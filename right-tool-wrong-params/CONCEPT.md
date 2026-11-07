# Right Tool, Wrong Parameters — Instagram Reel (9:16)

**Format:** 1080×1920, 30 fps, ~46 s · light editorial style · burned-in captions (works muted)
**Voice:** Microsoft Edge TTS, `en-US-AvaNeural` (free), +6% rate

| # | Visual | Voiceover |
|---|--------|-----------|
| 1 | Serif headline types in: "A quiet way to *hijack* an AI agent." | Here's a quiet way to hijack an AI agent. |
| 2 | User chat bubble: "Send $500 to Sam" | You ask it to send five hundred dollars to Sam. |
| 3 | `transfer_funds(amount, to, memo)` card + "✓ Right tool" "✓ Right steps" chips | It picks the right tool, and follows the right steps. |
| 4 | A message the agent read slides in; a hidden comment lights up red, a wire draws to the `to` row, digits scramble 4821 → 5512 | But a hidden line in a message it read swaps one detail: the account number. |
| 5 | "Right tool. *Wrong* parameters." + "$500 → attacker ••5512" | Right tool. Wrong parameters. The money goes to the attacker. |
| 6 | "AuthorityFlow": each parameter gets a source tag (FROM: YOU ✓ / FROM: INBOX ✗), BLOCKED stamp | A new paper proposes a defense called AuthorityFlow. For every parameter, it asks: where did this value come from? And does that source have the authority to set it? |
| 7 | Big counter 93.06% → 9.03%, two bars | On one model, attack success fell from ninety-three percent, to nine. |
| 8 | "Task completed ≠ *intent* respected." | Because an agent finishing your task isn't the same as doing what you meant. |
| 9 | End card: title, arXiv link, "Save for the weekend ↓" | The paper: Right Tool, Wrong Parameters. Save it for the weekend. |

## Rebuild
```
pip install edge-tts         # only to regenerate voice clips in audio/
node render.js               # needs playwright + ffmpeg → right-tool-wrong-parameters.mp4
node render.js --stills 5,20 # preview single frames
```
Open `index.html` in a browser for a live (silent) preview.
