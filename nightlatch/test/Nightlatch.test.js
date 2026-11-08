const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const USDC = (n) => BigInt(Math.round(n * 1e6));
const H = 3600;
const DAY = 86400;
const MIN = (hh, mm = 0) => hh * 60 + mm;

// 22:00 -> 07:00 UTC curfew, $200 a day instant, 12h delay
const RULES = { dailyLimit: USDC(200), delay: 12 * H, curfewStart: MIN(22), curfewEnd: MIN(7) };

let BASE_DAY; // a UTC midnight in the future, set in the fixture
const at = (day, hh, mm = 0) => BASE_DAY + day * DAY + hh * H + mm * 60;

async function deploy() {
  const [owner, g1, g2, recovery, attacker, outsider, payee] = await ethers.getSigners();
  const usdc = await (await ethers.getContractFactory("MockUSDC")).deploy();
  const factory = await (await ethers.getContractFactory("NightlatchFactory")).deploy(await usdc.getAddress());

  const now = await time.latest();
  BASE_DAY = (Math.floor(now / DAY) + 2) * DAY;
  await time.setNextBlockTimestamp(at(0, 12));

  const tx = await factory.connect(owner).createVault(recovery.address, RULES, [g1.address, g2.address]);
  const rc = await tx.wait();
  const ev = rc.logs.map((l) => factory.interface.parseLog(l)).find((e) => e && e.name === "VaultCreated");
  const vault = await ethers.getContractAt("NightlatchVault", ev.args.vault);
  await usdc.mint(await vault.getAddress(), USDC(10_000));
  return { owner, g1, g2, recovery, attacker, outsider, payee, usdc, factory, vault };
}

async function newVault(factory, signer, recovery, rules, guardians = []) {
  const rc = await (await factory.connect(signer).createVault(recovery, rules, guardians)).wait();
  const ev = rc.logs.map((l) => factory.interface.parseLog(l)).find((e) => e && e.name === "VaultCreated");
  return ethers.getContractAt("NightlatchVault", ev.args.vault);
}

