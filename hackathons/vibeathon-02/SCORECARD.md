# Vibeathon 02: Nightlatch, sharpened, and graded against the field

*8 Nov 2026. Competitor scores come from each entry's public README and repo (no live testing). Nightlatch scores are projected, assuming it ships as scoped. Rubric (secondhand): Execution 30 · Launch potential 25 · Originality 20 · Craft & UX 15 · Vibecoding leverage 10.*

## 1. Is the current framing the best Nightlatch can be? No. Three upgrades

### Upgrade 1: lead with stolen keys, not only physical attacks
| Threat to individuals | Size (2025) |
|---|---|
| Physical coercion (wrench attacks) | about 72 incidents, about $58M (Chainalysis) |
| **Personal wallet compromises** | **about 158,000 incidents, at least 80,000 victims, about $713M** (Chainalysis, via The Block) |

Leaked seeds, malware and signing a drainer transaction cost individuals about 12× more than wrench attacks, and they happen to ordinary Base users. A delay lane protects against both, **but only with a rescue path**. If the attacker holds your key, cancelling alone isn't enough: they'll just queue the transfer again.

**New primitive: the Rescue Lane.** When you set up the vault, you commit a recovery address (your cold wallet or exchange deposit). A guardian can trigger **Rescue**, which sends everything to that address immediately and nowhere else. Changing the recovery address is a loosening change, so it's delayed and can be cancelled.
- A key thief gets a queued transfer, a guardian rescues the funds, and the thief gets $0.
- A guardian who turns malicious can only move your money *to you*.
- A physical attacker forcing you to send gets the same outcome.

This is what turns it from "Argent's daily limit, again" into something with its own security argument. Neither Argent's limit-plus-lock model nor the exchange locks offer guardian-triggered rescue to a pre-committed address.

### Upgrade 2: frame it in the judges' own language
Vibestarter's core idea is **time-released funds with a 72-hour backer challenge window.** Nightlatch is the same idea applied to a wallet: *"Vibestarter made raised money safe with time-release and a challenge window. Nightlatch gives your own wallet the same protection."* Judges built that mechanism, so they'll understand Nightlatch in one sentence.

**Launch wedge:** Vibestarter founders receive tranche payouts into a single founder key. A **Founder Latch** gives that payout wallet a delay plus co-founder guardians, and a public page showing every large outflow before it executes. This protects the founder's key, and backers keep visibility after funds leave escrow. It's a distribution channel straight into the host platform.

### Upgrade 3: one contract, three users (roadmap, not scope)
- **People:** savings vault, curfew hours, rescue lane.
- **Founders:** Founder Latch, with outflows visible to backers.
- **AI agents:** the agent spends small amounts instantly, and anything large waits for your morning approval. Same contract, and literally a "night shift". Mention it only as roadmap: Aerar already covers agent spending.

### The new demo (two scenes, about 2 minutes, no wallet)
1. **"Your key leaked."** At 2:07 AM an attacker with your key tries to move everything. The transfer is queued until 07:00. The guardian's phone lights up. They press **Rescue** and everything lands in your cold wallet. The attacker gets $0. Every step links to Basescan.
2. **"Phone to your face."** A forced transfer is queued. The attacker forces you to loosen the rules, and that change is queued too. The guardian cancels both.

The close is the public page: *"Most anyone can move from this vault tonight: $0."*

**New tagline:** *Nightlatch: if your key leaks or someone forces your hand at 2 AM, nothing big leaves before morning, and your guardians can send it all home.*

## 2. Leaderboard (current entries + Nightlatch)

