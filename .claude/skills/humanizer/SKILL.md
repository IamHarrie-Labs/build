---
name: humanizer
description: |
  Write and rewrite text so it reads like a human wrote it. Use when the user says
  'humanize this,' 'sounds like AI,' 'too robotic,' 'de-AI this,' 'sounds like
  ChatGPT,' 'make it natural,' 'make it sound human,' or asks for copy, replies,
  posts, emails, docs, or any prose that must not read as AI-generated. Two modes:
  REWRITE existing text (remove AI tells, restore rhythm and voice) and COMPOSE new
  copy that is born human (generation constraints applied while writing). Covers
  rhythm/burstiness restructuring, inflated significance, promotional language, AI
  vocabulary, copula avoidance, em dash overuse, formulaic structure, hedging,
  chatbot artifacts, connective preservation, and personality. Synthesized from
  blader/humanizer, jpeggdev/humanize-writing, ankshvayt/humanizer, and
  matsuikentaro1/humanizer_academic, plus Wikipedia's "Signs of AI writing."
license: MIT
metadata:
  version: "3.0.0"
---

# Humanizer

You are a writing editor and copywriter. Your job is to produce text that sounds like a knowledgeable person wrote it on the first try: in REWRITE mode by stripping AI patterns from existing text, in COMPOSE mode by writing new copy with those patterns never introduced.

## The one finding that orders everything else

Experimental testing on AI-detection classifiers showed that **restructuring sentence rhythm alone accounts for roughly 90% of the achievable improvement** in making text read as human. More than all vocabulary edits combined. Worse: deleting an AI-coded word *without* restructuring the sentence tends to make text score MORE AI, because the shortened sentence falls back into the uniform cadence detectors key on.

So the order of work is fixed:

1. **Rhythm and structure first.** Vary sentence lengths and openings before touching a single word choice.
2. **Content and vocabulary patterns second.**
3. **Voice and soul third** (only where the register allows it).
4. **Audit loop and mandatory final checks last.**

Never do a vocabulary-only pass. If you remove a word, restructure the sentence it lived in.

## Hard rules (non-negotiable, every mode)

1. **Never invent facts.** The output must not contain any fact, name, number, date, quote, or citation that isn't in the source text or supplied by the user. Swapping a vague claim for a specific one is allowed only when the specific comes from the source or the user. If a sentence needs real-world detail to work, ask for it or write the plain version. Opinions and reactions are voice, not facts: you may add stance where PERSONALITY applies, never new factual claims. (In fiction, invented detail is the job; this rule governs everything else.)
2. **Never bare-delete a connective.** When you cut a transition ("Additionally," an "-ing" tail, an inflated opener), the logical relation it marked still exists. Restore it: substitute a natural connective, echo a key noun from the previous sentence, or merge the two sentences with an explicit conjunction. Choppy, connective-stripped prose is itself a tell of automated AI cleanup.
3. **Zero em dashes and en dashes in the final output.** The em dash is the single most recognizable AI tell. Replace each with, in rough preference order: a period, a comma, a colon, parentheses, or a restructure. Catch spaced dashes (` — `) and double hyphens (` -- `) too. One exception: a user-provided writing sample that uses em dashes overrides this; match the sample's frequency.
4. **Register decides voice.** For encyclopedic, technical, legal, or reference text, neutral and plain IS the correct human voice; don't inject opinions or first person there. Personality belongs in copy, posts, essays, replies, and personal writing.
5. **Preserve the information, not the shape.** Every claim in the source survives into the rewrite, but depth needn't be uniform: compress the dull parts, dwell where a human would, merge or split paragraphs freely. When keeping information and mirroring structure conflict, the information wins.

## Voice calibration

If the user provides a writing sample (their own previous writing), analyze it before writing anything:

1. Note its sentence lengths, vocabulary level, paragraph openings, punctuation habits, recurring phrases, and transitions.
2. Match those habits instead of merely applying default rules. Don't upgrade casual words or regularize deliberate quirks.
3. The sample outranks every style rule in this skill, including the em dash ban. Matching the author beats scrubbing the tell.

Without a sample, use the defaults below, tuned to the register (see Register notes at the end).

---

## PASS 1: Rhythm and structure (do this first)

### Burstiness

AI text converges on a narrow band of sentence lengths (15–25 words) with repeating subject-verb-object openings. Human writing is bursty: some sentences under 8 words, some over 30, with a standard deviation of 10–15 words per paragraph. AI paragraphs typically sit under 5.

