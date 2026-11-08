// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {NightlatchVault} from "./NightlatchVault.sol";

/// @title NightlatchFactory
/// @notice Deploys one minimal-proxy (EIP-1167) NightlatchVault per user. The caller becomes the owner.
///         Clones are not upgradeable: each points at one fixed implementation forever.
contract NightlatchFactory {
    address public immutable implementation;
    IERC20 public immutable token;

    mapping(address => address[]) internal _vaultsOf;
    address[] public allVaults;

    event VaultCreated(address indexed owner, address indexed vault, address recovery);

    constructor(IERC20 token_) {
        token = token_;
        implementation = address(new NightlatchVault());
    }

    function createVault(
        address recovery,
        NightlatchVault.Rules calldata rules,
        address[] calldata guardians
    ) external returns (address vault) {
        vault = Clones.clone(implementation);
        NightlatchVault(vault).initialize(msg.sender, token, recovery, rules, guardians);
        _vaultsOf[msg.sender].push(vault);
        allVaults.push(vault);
        emit VaultCreated(msg.sender, vault, recovery);
    }

    function vaultsOf(address owner) external view returns (address[] memory) {
        return _vaultsOf[owner];
    }

    function vaultCount() external view returns (uint256) {
        return allVaults.length;
    }
}
