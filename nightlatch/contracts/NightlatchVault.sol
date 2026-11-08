// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NightlatchVault
/// @notice A time-delay safe for one ERC-20 (USDC). Small withdrawals within an allowance that
///         refills over 24h leave instantly, outside curfew hours. Anything else is queued behind a delay,
///         during which the owner or any guardian can cancel it, freeze the vault, or rescue every
///         token to a recovery address committed in advance.
/// @dev    Deliberately minimal surface: no arbitrary calls, no approvals, no delegatecall, no
///         upgrades, no native ETH. The only ways tokens leave are `withdraw` (instant, capped),
///         `execute` (after the delay), and `rescue` (only to `recovery`).
///         Loosening any control is itself queued behind the delay; tightening is instant.
contract NightlatchVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------- constants

    uint32 public constant MIN_DELAY = 1 hours;
    uint32 public constant MAX_DELAY = 30 days;
    uint32 public constant MAX_FREEZE = 3 days;
    uint256 public constant MAX_GUARDIANS = 5;
    uint256 internal constant DAY = 1 days;

    // ---------------------------------------------------------------- types

    struct Rules {
        uint128 dailyLimit; // instant allowance; refills linearly over 24h, token units
        uint32 delay; // seconds a queued withdrawal or loosening change must wait
        uint16 curfewStart; // minutes after 00:00 UTC; start == end means no curfew
        uint16 curfewEnd; // minutes after 00:00 UTC; the window may wrap midnight
    }

    enum Status {
        None,
        Pending,
        Executed,
        Cancelled
    }

    struct Withdrawal {
        address to;
        uint128 amount;
        uint64 unlockAt;
        Status status;
    }

    enum ChangeKind {
        Rules,
        RemoveGuardian,
        Recovery,
        Owner
    }

    struct Change {
        ChangeKind kind;
        uint64 readyAt;
        Status status;
        bytes data;
    }

    // ---------------------------------------------------------------- storage

    IERC20 public token;
    address public owner;
    address public recovery;
    Rules public rules;

    mapping(address => bool) public isGuardian;
    address[] internal _guardians;

    /// @dev Leaky-bucket allowance: `used` drains at dailyLimit per 24h from `usedAt`.
    ///      No reset cliff, so the allowance cannot be doubled by spending either side of a reset.
    uint128 public used;
    uint64 public usedAt;
    uint64 public frozenUntil;

    Withdrawal[] internal _withdrawals;
    Change[] internal _changes;

    bool private _initialized;

    // ---------------------------------------------------------------- events

    event Initialized(address indexed owner, address indexed token, address recovery);
    event InstantWithdrawal(address indexed to, uint256 amount);
    event WithdrawalQueued(uint256 indexed id, address indexed to, uint256 amount, uint64 unlockAt);
    event WithdrawalExecuted(uint256 indexed id, address indexed to, uint256 amount);
    event WithdrawalCancelled(uint256 indexed id, address indexed by);
    event ChangeQueued(uint256 indexed id, ChangeKind kind, bytes data, uint64 readyAt);
    event ChangeApplied(uint256 indexed id, ChangeKind kind);
    event ChangeCancelled(uint256 indexed id, address indexed by);
    event RulesUpdated(Rules rules);
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event RecoveryUpdated(address indexed recovery);
    event OwnerUpdated(address indexed owner);
    event Frozen(address indexed by, uint64 until);
    event Rescued(address indexed by, address indexed token, address indexed to, uint256 amount);

    // ---------------------------------------------------------------- errors

    error AlreadyInitialized();
    error NotOwner();
    error NotOwnerOrGuardian();
    error ZeroAddress();
    error ZeroAmount();
    error BadRules();
    error BadGuardian();
    error TooManyGuardians();
    error NotPending();
    error NotReady();
    error IsFrozen();
    error NotTightening();
    error BadFreeze();
    error NothingToRescue();

    // ---------------------------------------------------------------- modifiers

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyOwnerOrGuardian() {
        if (msg.sender != owner && !isGuardian[msg.sender]) revert NotOwnerOrGuardian();
        _;
    }

    // ---------------------------------------------------------------- setup

    /// @dev The implementation contract locks itself; clones are initialized by the factory.
    constructor() {
        _initialized = true;
    }

    function initialize(
        address owner_,
        IERC20 token_,
        address recovery_,
        Rules calldata rules_,
        address[] calldata guardians_
    ) external {
        if (_initialized) revert AlreadyInitialized();
        _initialized = true;
        if (owner_ == address(0) || address(token_) == address(0) || recovery_ == address(0)) revert ZeroAddress();
        _checkRules(rules_);
        owner = owner_;
        token = token_;
        recovery = recovery_;
        rules = rules_;
        usedAt = uint64(block.timestamp);
        for (uint256 i; i < guardians_.length; ++i) {
            _addGuardian(guardians_[i]);
        }
        emit Initialized(owner_, address(token_), recovery_);
        emit RulesUpdated(rules_);
    }

    // ---------------------------------------------------------------- withdrawals

    /// @notice Withdraw to any address. Leaves instantly when within the remaining allowance,
    ///         outside curfew and not frozen; otherwise it is queued behind the delay.
    /// @return queued True if the withdrawal was queued. @return id Queue id (0 when instant).
    function withdraw(address to, uint128 amount) external onlyOwner nonReentrant returns (bool queued, uint256 id) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        uint256 u = _currentUsed();
        bool instant = !_isFrozen() && !inCurfew(block.timestamp) && u + amount <= rules.dailyLimit;

        if (instant) {
            used = uint128(u + amount);
            usedAt = uint64(block.timestamp);
            emit InstantWithdrawal(to, amount);
            token.safeTransfer(to, amount);
            return (false, 0);
        }

        uint64 unlockAt = _unlockTime(block.timestamp);
        id = _withdrawals.length;
        _withdrawals.push(Withdrawal({to: to, amount: amount, unlockAt: unlockAt, status: Status.Pending}));
        emit WithdrawalQueued(id, to, amount, unlockAt);
        return (true, id);
    }

    /// @notice Anyone may execute a queued withdrawal once it has unlocked and the vault is not frozen.
    function execute(uint256 id) external nonReentrant {
        Withdrawal storage w = _withdrawals[id];
        if (w.status != Status.Pending) revert NotPending();
        if (block.timestamp < w.unlockAt) revert NotReady();
        if (_isFrozen()) revert IsFrozen();
        w.status = Status.Executed;
        emit WithdrawalExecuted(id, w.to, w.amount);
        token.safeTransfer(w.to, w.amount);
    }

    function cancel(uint256 id) external onlyOwnerOrGuardian {
        Withdrawal storage w = _withdrawals[id];
        if (w.status != Status.Pending) revert NotPending();
        w.status = Status.Cancelled;
        emit WithdrawalCancelled(id, msg.sender);
    }

    // ---------------------------------------------------------------- emergency

    /// @notice Push back every unlock. Owner or any guardian. Freezes only extend, never shorten,
    ///         and simply expire; nobody can unfreeze early.
    function freeze(uint32 duration) external onlyOwnerOrGuardian {
        if (duration == 0 || duration > MAX_FREEZE) revert BadFreeze();
        uint64 until = uint64(block.timestamp) + duration;
        if (until > frozenUntil) frozenUntil = until;
        emit Frozen(msg.sender, frozenUntil);
    }

    /// @notice Send the vault's entire balance of `asset` to the pre-committed recovery address.
    ///         Owner or any guardian. Funds can never go anywhere else through this path.
    /// @dev    Accepts any ERC-20 so stray tokens sent here can also be recovered.
    function rescue(IERC20 asset) external onlyOwnerOrGuardian nonReentrant {
        uint256 bal = asset.balanceOf(address(this));
        if (bal == 0) revert NothingToRescue();
        emit Rescued(msg.sender, address(asset), recovery, bal);
        asset.safeTransfer(recovery, bal);
    }

    // ---------------------------------------------------------------- instant tightening

    function lowerDailyLimit(uint128 newLimit) external onlyOwner {
        if (newLimit >= rules.dailyLimit) revert NotTightening();
        rules.dailyLimit = newLimit;
        emit RulesUpdated(rules);
    }

    function raiseDelay(uint32 newDelay) external onlyOwner {
        if (newDelay <= rules.delay || newDelay > MAX_DELAY) revert NotTightening();
        rules.delay = newDelay;
        emit RulesUpdated(rules);
    }

    function addGuardian(address g) external onlyOwner {
        _addGuardian(g);
    }

    // ---------------------------------------------------------------- delayed loosening

    function proposeRules(Rules calldata next) external onlyOwner returns (uint256) {
        _checkRules(next);
        return _queueChange(ChangeKind.Rules, abi.encode(next));
    }

    function proposeRemoveGuardian(address g) external onlyOwner returns (uint256) {
        if (!isGuardian[g]) revert BadGuardian();
        return _queueChange(ChangeKind.RemoveGuardian, abi.encode(g));
    }

    function proposeRecovery(address next) external onlyOwner returns (uint256) {
        if (next == address(0)) revert ZeroAddress();
        return _queueChange(ChangeKind.Recovery, abi.encode(next));
    }

    function proposeOwner(address next) external onlyOwner returns (uint256) {
        if (next == address(0)) revert ZeroAddress();
        return _queueChange(ChangeKind.Owner, abi.encode(next));
    }

    /// @notice Anyone may apply a change once its delay has passed and the vault is not frozen.
    function applyChange(uint256 id) external {
        Change storage c = _changes[id];
        if (c.status != Status.Pending) revert NotPending();
        if (block.timestamp < c.readyAt) revert NotReady();
        if (_isFrozen()) revert IsFrozen();
        c.status = Status.Executed;

        if (c.kind == ChangeKind.Rules) {
            Rules memory r = abi.decode(c.data, (Rules));
            rules = r;
            emit RulesUpdated(r);
        } else if (c.kind == ChangeKind.RemoveGuardian) {
            _removeGuardian(abi.decode(c.data, (address)));
        } else if (c.kind == ChangeKind.Recovery) {
            address r = abi.decode(c.data, (address));
            recovery = r;
            emit RecoveryUpdated(r);
        } else {
            address o = abi.decode(c.data, (address));
            if (isGuardian[o]) _removeGuardian(o);
            owner = o;
            emit OwnerUpdated(o);
        }
        emit ChangeApplied(id, c.kind);
    }

    function cancelChange(uint256 id) external onlyOwnerOrGuardian {
        Change storage c = _changes[id];
        if (c.status != Status.Pending) revert NotPending();
        c.status = Status.Cancelled;
        emit ChangeCancelled(id, msg.sender);
    }

    // ---------------------------------------------------------------- views

    /// @notice The most that can leave this vault right now without waiting: the "sign on the door".
    function maxExtractableNow() public view returns (uint256) {
        if (_isFrozen() || inCurfew(block.timestamp)) return 0;
        uint256 u = _currentUsed();
        uint256 left = rules.dailyLimit > u ? rules.dailyLimit - u : 0;
        uint256 bal = token.balanceOf(address(this));
        return left < bal ? left : bal;
    }

    function inCurfew(uint256 ts) public view returns (bool) {
        uint16 s = rules.curfewStart;
        uint16 e = rules.curfewEnd;
        if (s == e) return false;
        uint256 m = (ts % DAY) / 60;
        return s < e ? (m >= s && m < e) : (m >= s || m < e);
    }

    /// @notice When a withdrawal requested at `ts` would unlock under the current rules.
    function unlockTimeFor(uint256 ts) external view returns (uint64) {
        return _unlockTime(ts);
    }

    function guardians() external view returns (address[] memory) {
        return _guardians;
    }

    function withdrawalCount() external view returns (uint256) {
        return _withdrawals.length;
    }

    function getWithdrawal(uint256 id) external view returns (Withdrawal memory) {
        return _withdrawals[id];
    }

    function changeCount() external view returns (uint256) {
        return _changes.length;
    }

    function getChange(uint256 id) external view returns (Change memory) {
        return _changes[id];
    }

    // ---------------------------------------------------------------- internal

    function _isFrozen() internal view returns (bool) {
        return block.timestamp < frozenUntil;
    }

    /// @dev Allowance used so far, after draining at dailyLimit per 24h since the last instant spend.
    function _currentUsed() internal view returns (uint256) {
        uint256 refill = (block.timestamp - usedAt) * uint256(rules.dailyLimit) / DAY;
        return used > refill ? used - refill : 0;
    }

    /// @dev At least `delay` from now, and never inside curfew: an unlock that would land in
    ///      curfew is pushed to the end of that curfew window.
    function _unlockTime(uint256 ts) internal view returns (uint64) {
        uint256 t = ts + rules.delay;
        if (inCurfew(t)) t = _curfewEndAfter(t);
        return uint64(t);
    }

    /// @dev The first curfew end strictly after `ts`.
    function _curfewEndAfter(uint256 ts) internal view returns (uint256) {
        uint256 end = ts - (ts % DAY) + uint256(rules.curfewEnd) * 60;
        if (end <= ts) end += DAY;
        return end;
    }

    function _queueChange(ChangeKind kind, bytes memory data) internal returns (uint256 id) {
        uint64 readyAt = uint64(block.timestamp) + rules.delay;
        id = _changes.length;
        _changes.push(Change({kind: kind, readyAt: readyAt, status: Status.Pending, data: data}));
        emit ChangeQueued(id, kind, data, readyAt);
    }

    function _checkRules(Rules memory r) internal pure {
        if (r.delay < MIN_DELAY || r.delay > MAX_DELAY) revert BadRules();
        if (r.curfewStart >= 1440 || r.curfewEnd >= 1440) revert BadRules();
    }

    function _addGuardian(address g) internal {
        if (g == address(0) || g == owner || isGuardian[g]) revert BadGuardian();
        if (_guardians.length >= MAX_GUARDIANS) revert TooManyGuardians();
        isGuardian[g] = true;
        _guardians.push(g);
        emit GuardianAdded(g);
    }

    function _removeGuardian(address g) internal {
        if (!isGuardian[g]) return;
        isGuardian[g] = false;
        uint256 n = _guardians.length;
        for (uint256 i; i < n; ++i) {
            if (_guardians[i] == g) {
                _guardians[i] = _guardians[n - 1];
                _guardians.pop();
                break;
            }
        }
        emit GuardianRemoved(g);
    }
}