describe("Nightlatch", function () {
  describe("setup", function () {
    it("creates a vault owned by the caller with guardians and recovery", async function () {
      const { vault, owner, g1, g2, recovery, factory } = await loadFixture(deploy);
      expect(await vault.owner()).to.equal(owner.address);
      expect(await vault.recovery()).to.equal(recovery.address);
      expect(await vault.guardians()).to.deep.equal([g1.address, g2.address]);
      expect(await factory.vaultsOf(owner.address)).to.deep.equal([await vault.getAddress()]);
    });

    it("cannot be re-initialized, and the implementation is locked", async function () {
      const { vault, attacker, usdc, factory } = await loadFixture(deploy);
      await expect(
        vault.connect(attacker).initialize(attacker.address, await usdc.getAddress(), attacker.address, RULES, [])
      ).to.be.revertedWithCustomError(vault, "AlreadyInitialized");
      const impl = await ethers.getContractAt("NightlatchVault", await factory.implementation());
      await expect(
        impl.connect(attacker).initialize(attacker.address, await usdc.getAddress(), attacker.address, RULES, [])
      ).to.be.revertedWithCustomError(impl, "AlreadyInitialized");
    });

    it("rejects unsafe configuration", async function () {
      const { factory, vault, owner, recovery, g1 } = await loadFixture(deploy);
      const bad = [
        { ...RULES, delay: H - 1 },
        { ...RULES, delay: 30 * DAY + 1 },
        { ...RULES, curfewStart: 1440 },
        { ...RULES, curfewEnd: 1440 },
      ];
      for (const r of bad) {
        await expect(factory.createVault(recovery.address, r, [])).to.be.revertedWithCustomError(vault, "BadRules");
      }
      await expect(factory.createVault(ethers.ZeroAddress, RULES, [])).to.be.revertedWithCustomError(vault, "ZeroAddress");
      await expect(factory.connect(owner).createVault(recovery.address, RULES, [owner.address])).to.be.revertedWithCustomError(vault, "BadGuardian");
      await expect(factory.createVault(recovery.address, RULES, [g1.address, g1.address])).to.be.revertedWithCustomError(vault, "BadGuardian");
      const six = (await ethers.getSigners()).slice(10, 16).map((s) => s.address);
      await expect(factory.createVault(recovery.address, RULES, six)).to.be.revertedWithCustomError(vault, "TooManyGuardians");
    });

    it("rejects native ETH", async function () {
      const { vault, outsider } = await loadFixture(deploy);
      await expect(outsider.sendTransaction({ to: await vault.getAddress(), value: 1n })).to.be.reverted;
    });
  });

  describe("instant allowance", function () {
    it("sends within the allowance immediately outside curfew", async function () {
      const { vault, owner, payee, usdc } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(0, 13));
      await expect(vault.connect(owner).withdraw(payee.address, USDC(150))).to.emit(vault, "InstantWithdrawal");
      expect(await usdc.balanceOf(payee.address)).to.equal(USDC(150));
    });

    it("cannot be bypassed by splitting transfers", async function () {
      const { vault, owner, payee, usdc } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(0, 13));
      for (let i = 0; i < 20; i++) await vault.connect(owner).withdraw(payee.address, USDC(10));
      expect(await usdc.balanceOf(payee.address)).to.equal(USDC(200));
      await expect(vault.connect(owner).withdraw(payee.address, USDC(1))).to.emit(vault, "WithdrawalQueued");
      expect(await usdc.balanceOf(payee.address)).to.equal(USDC(200));
      expect(await vault.maxExtractableNow()).to.be.lt(USDC(0.1)); // only seconds of refill
    });

    it("cannot be bypassed by sending to many different addresses", async function () {
      const { vault, owner, usdc } = await loadFixture(deploy);
      const signers = (await ethers.getSigners()).slice(7, 12);
      await time.setNextBlockTimestamp(at(0, 13));
      for (const s of signers) await vault.connect(owner).withdraw(s.address, USDC(40));
      await expect(vault.connect(owner).withdraw(signers[0].address, USDC(1))).to.emit(vault, "WithdrawalQueued");
      let total = 0n;
      for (const s of signers) total += await usdc.balanceOf(s.address);
      expect(total).to.equal(USDC(200));
    });

    it("refills gradually over 24h instead of resetting all at once", async function () {
      const { vault, owner, payee } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(0, 13));
      await vault.connect(owner).withdraw(payee.address, USDC(200));
      await time.setNextBlockTimestamp(at(0, 13, 1));
      await expect(vault.connect(owner).withdraw(payee.address, USDC(1))).to.emit(vault, "WithdrawalQueued");
      // 9h later (still before curfew) exactly 9/24 of the allowance has refilled: $75
      await time.increaseTo(at(0, 22) - 1);
      expect(await vault.maxExtractableNow()).to.be.closeTo(USDC(75), USDC(0.01));
      await time.setNextBlockTimestamp(at(1, 13));
      await expect(vault.connect(owner).withdraw(payee.address, USDC(200))).to.emit(vault, "InstantWithdrawal");
    });

    it("cannot be doubled by spending either side of a reset (no cliff)", async function () {
      const { vault, owner, payee, usdc } = await loadFixture(deploy);
      // the old fixed-window design let $200 + $200 out within one minute around the reset
      for (const [d, hh, mm] of [[0, 21, 58], [0, 21, 59], [1, 12, 0], [1, 12, 1]]) {
        await time.setNextBlockTimestamp(at(d, hh, mm));
        await vault.connect(owner).withdraw(payee.address, USDC(200));
      }
      // over any stretch of time T, at most dailyLimit * (1 + T/24h) can leave instantly
      const outFirstPair = USDC(200); // 21:58 instant, 21:59 queued
      expect(await vault.withdrawalCount()).to.equal(3n);
      expect(await usdc.balanceOf(payee.address)).to.equal(outFirstPair);
    });

    it("is $0 during curfew, including across midnight", async function () {
      const { vault, owner, payee } = await loadFixture(deploy);
      for (const [hh, mm] of [[22, 0], [23, 59], [24, 0], [26, 7], [30, 59]]) {
        await time.setNextBlockTimestamp(at(0, hh, mm));
        await expect(vault.connect(owner).withdraw(payee.address, USDC(1))).to.emit(vault, "WithdrawalQueued");
        expect(await vault.maxExtractableNow()).to.equal(0n);
      }
      await time.setNextBlockTimestamp(at(1, 7));
      await expect(vault.connect(owner).withdraw(payee.address, USDC(1))).to.emit(vault, "InstantWithdrawal");
    });

    it("is $0 while frozen", async function () {
      const { vault, owner, g1, payee } = await loadFixture(deploy);
      await vault.connect(g1).freeze(H);
      await expect(vault.connect(owner).withdraw(payee.address, USDC(1))).to.emit(vault, "WithdrawalQueued");
      expect(await vault.maxExtractableNow()).to.equal(0n);
    });

    it("never exceeds the vault balance in maxExtractableNow", async function () {
      const { factory, owner, recovery, usdc } = await loadFixture(deploy);
      const v = await newVault(factory, owner, recovery.address, { ...RULES, curfewStart: 0, curfewEnd: 0 });
      await usdc.mint(await v.getAddress(), USDC(50));
      expect(await v.maxExtractableNow()).to.equal(USDC(50));
    });
  });

  describe("queued withdrawals", function () {
    it("a request just before morning still waits the full delay", async function () {
      const { vault, owner, payee } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(1, 6, 59));
      await vault.connect(owner).withdraw(payee.address, USDC(5000));
      const w = await vault.getWithdrawal(0);
      expect(Number(w.unlockAt)).to.equal(at(1, 18, 59));
    });

    it("an unlock that would land in curfew is pushed to curfew end", async function () {
      const { vault, owner, payee } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(0, 14));
      await vault.connect(owner).withdraw(payee.address, USDC(5000)); // 14:00 + 12h = 02:00, in curfew
      expect(Number((await vault.getWithdrawal(0)).unlockAt)).to.equal(at(1, 7));
    });

    it("cannot execute early, executes once, and only to the queued address", async function () {
      const { vault, owner, payee, outsider, usdc } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(0, 13));
      await vault.connect(owner).withdraw(payee.address, USDC(5000));
      const unlockAt = Number((await vault.getWithdrawal(0)).unlockAt);
      await time.setNextBlockTimestamp(unlockAt - 1);
      await expect(vault.connect(outsider).execute(0)).to.be.revertedWithCustomError(vault, "NotReady");
      await time.setNextBlockTimestamp(unlockAt);
      await vault.connect(outsider).execute(0);
      expect(await usdc.balanceOf(payee.address)).to.equal(USDC(5000));
      expect(await usdc.balanceOf(outsider.address)).to.equal(0n);
      await expect(vault.connect(outsider).execute(0)).to.be.revertedWithCustomError(vault, "NotPending");
    });

    it("unlock time is always at least the delay and never inside curfew (randomised)", async function () {
      const { factory, owner, recovery } = await loadFixture(deploy);
      let seed = 42;
      const rnd = (n) => ((seed = (seed * 1103515245 + 12345) % 2 ** 31), seed % n);
      for (let v = 0; v < 25; v++) {
        let s = rnd(1440), e = rnd(1440);
        if (s === e) e = (e + 1) % 1440;
        const delay = H + rnd(5 * DAY);
        const vault = await newVault(factory, owner, recovery.address, { dailyLimit: 0, delay, curfewStart: s, curfewEnd: e });
        for (let i = 0; i < 40; i++) {
          const ts = BASE_DAY + rnd(14 * DAY);
          const unlock = Number(await vault.unlockTimeFor(ts));
          expect(unlock).to.be.gte(ts + delay);
          expect(await vault.inCurfew(unlock)).to.equal(false);
          expect(unlock - (ts + delay)).to.be.lt(DAY);
        }
      }
    });

    it("owner or guardians can cancel; outsiders cannot", async function () {
      const { vault, owner, g1, attacker, payee } = await loadFixture(deploy);
      await vault.connect(owner).withdraw(payee.address, USDC(5000));
      await vault.connect(owner).withdraw(payee.address, USDC(5000));
      await expect(vault.connect(attacker).cancel(0)).to.be.revertedWithCustomError(vault, "NotOwnerOrGuardian");
      await expect(vault.connect(g1).cancel(0)).to.emit(vault, "WithdrawalCancelled");
      await vault.connect(owner).cancel(1);
      await time.increase(3 * DAY);
      await expect(vault.execute(0)).to.be.revertedWithCustomError(vault, "NotPending");
      await expect(vault.connect(g1).cancel(0)).to.be.revertedWithCustomError(vault, "NotPending");
    });

    it("only the owner can withdraw", async function () {
      const { vault, g1, attacker } = await loadFixture(deploy);
      await expect(vault.connect(g1).withdraw(g1.address, 1)).to.be.revertedWithCustomError(vault, "NotOwner");
      await expect(vault.connect(attacker).withdraw(attacker.address, 1)).to.be.revertedWithCustomError(vault, "NotOwner");
    });
  });

  describe("freeze", function () {
    it("blocks execution until it expires; cannot be shortened or exceed 3 days", async function () {
      const { vault, owner, g1, g2, attacker, payee } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(0, 13));
      await vault.connect(owner).withdraw(payee.address, USDC(5000));
      const unlockAt = Number((await vault.getWithdrawal(0)).unlockAt);
      await time.setNextBlockTimestamp(unlockAt - 60);
      await vault.connect(g1).freeze(2 * DAY);
      const until = Number(await vault.frozenUntil());
      await vault.connect(g2).freeze(60); // shorter: must not shorten
      expect(Number(await vault.frozenUntil())).to.equal(until);
      await time.setNextBlockTimestamp(unlockAt + 1);
      await expect(vault.execute(0)).to.be.revertedWithCustomError(vault, "IsFrozen");
      await time.setNextBlockTimestamp(until);
      await vault.execute(0);
      await expect(vault.connect(g1).freeze(3 * DAY + 1)).to.be.revertedWithCustomError(vault, "BadFreeze");
      await expect(vault.connect(attacker).freeze(H)).to.be.revertedWithCustomError(vault, "NotOwnerOrGuardian");
    });
  });

  describe("rescue", function () {
    it("guardian sends everything to the pre-committed recovery address only", async function () {
      const { vault, g1, recovery, usdc } = await loadFixture(deploy);
      await expect(vault.connect(g1).rescue(await usdc.getAddress())).to.emit(vault, "Rescued");
      expect(await usdc.balanceOf(recovery.address)).to.equal(USDC(10_000));
      expect(await usdc.balanceOf(g1.address)).to.equal(0n);
    });

    it("outsiders cannot rescue; empty rescue reverts; stray tokens are recoverable", async function () {
      const { vault, g1, attacker, recovery, usdc } = await loadFixture(deploy);
      await expect(vault.connect(attacker).rescue(await usdc.getAddress())).to.be.revertedWithCustomError(vault, "NotOwnerOrGuardian");
      const stray = await (await ethers.getContractFactory("MockUSDC")).deploy();
      await expect(vault.connect(g1).rescue(await stray.getAddress())).to.be.revertedWithCustomError(vault, "NothingToRescue");
      await stray.mint(await vault.getAddress(), 777n);
      await vault.connect(g1).rescue(await stray.getAddress());
      expect(await stray.balanceOf(recovery.address)).to.equal(777n);
    });

    it("works while frozen and leaves queued withdrawals unfunded", async function () {
      const { vault, owner, g1, payee, usdc } = await loadFixture(deploy);
      await vault.connect(owner).withdraw(payee.address, USDC(9000));
      await vault.connect(g1).freeze(H);
      await vault.connect(g1).rescue(await usdc.getAddress());
      await time.increase(3 * DAY);
      await expect(vault.execute(0)).to.be.reverted;
      expect(await usdc.balanceOf(payee.address)).to.equal(0n);
    });
  });

  describe("rule changes", function () {
    it("tightening is instant; loosening via the tighten functions is refused", async function () {
      const { vault, owner } = await loadFixture(deploy);
      await vault.connect(owner).lowerDailyLimit(USDC(50));
      expect((await vault.rules()).dailyLimit).to.equal(USDC(50));
      await expect(vault.connect(owner).lowerDailyLimit(USDC(60))).to.be.revertedWithCustomError(vault, "NotTightening");
      await vault.connect(owner).raiseDelay(24 * H);
      expect((await vault.rules()).delay).to.equal(24n * 3600n);
      await expect(vault.connect(owner).raiseDelay(13 * H)).to.be.revertedWithCustomError(vault, "NotTightening");
      await expect(vault.connect(owner).raiseDelay(30 * DAY + 1)).to.be.revertedWithCustomError(vault, "NotTightening");
    });

    it("loosening the rules waits the full delay and can be cancelled", async function () {
      const { vault, owner, g1 } = await loadFixture(deploy);
      const loose = { dailyLimit: USDC(1_000_000), delay: H, curfewStart: 0, curfewEnd: 0 };
      await vault.connect(owner).proposeRules(loose);
      await expect(vault.applyChange(0)).to.be.revertedWithCustomError(vault, "NotReady");
      await vault.connect(g1).cancelChange(0);
      await time.increase(2 * DAY);
      await expect(vault.applyChange(0)).to.be.revertedWithCustomError(vault, "NotPending");
      expect((await vault.rules()).dailyLimit).to.equal(USDC(200));

      await vault.connect(owner).proposeRules(loose);
      await time.increase(12 * H);
      await vault.applyChange(1);
      expect((await vault.rules()).dailyLimit).to.equal(USDC(1_000_000));
    });

    it("a frozen vault cannot apply changes", async function () {
      const { vault, owner, g1, attacker } = await loadFixture(deploy);
      await vault.connect(owner).proposeRecovery(attacker.address);
      await time.increase(12 * H - 10);
      await vault.connect(g1).freeze(H);
      await time.increase(20);
      await expect(vault.applyChange(0)).to.be.revertedWithCustomError(vault, "IsFrozen");
    });

    it("guardian removal, recovery and ownership changes are delayed", async function () {
      const { vault, owner, g1, g2, outsider } = await loadFixture(deploy);
      await vault.connect(owner).proposeRemoveGuardian(g1.address);
      await vault.connect(owner).proposeRecovery(outsider.address);
      await vault.connect(owner).proposeOwner(g2.address);
      expect(await vault.isGuardian(g1.address)).to.equal(true);
      await time.increase(12 * H);
      for (let i = 0; i < 3; i++) await vault.applyChange(i);
      expect(await vault.isGuardian(g1.address)).to.equal(false);
      expect(await vault.recovery()).to.equal(outsider.address);
      expect(await vault.owner()).to.equal(g2.address);
      expect(await vault.isGuardian(g2.address)).to.equal(false); // new owner stops being a guardian
    });

    it("only the owner proposes; guardians and outsiders cannot", async function () {
      const { vault, g1, attacker } = await loadFixture(deploy);
      await expect(vault.connect(g1).proposeRecovery(g1.address)).to.be.revertedWithCustomError(vault, "NotOwner");
      await expect(vault.connect(attacker).proposeOwner(attacker.address)).to.be.revertedWithCustomError(vault, "NotOwner");
      await expect(vault.connect(attacker).addGuardian(attacker.address)).to.be.revertedWithCustomError(vault, "NotOwner");
      await expect(vault.connect(attacker).cancelChange(0)).to.be.reverted;
    });
  });

  describe("attack scenarios", function () {
    it("STOLEN KEY at 2:07 AM: the thief gets $0 and the guardian rescues everything", async function () {
      const { vault, owner: stolenKey, g1, recovery, attacker, usdc } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(1, 2, 7));
      await vault.connect(stolenKey).withdraw(attacker.address, USDC(10_000));
      await vault.connect(stolenKey).withdraw(attacker.address, USDC(1)); // even small amounts queue at night
      await vault.connect(stolenKey).proposeRecovery(attacker.address);
      await vault.connect(stolenKey).proposeRules({ dailyLimit: USDC(10_000), delay: H, curfewStart: 0, curfewEnd: 0 });
      expect(await usdc.balanceOf(attacker.address)).to.equal(0n);

      await vault.connect(g1).rescue(await usdc.getAddress());
      expect(await usdc.balanceOf(recovery.address)).to.equal(USDC(10_000));

      await time.increase(3 * DAY);
      await expect(vault.execute(0)).to.be.reverted;
      expect(await usdc.balanceOf(attacker.address)).to.equal(0n);
    });

    it("STOLEN KEY in daytime: the loss is capped at the daily allowance", async function () {
      const { vault, owner: stolenKey, g1, attacker, usdc } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(1, 13));
      await vault.connect(stolenKey).withdraw(attacker.address, USDC(200));
      await vault.connect(stolenKey).withdraw(attacker.address, USDC(9_800));
      await vault.connect(g1).cancel(0);
      await time.increase(3 * DAY);
      expect(await usdc.balanceOf(attacker.address)).to.equal(USDC(200));
    });

    it("FORCED AT HOME: forced transfer and forced rule changes are all cancelled", async function () {
      const { vault, owner, g1, attacker, usdc } = await loadFixture(deploy);
      await time.setNextBlockTimestamp(at(1, 2, 7));
      await vault.connect(owner).withdraw(attacker.address, USDC(10_000));
      await vault.connect(owner).proposeRules({ dailyLimit: USDC(10_000), delay: H, curfewStart: 0, curfewEnd: 0 });
      await vault.connect(owner).proposeRemoveGuardian(g1.address);
      await vault.connect(g1).cancel(0);
      for (let i = 0; i < 2; i++) await vault.connect(g1).cancelChange(i);
      await time.increase(3 * DAY);
      await expect(vault.execute(0)).to.be.revertedWithCustomError(vault, "NotPending");
      await expect(vault.applyChange(0)).to.be.revertedWithCustomError(vault, "NotPending");
      expect(await usdc.balanceOf(attacker.address)).to.equal(0n);
      expect(await vault.isGuardian(g1.address)).to.equal(true);
    });

    it("MALICIOUS GUARDIAN: can delay or rescue to the owner, but never take funds", async function () {
      const { vault, g1: bad, recovery, usdc } = await loadFixture(deploy);
      await expect(vault.connect(bad).withdraw(bad.address, 1)).to.be.revertedWithCustomError(vault, "NotOwner");
      await expect(vault.connect(bad).proposeRecovery(bad.address)).to.be.revertedWithCustomError(vault, "NotOwner");
      await vault.connect(bad).freeze(3 * DAY);
      await vault.connect(bad).rescue(await usdc.getAddress());
      expect(await usdc.balanceOf(bad.address)).to.equal(0n);
      expect(await usdc.balanceOf(recovery.address)).to.equal(USDC(10_000));
    });

    it("STOLEN KEY adds itself as guardian: gains nothing", async function () {
      const { vault, owner: stolenKey, attacker, recovery, usdc } = await loadFixture(deploy);
      await vault.connect(stolenKey).addGuardian(attacker.address);
      await vault.connect(attacker).rescue(await usdc.getAddress()); // only goes to the owner's recovery
      expect(await usdc.balanceOf(attacker.address)).to.equal(0n);
      expect(await usdc.balanceOf(recovery.address)).to.equal(USDC(10_000));
    });
  });
});