| # | Entry | Exec 30 | Launch 25 | Orig 20 | Craft 15 | Vibe 10 | **Score** | One-line verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | **Allowance** | 9 | 7 | 8 | 9 | 9 | **83** | Mainnet, real stock tokens, 51 fork tests, a family demo. The entry to beat. Main risk: minors and stocks raise regulatory questions |
| 2 | **Nightlatch (sharpened, projected)** | 7.5 | 8 | 7.5 | 8.5 | 8 | **≈78** | Upside depends on actually shipping the contract, rescue lane and two-scene demo |
| 3 | **Sentinyx** | 8 | 6 | 8.5 | 8.5 | 8 | **77** | Novel (prompt injection hidden in on-chain text), Attack Lab, excellent craft. Who pays is unclear |
| 4 | **Aerar** | 8.5 | 6.5 | 7.5 | 7 | 8 | **75** | About 200 tests, IntentLock is clever. x402 agent buying is still an early market |
| 4 | **Premiere** | 8 | 7 | 6.5 | 8 | 8 | **75** | Every Vibestarter founder needs a launch trailer. Similar tools exist |
| 6 | **Nightlatch (as first scoped)** | 7.5 | 7 | 7 | 8 | 8 | **≈74** | Wrench-attack-only framing caps launch potential |
| 6 | **Lights On** | 8 | 6.5 | 7 | 7.5 | 8 | **74** | Serves Vibestarter backers directly, with real numbers in the README |
| 8 | **UpHeld** | 8 | 6 | 7.5 | 7 | 7.5 | **72** | Good judge sandbox, but "Live app: <add your Vercel URL>" was still a placeholder |
| 8 | **Kittora** | 8 | 7.5 | 6.5 | 7 | 7.5 | **72** | Real savings-group problem, but on Polygon inside Nimiq Pay, not Base or Robinhood Chain |
| 10 | **Alert** | 6 | 8 | 8.5 | 6 | 7 | **71** | Strongest real-world idea in the field (Nigerian "fake alert"). No live link in the README |
| 10 | **Undead** | 7.5 | 5 | 7.5 | 8.5 | 8 | **71** | Delightful and shareable. Weak business case |
| 12 | **Morning Line** | 7.5 | 5.5 | 8 | 6.5 | 7 | **69** | Novel per-day escrow for README sponsor lines. Niche |
| 12 | **Lull** | 7.5 | 5 | 8 | 7 | 7 | **69** | Sharp insight (weekend price feeds freeze). Analytics only |
| 12 | **Night Crew** | 6.5 | 6 | 8 | 6.5 | 8.5 | **69** | Votes weighted by $VIBES, which may play well with token-holder voters |
| 15 | **Backing** | 7.5 | 6.5 | 6 | 7 | 7 | **68** | Yield-funded creator backing, also a Base App mini app |
| 16 | **Dealza** | 8 | 6.5 | 5 | 6.5 | 7 | **67** | Solid, but escrow is the most crowded cluster |
| 17 | **After Hours** | 7.5 | 5.5 | 6 | 7 | 7 | **66** | Overlaps with Lull and Night Shift (araxis) |
| 17 | **Proof of Vibe** | 7 | 6 | 6.5 | 6 | 7.5 | **66** | Aligned with Vibestarter, thin product |
| 19 | **ProofPay** | 7.5 | 6 | 5 | 6.5 | 6.5 | **64** | Clean, crowded category |
| 19 | **Night Shift (scouts)** | 6.5 | 6 | 6.5 | 6.5 | 7 | **64** | Feeds Vibestarter's pipeline |
| 21 | **CTRL** | 6.5 | 4.5 | 7 | 7 | 7 | **62** | Fun, weak launch case |
| 22 | **Greenlight** | 7 | 5 | 5 | 6.5 | 7 | **60** | Project-management tool with an on-chain check bolted on |
| 23 | **NightWatch** | 6.5 | 5.5 | 4.5 | 6 | 7 | **58** | One of about six scanners |
| 24 | **NOCTURN** | 6 | 5.5 | 4.5 | 6 | 6.5 | **56** | Thin README, crowded category |
| 25 | **Verrift** | 5.5 | 4.5 | 6 | 6 | 6 | **55** | Deployment fix notes in the README look unfinished |
| 26 | **Night Shift (araxis)** | 6 | 4 | 5 | 5 | 6 | **52** | Small data page |

**Reading the table:** at about 78, a fully shipped sharpened Nightlatch is a real contender for 2nd and within reach of 1st. That's only if it ships. If execution slips to 6/10, it falls to about 73, mid-pack. Execution is the biggest risk, so keep the contract small.

## Sources
- [The Block: Chainalysis 2025, attacks on individual wallets rise](https://www.theblock.co/post/382477) · [GovInfoSecurity](https://www.govinfosecurity.com/crypto-theft-in-2025-concentrated-in-fewer-larger-breaches-a-30331) · [Bloomberg Law](https://news.bloomberglaw.com/financial-accounting/crypto-thefts-hacks-have-already-topped-last-years-tally)
- Competitor READMEs on GitHub (see REPORT.md §2).