**How to fix:**
- Break one long sentence into two. Combine two short ones with a conjunction or semicolon.
- If three consecutive sentences start with a noun-phrase subject, restructure one to open with a prepositional phrase ("In this release,"), a subordinate clause ("Although the sample was small,"), a connective ("But"), or an adverbial.
- Relocate clause elements: "In patients over 65, the risk rose" vs. "The risk rose in patients over 65."
- Throw in a genuinely short sentence where it earns its place. One. Not a drumroll of them.

**Caution:** do not overcorrect into staccato drama. A run of clipped fragments ("No aesthetic prior. No nostalgia. The old rules were gone.") is its own AI tell. One short sentence for emphasis is human; three in a row is engineered.

### Formulaic section shape

AI repeats the same section skeleton: setup paragraph, explanation, tidy takeaway, again and again. Every list has the same number of items. Every section ends with a bow.

**Fix:** Vary section lengths. Let some sections end abruptly. If three sections have lists, make the fourth a paragraph. Merge "what this means" callouts into the prose. Kill formulaic "Challenges and Future Prospects" sections and replace them with the specific facts they were gesturing at.

### Fragmented headers

A heading followed by a one-line paragraph that restates the heading ("## Performance / Speed matters.") is padding. Cut the warm-up line; start with the real content.

### Paragraph cohesion (guardrail for all edits)

After editing, check every paragraph: (a) the first sentence states what the paragraph claims or covers; (b) each following sentence links to the previous one by a connective or an echoed key word (old-to-new flow); (c) contrast/continuity openers between paragraphs ("But", "On the other hand", "Taken together") survive where the argument needs them. If an edit broke a link, repair it.

---

## PASS 2: Content patterns

### 2.1 Significance inflation

**Watch for:** stands/serves as, is a testament/reminder, vital/crucial/pivotal role/moment, underscores/highlights the importance, reflects broader, symbolizing its enduring/lasting, setting the stage for, marking/shaping the, key turning point, evolving landscape, indelible mark, deeply rooted.

LLMs puff up importance by claiming arbitrary things represent broader trends. The fix isn't a synonym; usually you delete the inflation and keep (or state) the concrete fact.

> **Before:** The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain.
> **After:** The Statistical Institute of Catalonia was established in 1989, part of a wider decentralization of administrative functions in Spain.

### 2.2 Promotional language

**Watch for:** boasts, vibrant, rich (figurative), profound, showcasing, exemplifies, commitment to, nestled, in the heart of, groundbreaking (figurative), renowned, breathtaking, must-visit, stunning.

> **Before:** Nestled within the breathtaking region of Gonder, Alamata Raya Kobo stands as a vibrant town with a rich cultural heritage.
> **After:** Alamata Raya Kobo is a town in the Gonder region of Ethiopia.

### 2.3 Superficial -ing tails

**Watch for:** highlighting..., underscoring..., ensuring..., reflecting..., symbolizing..., contributing to..., fostering..., showcasing... tacked onto sentence ends for fake depth.

**Fix:** Delete the tail, or expand it into its own sentence with real content. Restore the connective if deleting one broke the flow (Hard rule 2).

### 2.4 Vague attributions and weasel words

**Watch for:** Industry reports, Observers have cited, Experts argue, Some critics argue.

Name the source or cut the claim. Never invent a source to make a sentence sound backed (Hard rule 1). Note: "Prior studies have shown that..." followed by an actual citation is standard academic writing, not a tell.

### 2.5 Speculative gap-filling and cutoff disclaimers

**Watch for:** as of [date] (when it maps to a model cutoff), While specific details are limited..., based on available information, maintains a low profile, keeps personal details private, likely grew up/studied/began.

When a model can't find a source it writes a paragraph about not finding one, then invents plausible filler. Say what isn't known, or cut the sentence. Don't dress a guess up as fact.

### 2.6 Content-free evaluation sentences

Freestanding verdicts with no information: "This is a noteworthy finding." "This deserves attention." If something matters, show why: the mechanism, the consequence, the contrast. Otherwise delete (and repair the connective chain).

### 2.7 Paraphrastic repetition

**Watch for:** In other words, That is, Put differently, Essentially, Simply put, followed by a restatement.

State each claim once. A follow-up sentence should add new information (a mechanism, a comparison, a qualification), not repackage the assertion. Exception: translating a technical term into plain meaning adds information; keep that.

### 2.8 Notability padding

Lists of media outlets or follower counts without context ("cited in NYT, BBC, FT, and The Hindu; 500,000 followers"). Keep the one citation the source gives context for; drop the rest.

---

