# NEARBY → Figma build guide

Everything this toolkit generates lands as **native, editable Figma layers** directly inside
`INVT.RSVP - Copy`. Nothing is an image. All colors are bound to real Figma variables.

## One-time setup (2 minutes)

1. Open `INVT.RSVP - Copy` in the Figma **desktop app**.
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Choose `nearby-figma/plugin/manifest.json`.
4. The plugin appears as **NEARBY Builder** under Development.

## Running a chunk

1. Copy the contents of one `runs/run-X-*.code.js` file.
2. Paste it into `plugin/code.js` (replace whatever is there) and save.
3. Run: **Plugins → Development → NEARBY Builder**.
4. Wait for the "done" toast. Verify in the file, then move to the next run.

Dev plugins re-read `code.js` on every invocation, so you never need to re-import.

## Run order (verify between each)

| Order | File | Builds |
|---|---|---|
| 1 | `run-a-structure-vars.code.js` | Pages 00–99, variable collections (Primitives + Semantic, dark-only), text styles, Cover & Read Me page |
| 2 | `run-b-foundations.code.js` | Foundations boards: brand concept, heat layer, primitives, semantic table, theming, type scale, spacing, radius, usage rules, voice |
| 3 | `run-c-components-1.code.js` | Component sets: Buttons, Chips, Badges, Inputs, Controls |
| 4 | `run-d-components-2.code.js` | Component sets: Avatars, Place Cards, List Rows, Map Pins, Navigation, Feedback |
| 5 | `run-e-mobile-flows-ab.code.js` | Mobile 390×844 — Flow A (Onboarding, 6) + Flow B (Discovery, 6) |
| 6 | `run-f-mobile-flows-cde.code.js` | Mobile — Flow C (Itinerary, 5) + Flow D (Social, 4) + Flow E (Utility, 3) |
| 7 | `run-g-web.code.js` | Web 1440 — W1 Landing … W6 Partner dashboard |
| 8 | `run-h-exploration-archive.code.js` | Exploration boards, Source Refs placeholders, Archive |

All runs are idempotent-ish: pages/collections/variables/styles are found-or-created,
so re-running a chunk refreshes rather than duplicates variables.

## Notes

- Fonts: Archivo / Instrument Sans / JetBrains Mono are used when available; the plugin
  silently falls back to Inter so nothing ever breaks. Install the three Google Fonts
  locally for exact fidelity.
- Your existing `Components` and `Screens` pages are left untouched. When you're happy
  with the new structure, drag them into `99 Archive` yourself.
- Paste INVT.RSVP originals into `06 Source Refs` manually (copy-paste between tabs).
- `tokens/nearby-tokens.json` is a bonus Tokens Studio import if you prefer that route
  instead of Run A's programmatic variables (don't do both).
- Existing page named `00 Cover & Read Me` is only created once; re-running Run A
  rebuilds its content frame — delete the old content frame first if you want it clean.
