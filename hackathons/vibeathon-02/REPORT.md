# Vibeathon 02 (Vibestarter): research report and winning build plan

*Prepared 8 Nov 2026, 17:00 UTC. Submissions close **Mon 9 Nov 2026, 22:00 UTC**, about 29 hours away.*

---

## 0. Read this first

1. **Time.** About 29 hours are left. Entries can be edited until the deadline, so submit a first version early and keep updating it.
2. **Eligibility.** You submit at `app.vibestarter.xyz/vibeathon/submit`, *signed in with the wallet you applied with*. If you didn't apply to Vibeathon 02, you can't submit to this round. In that case, use this plan for Vibeathon 03. The idea is not tied to this round.
3. **Sources.** This session's network blocks `vibestarter.xyz` and its subdomains, so I couldn't open the official page. Everything below comes from search results, the official contracts repo, and entrants' own submission drafts, READMEs and CLAUDE.md files on GitHub. The judging weights in particular are secondhand (an entrant's notes). Check them against `blog.vibestarter.xyz/vibeathon-02` before you lock scope.

---

## 1. The hackathon

| | |
|---|---|
| **Organiser** | Vibestarter: on-chain crowdfunding for vibe-coded apps, on **Base** and **Robinhood Chain**. Raised funds are released over time: 10% at close, then 15% a month for six months. Backers can challenge each monthly release for 72 hours. |
| **Edition** | Vibeathon 02, theme **"Night shift"**. Build window was roughly 2–9 Nov 2026. |
| **Prizes (from the Vibeathon announcement)** | 1st: $500 + funded launch on Vibestarter · 2nd: $250 + funded launch · 3rd: $100 + Starter Card points. Strong builders go into the **Wave 1 founder** pipeline whatever their placing. Selected builders commit to launching on Vibestarter. |
| **Who judges** | A judge panel plus **$VIBES holders** (according to the Vibestarter homepage). Strong entries may be invited to raise. |
| **Judging (secondhand, from an entrant's CLAUDE.md)** | Each criterion is scored 1–10, weighted to 100: **Execution 30 · Launch potential 25 · Originality 20 · Craft & UX 15 · Vibecoding leverage 10**. The same note says: *"Narrow and polished beats broad and buggy. Judges click the example repos first."* |
| **Submission fields** | Project name · one-line tagline · live URL · "What it does and what to try" · AI tools it was built with. Optional: repo, demo video, screenshot, X handle, Fundable score link (`fundable.vibestarter.xyz`, shown to judges for information but not scored). |

**What this means:** *Launch potential* (25) is the criterion most entrants underplay. Judges are asking whether people would back this on Vibestarter next month. The prize is a funded raise, so the right pitch is a crowdfundable product with a business behind it. A clever hackathon demo alone won't score well there.

---

## 2. The competition: about 30 confirmed Vibeathon 02 entries

I found these by searching GitHub for repos that name Vibeathon 02, Vibestarter or the Night shift theme, then reading each README. One entrant (Lights On) says it tracks "33 hackathon builds on Base", which suggests this list covers most of the field.

### Cluster A: tools for vibe coders and founders (the most crowded)
| Entry | What it is |
|---|---|
| **NOCTURN** | Overnight health and security checks on your app, with a Morning Report |
| **NightWatch** (Vieathon_2) | Security audit and monitor for Base contracts, repos and URLs, with EAS attestations |
| **Lights On** | Nightly checks of whether projects you backed are still shipping, attested on Base |
| **Proof of Vibe** | EAS attestation per commit, proving an AI agent built the app |
| **Greenlight** | Launch-readiness workspace for Base teams |
| **Premiere** | Paste a URL and get a narrated launch trailer |
| **Undead** | AI autopsy and resurrection plan for abandoned repos |
| **Verrift** | Proof-of-fix and repair verification on Base Sepolia |
| **Night Shift** (lightokey839) | Overnight discovery board where scouts back indie apps |
| **Night Crew** | Token holders vote and an AI crew ships the feature overnight |

### Cluster B: payments, escrow and USDC flows
| Entry | What it is |
|---|---|
| **Dealza** | Shareable USDC payment agreements with human-reviewed disputes |
| **ProofPay** | Freelancer invoices with an on-chain receipt per paid job |
| **Morning Line** | Per-day escrow for sponsor lines in READMEs |
| **Alert** | Proves a Nigerian bank transfer on-chain for P2P trades ("fake alert") |
| **UpHeld** | Subscriptions with an uptime SLA and automatic refunds |
| **Aerar** | Accounting and intent checks for AI agents' x402 purchases |
| **Backing** | Fans stake USDC in a vault and the creator keeps the yield |
| **Kittora** | USDT savings groups (esusu/VSLA) in Nimiq Pay, on Polygon |

### Cluster C: tokenised stocks "while Wall Street sleeps"
| Entry | What it is |
|---|---|
| **Allowance** | Kids pitch real stocks, parents approve, relatives gift shares overnight (Base mainnet). **The most polished entry I found.** |
| **Lull** | Frozen weekend Chainlink feeds vs live stock-token prices, with Morpho exposure |
| **Night Shift** (araxis33) | Base stock-token price vs the last real trade |
| **After Hours** | Pre-trade cost check for stock tokens off-hours |

### Cluster D: agents, games and other
**Sentinyx** (blocks prompt injection hidden in on-chain text from AI agents) · **CTRL** (shared aquarium, paid keyboard turns) · **chainfess** (on-chain transactions an agent's log doesn't account for).

### What the strongest entries have in common (the standard you need to meet)
- **A judge path that needs no wallet.** Allowance's `/demo` and UpHeld's "Judge Sandbox" let a judge try the product in two minutes, with real Basescan links.
- **Real chain evidence.** Contracts are verified on Sourcify, the README links real transactions, and Allowance runs on mainnet with hard caps.
- **An "Honest limits" section.** Sentinyx, Lull and Allowance all spell out what is not done yet.
- **A build log** showing how Claude Code built it. This feeds Vibecoding leverage.
- **A literal take on "Night shift".** Something happens overnight and you see the result in the morning.

### Where the gap is
More than 25 of about 30 entries fall into A, B or C. **No entry protects self-custodied funds from people.** Nothing covers coercion, home invasions or a drainer sweeping a wallet while its owner sleeps. The real-world data in §3 shows that is one of 2026's fastest-growing crypto threats.

---

## 3. The problem: wrench attacks, and why night is when they happen

**Evidence:**
- **2025 was a record year.** CertiK counted 72 physical coercion incidents ("wrench attacks"), up 75% on 2024. Chainalysis puts 2025 losses at a record $58M.
- **2026 is worse.** CertiK H1 2026: 52 verified incidents, up 33% on H1 2025. **Home invasions went from 1 to 20.** Kidnappings went from 12 to 16. Recorded exposure rose from $10.5M to about $124M. Chainalysis says 2026 is on pace to beat 2025.
- **Families are now targets** (CertiK, via The Block and Cointelegraph). Attackers bypass digital security by coercing the holder or the people around them.
- **CertiK's own recommendation** is *withdrawal delays, staged vault architecture and family preparedness protocols.*
- **Wallet drainers are still active.** Scam Sniffer recorded $83.85M lost in 2025 across about 106k victims. Attackers moved to many smaller thefts.

**The market has already confirmed the fix, but only for custodial accounts:**
- **SwissBorg** launched Withdrawal Protection in Feb 2026: a 1–90 day lock that support can't override, and turning it off takes the same delay.
- **Binance** launched Withdraw Protection in May 2026: locks of up to 7 days, with safeguards against changes made under coercion.
- **Coinbase** launched Transfer Protections: time delays, daily limits and trusted contacts.

**Self-custody has nothing comparable with consumer-level UX on Base.** The only options are a Safe with a Zodiac delay modifier (no consumer UX), BTC-focused Casa, or projects on other chains (a Solana hackathon vault, duress-alert scripts).

**Closest prior art (correction):** the **Argent** smart wallet on Ethereum L1 already had daily transfer limits, a 24h pending period for larger transfers, and guardians who could lock the wallet. Argent has since moved its focus to Starknet. The *mechanism* is not new. What is new: it doesn't exist on Base with today's passkey UX, it has **curfew hours**, **rule changes are delayed** for anti-coercion, and there's a **public deterrence page**. Pitch it as "Argent's security model, rebuilt for the 2026 coercion wave on Base", not as a new invention. Argent's limited mainstream uptake of these features is also a demand risk to address.

**Why a delay deters attackers (the physical-world precedent):** CVS put **time-delay safes** in 158 Indianapolis pharmacies in 2015 and reports a **~70% drop in robberies** within a year (CVS's own figure; the safes came alongside other measures). The delay matters less than the **sign on the door**: robbers leave when they know the safe can't open for ten minutes. A crypto equivalent needs that sign too, as a public, verifiable proof that this wallet can't release large amounts tonight.

This also fits the theme closely. At night the owner is asleep or at home, and so most exposed to home invasion. It is also when a drainer has the most hours before anyone notices.

---

## 4. Recommended build: **Nightlatch**

> **Nightlatch: a time-delay safe for your self-custody crypto, on Base.**
> *While you sleep, nothing big leaves. Any large transfer waits until morning, and your guardians can cancel it.*

(A night latch is a door lock. Check that the name, domain and X handle are free. Fallback names: *Curfew*, *Latchkey*.)

### The core loop (what judges will remember)
1. You move your savings into your **Nightlatch vault**. Your everyday wallet stays as it is.
2. You set **instant allowance** (e.g. $200 a day), **curfew hours** (e.g. 22:00–07:00 your local time, when the instant allowance drops to $0), and **1–3 guardians**: a partner, a sibling, or yourself on another device.
3. Anything over the allowance, or anything during curfew, is **queued**. It can execute only after `max(delay, curfew end)`.
4. When a withdrawal is queued, **every guardian gets a Telegram alert** with a one-tap **Cancel**. Guardians can cancel or freeze. They can never move funds.
5. **Loosening the rules is also delayed.** Raising the allowance, removing a guardian or shortening the delay waits out the same delay and can be cancelled. Tightening is instant. This is the anti-coercion property SwissBorg and Binance rely on. Without it, an attacker would just make you change the settings.
6. **The "sign on the door."** A public page at `nightlatch.xyz/0xYou` (with a QR code) shows live from the contract that *"The most anyone can move from this vault tonight is $0. Next unlock 07:00."* It doesn't have to show the balance. Show it to an attacker, pin it on your profile, or print it.

### The demo that wins: "2:07 AM" (90 seconds, no wallet)
A judge clicks **"Simulate a break-in"** on the demo vault. The narration runs: *"It's 2:07 AM. Someone has a phone to your face and says 'send it all'."* The app sends a real Base Sepolia transaction, which the contract **queues** until 07:00. The guardian's phone (on screen, or the judge's own via a Telegram deep link) buzzes. Guardian taps **Cancel**. Funds stay put, with Basescan links for every step. Then the judge opens the **sign-on-the-door** page and sees "$0 can leave tonight".

### Scope: must-have vs cut
| Must-have (in the submission) | Nice-to-have (only if time allows) | Cut (put on the roadmap) |
|---|---|---|
| Vault factory + per-user vault (ETH + USDC) | Address allowlist with a shorter delay for your own cold wallet | ERC-7579 smart-account module version |
| Instant allowance, curfew window, queue/execute/cancel | Duress PIN in the app (looks like a normal send, silently alerts guardians "DURESS") | Robinhood Chain deployment |
| Guardians (cancel and freeze only) | Base App mini app (MiniKit) | Professional "Night Watch" guardian desk |
| Delayed loosening, instant tightening | AI risk note on queued transfers (fresh address, first-time recipient, known drainer) | Mobile push app |
| Telegram alerts with a Cancel link | | |
| Public sign-on-the-door page + share card | | |
| "2:07 AM" judge demo (relayer-paid, no wallet) | | |
| Foundry tests, Sourcify verification, README with honest limits | | |

### Tech stack
| Layer | Choice | Why |
|---|---|---|
| Contracts | **Solidity 0.8.x + Foundry + OpenZeppelin** (SafeERC20, ReentrancyGuard). `NightlatchFactory` deploys **EIP-1167 clones** of `NightlatchVault`. | Cheap per-user vaults and fast fuzz tests on the time logic. |
| Chain | **Base Sepolia** for the judge demo. Optionally also **Base mainnet with hard caps** (e.g. ≤$50 per vault), following Allowance's approach. | Real mainnet evidence lifts Execution. |
| Wallet | **Coinbase Smart Wallet (passkeys) via OnchainKit + wagmi/viem** | Face ID and gas sponsorship (Coinbase paymaster) keep the UX simple, and the stack is native to Base. |
| Frontend | **Next.js (App Router) + Tailwind**, on Vercel | Same stack as the strongest entries. |
| Alerts | Small **Node worker** (viem `watchContractEvent`) on Railway or Fly, calling the **Telegram Bot API**. A guardian links with `/start <vaultId>`. | Reliable, free, and fast to show live in the demo. |
| Demo relayer | A server route holding a **demo-only key** that drives the demo vault | Gives the no-wallet judge path. |
| Optional AI | Claude API writes a one-paragraph risk note on each queued transfer (recipient age, first-time recipient, known drainer lists) | Real AI use in the product, beyond building it. |

### Contract interface (starting point)
```solidity
interface INightlatchVault {
    struct Rules {
        uint128 dailyAllowance;      // in token units, applies outside curfew
        uint32  delay;               // seconds a queued withdrawal must wait (e.g. 12h)
        uint16  curfewStartMin;      // minutes after 00:00 UTC
        uint16  curfewEndMin;        // window may wrap midnight
    }
    // spending
    function withdraw(address token, address to, uint256 amount) external returns (uint256 queuedId); // instant if within allowance and outside curfew, otherwise queued
    function execute(uint256 id) external;                     // anyone may call after unlockAt
    function cancel(uint256 id) external;                      // owner or any guardian
    // rules (tightening is instant; loosening is queued like a withdrawal)
    function proposeRules(Rules calldata next) external returns (uint256 changeId);
    function addGuardian(address g) external;                  // instant (it tightens)
    function proposeRemoveGuardian(address g) external returns (uint256 changeId);
    function freeze(uint32 extraSeconds) external;             // guardian or owner pushes all unlocks later
    // the "sign on the door"
    function maxExtractableNow(address token) external view returns (uint256);
    function nextUnlock() external view returns (uint64);
    event WithdrawalQueued(uint256 indexed id, address token, address to, uint256 amount, uint64 unlockAt);
    event Cancelled(uint256 indexed id, address by);
}
```
**Invariants to fuzz:** a guardian can never receive funds. Nothing executes before `unlockAt`. No loosening change takes effect before the delay. Allowance resets every 24h. The curfew logic is correct when the window wraps midnight.

**Honest limits to state in the README:** delays add friction for legitimate urgent needs, which is the point, so allowlisted own-addresses are the escape valve. Your everyday wallet's balance is still exposed. A vault can't stop a captor who waits out the delay, which is what guardians and the duress alert are for. The contracts are unaudited, which is why mainnet is capped.

### Launch potential (the 25 points most people miss)
- **Who pays:** self-custody holders with a meaningful balance, plus the families CertiK says are now targets.
- **Model:** free vault. **Night Watch** is a paid professional guardian service: an on-call desk that phones you when a withdrawal is queued at 3am and cancels if you don't answer with your safe word. That is literally a night shift, and people pay for it like home-alarm monitoring. Later: an **SDK/module for wallets** (B2B), since every wallet will need what Binance and SwissBorg shipped.
- **Why backers would fund it:** every $VIBES holder is a potential user, and the tranche model (10% now, 15% a month) fits a security product that ships audits and new chains on a roadmap.
- **Pitch line for the raise page:** *"Binance, Coinbase and SwissBorg all shipped anti-coercion withdrawal locks in 2026. Self-custody didn't. Nightlatch is that lock for your own wallet."*

### Expected scores against the rubric
| Criterion (weight) | Nightlatch | Why |
|---|---|---|
| Execution (30) | 8–9 if the must-haves ship | A small contract surface, the demo is a real transaction, and Foundry tests are quick to write. |
| Launch potential (25) | 8–9 | Market validated by the three largest custodians, with a clear business (Night Watch). |
| Originality (20) | 9 | No entry in the field covers it, and on Base it is new for self-custody. |
| Craft & UX (15) | 8 if the 2:07 AM demo is polished | The emotional, cinematic demo is what sets it apart. |
| Vibecoding leverage (10) | 8 | Include a build log of Claude Code writing the contracts, tests and fuzzing. |

---

## 5. 29-hour build plan (with time to sleep)

| UTC | Block |
|---|---|
| Sun 17:30–21:00 | Contracts + Foundry tests (unit + fuzz on curfew wrap and delays). Deploy to Base Sepolia and verify on Sourcify. |
| Sun 21:00–01:00 | Next.js app: create vault, deposit, rules screen, withdraw (instant or queued), queue list with countdown, cancel. |
| **Sun 01:00–07:00** | **Sleep.** You'll need it to polish tomorrow. |
| Mon 07:00–10:00 | Guardians + Telegram worker (queue alert, Cancel deep link, freeze). |
| Mon 10:00–12:30 | Sign-on-the-door page + QR/share card (OG image). |
| Mon 12:30–15:00 | "2:07 AM" judge demo with relayer, plus narration copy. **Submit v1 by 15:00** (editable). |
| Mon 15:00–18:00 | Polish: empty, error and loading states, mobile, copy. Optional mainnet deploy with caps. |
| Mon 18:00–20:30 | README (problem → evidence → demo → honest limits → roadmap), BUILD_LOG.md, a 2-minute demo video, screenshots. |
| Mon 20:30–21:30 | Final submission edit. Test every link from a logged-out browser. |
| Mon 21:30–22:00 | Buffer. Do not deploy in this window. |

**Submission copy (draft):**
- **Name:** Nightlatch
- **Tagline:** *A time-delay safe for your self-custody crypto: while you sleep, nothing big leaves, and your guardians can cancel anything that tries.*
- **What to try:** "Open `/demo` and press **Simulate a break-in**. No wallet needed. Watch a forced 2:07 AM transfer get queued on Base, the guardian alert arrive, and the cancel land on-chain. Then open the vault's public page and see that $0 can leave tonight."
- **AI tools:** Claude Code built the contracts, tests, fuzzing, frontend and alert worker (see BUILD_LOG.md).

---

## 6. Ideas I considered and rejected

| Idea | Why not |
|---|---|
| Prefunded **shift escrow for night-shift health workers in Nigeria** (cNGN on Base) | The documented unpaid-locum problem is in *public* hospitals (UNTH Enugu, FCT), and those won't fund crypto escrow. It would also land in the crowded escrow cluster (Dealza, ProofPay, Morning Line, Alert, UpHeld). |
| Anything with **tokenised stocks after hours** | Four entries already, including the strongest one (Allowance). |
| **Overnight monitor or security scan for vibe-coded apps** | At least six entries do this. |
| **AI agents spending or shipping overnight** | Aerar, Night Crew, chainfess and Sentinyx already cover it. |
| **Diaspora overnight gifting or remittance** | Allowance already uses this angle. |

---

## Sources
- Vibestarter: [Introducing the Vibeathon](https://blog.vibestarter.xyz/introducing-the-vibeathon) · [vibestarter.xyz](https://www.vibestarter.xyz/) · [Contracts repo](https://github.com/vibesprotocol/vibestarter-contracts)
- Entrant drafts showing rules, deadline and fields: [Allowance SUBMISSION.md](https://github.com/Stella112/Allowance/blob/main/docs/SUBMISSION.md) · [Kittora SUBMISSION.md](https://github.com/Stella112/kittora/blob/main/submission/SUBMISSION.md) · [Undead CLAUDE.md (judging weights)](https://github.com/moltaphet/undead/blob/main/CLAUDE.md)
- Wrench attacks: [CertiK H1 2026](https://www.certik.com/blog/intel3d-wrench-h1-2026) · [The Block: 52 incidents, value up tenfold](https://www.theblock.co/post/409418/crypto-wrench-attacks-persist-total-climbs-52-value-targeted-jumps-tenfold-certik) · [Decrypt: Chainalysis $30M in 2026](https://decrypt.co/375014/crypto-wrench-attacks-30m-stolen-2026-chainalysis) · [Cointelegraph: home invasions](https://regional-front.cointelegraph.com/news/crypto-home-invasions-wrench-attacks-certik-h1-2026) · [The Block: record year](https://www.theblock.co/post/384018)
- Drainers: [Scam Sniffer 2025 report](https://drops.scamsniffer.io/scam-sniffer-2025-crypto-phishing-losses-fall-83-to-84-million/)
- Custodial anti-coercion locks: [SwissBorg Withdrawal Protection](https://www.theblock.co/amp/post/389265/swissborg-introduces-withdrawal-protection-to-safeguard-against-physical-attacks) · [Binance Withdraw Protection](https://en.cryptonomist.ch/2026/05/04/withdraw-protection-binance-security/) · [Coinbase Transfer Protections](https://cryptobriefing.com/coinbase-transfer-protections-account-security/)
- Time-delay safes: [CVS Health](https://www.cvshealth.com/news/pharmacy/preventing-pharmacy-diversion-with-time-delay-safes.html) · [Becker's](https://www.beckershospitalreview.com/pharmacy/cvs-adds-time-delay-safes-to-all-851-texas-pharmacies.html)
- Locum pay (rejected idea): [Guardian NG, UNTH Enugu](https://guardian.ng/features/health/disquiet-at-unth-enugu-over-casualisation-non-payment-of-doctors-salaries/)