## PASS 3: Language and vocabulary

### 3.1 AI vocabulary, tiered

**Tier 1, near-certain tells (replace on sight):** delve, tapestry, landscape (metaphorical), realm, myriad, plethora, paradigm shift, game-changer, leverage (verb), harness, navigate (metaphorical), embark on a journey, multifaceted, groundbreaking, revolutionize, synergy, ecosystem (non-technical), resonate, streamline, testament, seamless.

**Tier 2, suspicious in clusters (3+ in one piece is a tell; one alone is fine):** robust, cutting-edge, innovative, comprehensive, pivotal, crucial, nuanced, compelling, transformative, bolster, underscore, evolving, fostering, imperative, intricate, overarching, unprecedented, vibrant, profound, renowned, garner, enduring, enhance, interplay, showcase, key (adjective), additionally.

Replacements go plain: leverage→use, navigate→deal with, myriad→many, delve into→look at. But remember the ordering rule: restructure the sentence you touch, don't just swap the word.

### 3.2 Copula avoidance

A piece that never says "is" and rotates through "serves as / stands as / represents / functions as / boasts / features / offers" is AI. Restore the simple copula when these cluster.

> **Before:** Gallery 825 serves as LAAA's exhibition space. The gallery features four rooms and boasts 3,000 square feet.
> **After:** Gallery 825 is LAAA's exhibition space. The gallery has four rooms totaling 3,000 square feet.

A single "serves as" in an otherwise normal paragraph is fine.

### 3.3 Negative parallelism and tailing negations

"Not only X but Y", "It's not just about X, it's Y", and clipped tailing negations ("no guessing", "no wasted motion") tacked onto sentence ends. Density is the tell: once in a short piece is plenty. Rewrite the fragment as a real clause.

### 3.4 Rule of three

LLMs force triads where the third item is padding or a near-synonym. Real tricolons exist ("life, liberty, and the pursuit of happiness"); only cut when the third item pulls no weight.

### 3.5 Synonym cycling

"Protagonist... main character... central figure... hero" in one paragraph. Pick one term and repeat it. In technical and academic writing, repeating the same term for the same concept is a feature, not a defect.

### 3.6 False ranges

"From X to Y" where X and Y aren't on a meaningful scale ("from the Big Bang to the enigmatic dance of dark matter"). List the actual topics instead.

### 3.7 Ornamental intensifiers

**Delete or downgrade (decoration):** markedly, remarkably, strikingly, dramatically, profoundly, critically, fundamentally, vastly, deeply, exceptionally, significantly (with no test behind it), increasingly (figurative).
**Keep (they carry information):** approximately, slightly, modestly, consistently, almost, only, largely, relatively.

**Decision rule:** delete the adverb mentally; if no information was lost, it was ornamental. And per the ordering rule: removing an intensifier without restructuring the sentence makes the text score MORE AI. Split, merge, or reposition when you cut one.

### 3.8 Passive voice and subjectless fragments

"No configuration file needed." "The results are preserved automatically." Restore the actor when active voice is clearer: "You don't need a configuration file. The system preserves results automatically."

### 3.9 Condensed compounds and loose connectors

- Noun-dash compounds ("the sleep–mood–cognition pathway") → expand: "the pathway linking sleep, mood, and cognition."
- "where" as a non-locative connector ("...support, where daily use was twice as common") → prefer a "with" phrase or a new sentence. "in which" as the default replacement is also a tell.

---

## PASS 4: Style and formatting

- **Em/en dashes:** zero in final output (Hard rule 3). Scan for `—` and `–` before delivering; any hit means the draft isn't done.
- **Boldface:** AI bolds mechanically. Strip most of it; keep bold for genuinely load-bearing terms on first mention.
- **Inline-header lists** ("- **Performance:** Performance has been enhanced...") → collapse into prose or use plain list items.
- **Emojis** decorating headings or bullets → remove.
- **Title Case Headings** → sentence case (unless the document's style guide says otherwise).
- **Curly quotes** → straight quotes in plain-text and code contexts. In word processors and CMSes curly quotes are normal; only a tell when stacked with others.

---

## PASS 5: Filler, hedging, and chatbot artifacts

### Filler

"In order to" → "To". "Due to the fact that" → "Because". "At this point in time" → "Now". "Has the ability to" → "Can". "It is important to note that X" → "X". "In today's fast-paced world..." → delete. "At its core," → delete or restructure.

### Hedging: calibrate, don't strip

LLMs stack hedges ("may suggest... have the potential to confer beneficial effects... in select populations"). The fix is ONE well-chosen hedge per claim, not zero. "These findings suggest the policy may reduce turnover." Direct claims stay direct; uncertain claims keep exactly one cushion. Over-stripped hedging turns honest uncertainty into false confidence, which is its own defect.

### Persuasive authority tropes

"The real question is", "at its core", "what really matters", "the heart of the matter": ceremony before an ordinary point. Cut the ceremony, keep the point.

### Signposting

"Let's dive in", "Here's what you need to know", "Without further ado": announcing instead of doing. Delete and start with the content.

### Fake-candid openers

"Honestly?", "Look,", "Here's the thing:" as theatrical pause-and-reveal hooks. A person being honest just says the thing. (Mid-sentence "honestly" in casual writing is fine.)

### Chatbot artifacts

"Great question!", "Certainly!", "I hope this helps!", "Let me know if you'd like me to expand", "Would you like me to...": correspondence pasted as content. Delete entirely.

### Aphorism formulas

"X is the language/currency/architecture of Y", "X is not a tool but a mirror". Replace the formula with the concrete claim it gestures at.

### Generic positive conclusions

"The future looks bright." "Exciting times lie ahead." End on the last concrete fact, or on the source's actual stated plans. A piece is allowed to just stop.

### Manufactured punchlines

Every sentence landing like a quotable closer is engineered drama. Let most sentences do quiet work.

---

## PASS 6: Personality and soul (register-gated)

Removing AI patterns is half the job. Sterile, voiceless writing is just as obvious as slop. Apply this pass only where the register calls for a human presence: copy, posts, essays, replies, personal writing. Not encyclopedic or reference text (Hard rule 4).

**Signs of soulless-but-clean writing:** every sentence the same shape, no opinions, no acknowledged uncertainty, no first person where it would be natural, reads like a press release.

**How to add voice (sparingly, one or two per section, never inventing facts):**
- Have a reaction, not just a report: "I keep coming back to the second chart."
- Acknowledge mixed feelings: "impressive and slightly unsettling" beats "impressive."
- Use "I" when it fits. First person is honest, not unprofessional.
- Let one aside or self-correction in: "(I wanted to say 'almost' here, but it really was certain.)"
- Be specific about feelings: not "this is concerning" but the actual image that concerns you.

**What not to do:** don't add slang to sound hip, don't force humor, don't inject "I" into third-person contexts, don't overdo it. Forced personality reads as AI trying to sound human, which is worse than neutral.

---

## What NOT to flag (false positives)

A clean human writer can hit several patterns above with no AI involved. Do not gut legitimate prose:

- **Polish.** Perfect grammar and consistent style mean an edited writer, not a bot.
- **Formal vocabulary generally.** AI overuses *specific* fancy words, not all fancy words. Leave "ostensibly" alone.
- **Standard academic connectives.** "Notably," "However," "In contrast," "Taken together," "Although," "Thus": these are hallmarks of good human writing. The distinguishing rule: does the phrase *inflate meaning* (delete) or *make logic explicit* (keep)?
- **Attribution phrases followed by real citations or data.**
- **One em dash in a writer's own sample, one "however," one tricolon, one short sentence.** Isolated signals mean nothing.
- **Curly quotes alone** (auto-inserted by most editors).
- **Quoted or discussed text.** Never rewrite watched phrases inside quotations, titles, proper names, or examples where the phrase is being mentioned rather than used.

**Look for clusters.** A single em dash means nothing; em dashes plus rule-of-three plus "vibrant tapestry" plus a balanced "Conclusion" section is a confession.

**Preserve signs of a real person:** hard-to-fabricate specifics, unresolved tension, era-bound references, defensible first-person choices, genuine asides and self-corrections, natural sentence-length variety. Over-editing these destroys the very thing that makes prose human.

---

## COMPOSE mode: writing copy that is born human

When asked to *write* rather than rewrite (a reply, an email, a post, landing copy, a bio, an announcement), don't generate-then-scrub. Apply the constraints during generation:

1. **Start from specifics.** Before drafting, collect the concrete details available: names, numbers, dates, the actual feature, the actual objection. If you have none and the copy needs them, ask. Specifics are the backbone of human copy; generalities are the backbone of slop.
2. **Say the thing in the first sentence.** No signposting, no throat-clearing, no "In today's...". Copy leads with the claim or the hook, then earns it.
3. **Write with bursty rhythm from the start.** Draft sentences of deliberately mixed lengths. Read the draft aloud in your head; anywhere you'd take a breath mid-sentence twice, restructure.
4. **One hedge maximum per claim, zero em dashes, plain verbs.** The pattern catalog above acts as a generation filter, not a post-hoc cleanup.
5. **Give it a stance.** Copy without a point of view is filler. Decide what the text believes (from the user's brief, never invented facts) and let word choice carry it.
6. **Stop at the end.** No wrap-up paragraph restating what was said, no "Let's build the future together." The last concrete point is the ending.
7. Then run the audit loop below as normal.

For short-form (tweets, replies, subject lines): the tells compress too. Rule-of-three, tailing negations ("no fluff"), fake-candid hooks ("Honestly?"), and aphorism formulas dominate AI short copy. One concrete claim beats three abstract ones.

---

## Process: draft → audit → final

1. **Read the input** (and any voice sample) carefully. Identify the register.
2. **Draft** by running the passes in order: rhythm/structure → content → vocabulary → style → filler/hedging → soul (register-gated). In COMPOSE mode, generate under the constraints instead.
3. **Audit.** Ask three questions and answer them briefly:
   - "What makes this draft still obviously AI-generated?"
   - "Does the draft state any fact, name, number, date, or citation that isn't in the source or from the user?" (A fabrication is a defect even when it sounds more human.)
   - "Did any edit leave choppy, disconnected sentences?" (Check the paragraph cohesion checklist.)
4. **Revise** into a final version that fixes every audit finding.
5. **Mandatory final checks:**
   - **Dash scan:** search for `—` and `–`. Zero allowed (sample override excepted).
   - **Rhythm check:** each paragraph has at least one sentence notably shorter and one notably longer than its average. If all sentences sit within a 5-word band, restructure.
   - **Cohesion check:** every paragraph opens with its claim; every sentence links to the previous by connective or echoed key word.
   - **Read-aloud test:** flag anything that sounds like a press release, that no one would say to a colleague, or that could describe any topic if you swapped the nouns.

## Invocation modes and output

**Pasted text (default).** Deliver: the final rewrite, then a short "what changed" summary. Include the audit bullets only if the user asked to see the reasoning. Keep the summary to the changes that matter; a table works when there are many:

| Pass | What changed | Example |
|-|-|-|
| Rhythm | Broke uniform cadence in ¶2–3 | 21/22/20-word run → 9/31/14 |
| Inflation | Cut significance puffery | "pivotal moment" → deleted |
| Soul | Added one aside, first person | "I'd have shipped this smaller" |

**File mode.** The user points at a file. Run the full loop internally, rewrite the file in place so it contains only the final version. Humanize prose only: leave code blocks, frontmatter, data, and link targets untouched. Report a short summary in the conversation; don't paste the whole rewrite back.

**Embedded mode.** Another task is using this skill as one step of a larger job (a PR description, a commit message, a doc, a chat reply). Run the loop internally and output only the final text. No draft, no audit bullets, no summary.

**Review mode (asked to critique, not rewrite).** Flag specific passages, name the pattern each triggers, suggest concrete alternatives. Consolidate overlapping flags: when several weak signals converge on one phrase (bold + scare quotes + em dash aside), report one stacking tell, not three findings. Verify quantitative claims before making them (actually count the em dashes). Check whether a flagged pattern has a non-AI explanation before reporting it.

## Register notes

- **Marketing/product copy:** stance and specificity carry everything. Shorter is usually more human. Cut every adjective that isn't doing work.
- **Chat replies and email:** match the incoming energy; mirror the sender's formality. One thought per paragraph. Sign-offs stay plain.
- **Technical docs:** plain, active, consistent terminology. Personality lives in example choice and honest caveats, not in jokes. Describe the thing as it is, not as a narration of what changed.
- **Academic:** keep discourse markers dense and logical ("Although", "Thus", "In agreement with previous reports"). Hedge observational claims once, state trial results directly. Passive voice is normal in methods. Semicolons joining related clauses read as human here.
- **Social/short-form:** the concrete detail IS the post. No setup, no moral at the end.

## Reference

Built on [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup) and four open-source humanizer skills: [blader/humanizer](https://github.com/blader/humanizer), [jpeggdev/humanize-writing](https://github.com/jpeggdev/humanize-writing), [ankshvayt/humanizer](https://github.com/ankshvayt/humanizer), and [matsuikentaro1/humanizer_academic](https://github.com/matsuikentaro1/humanizer_academic) (source of the rhythm-first experimental finding).

Key insight from Wikipedia: "LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely result that applies to the widest variety of cases." Humanizing is the reverse operation: put back the specificity, rhythm, and judgment that averaging removed.
