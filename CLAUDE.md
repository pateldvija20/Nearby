# Nearby — project brief for Claude Code

Portfolio case study by Dvija Patel (Product & UX designer). Read this first, then `nearby.md` (decision log, tasks) and `README.md`.

## What Nearby is
A food & drink diary + wishlist where crawls are guilt-free walks. Target user: the foodie who wants to reach a fitness goal and uses food as the motivation. Loop: save a place or dish -> build a food crawl (walk linking stops) -> walk it -> finish as a diary page / story. Steps are a quiet goal; food is the reward. Never measure her against anyone else, never calorie-first (calories are opt-in).

Scope: mobile only, MVP loop around Crawls. Research is desk research only (no interviews or usability tests). Deliverables: polished Figma case study + clickable Figma prototype (no code, no backend). Brand feel: editorial foodie + scrapbook journal + playful; Dvija builds the moodboard herself.

## Working agreement
- Dvija makes the design decisions. Claude facilitates and leads the process.
- Per flow: Claude lists the flow and its sub-screens -> Dvija audits and adds changes -> Claude builds. When asking which flow to do next, always list the flow's sub-screens.
- Execute drafts without unsolicited analysis unless it bears directly on her decisions.
- Confirm understanding and present a plan before building anything big. Ask choices through the question widget.
- After each session add one line to `nearby.md` notes: decided / rejected / why.
- Hi-fi, editable, component-based builds. No wireframes except the black-and-white boilerplate described below.

## Figma
- File: Nearby, key `MAABKnUzZeUcHxZaz8Xa2b` (https://www.figma.com/design/MAABKnUzZeUcHxZaz8Xa2b)
- Account: pateldvija73@gmail.com, Education plan Full seat (200 MCP calls/day, 10/min cap). Call `whoami` first in any session and confirm the email and seat before writing.
- Always load the figma-use skill before `use_figma`, and figma-generate-design for visible design work. Fonts used on the competitor pages: Inter. Existing frames use background #0B0B0B, white text, grey #B8B8B8, accent red-orange (~#DB452B).
- Gotchas: `combineAsVariants` needs COMPONENT nodes; build nested structures with `createFrame()`; switch pages with `setCurrentPageAsync` once per call; each `use_figma` call resets the page context.
- Pages now: `00 — Components`, `01 — App map`, `03 — Competitors · Maps & takeaways`, `04 — Competitors · Flow analysis` (empty, for benchmarking), `99 — Archive`. Page 02 (Brand analysis, 12 per-competitor profiles) was removed on 2026-10-16; restore from Figma version history if needed.
- Flow diagrams use components `Flow node` (Type = Screen/Modal/Popup/Check/State/Flow) and `Path label` (Happy/Alt/No/Back). FigJam flow board key: `hsVg0GWK4Ws62A7nw7Ez11`.
- Local: `reference/nearby-tokens.json` (W3C DTCG tokens), `reference/nearby-figma`, `reference/nearby-case-study.md`.

## Competitive analysis (done, 2026-10-16)
Goal: find where food-discovery, fitness and diary apps fall short for the guilt-free foodie, to set positioning and MVP scope.
Built one page: frame "Competitor analysis · Coverage matrix (one page)" (node 129:2, page 03). 8 apps x 6 journey steps (discover, save, plan a walk, get moving, remember, food as reward), a "falls short for her" column, and a table-stakes / differentiator / avoid strip. Apps: Beli, Mapstr, Google Maps, Strava, AllTrails, Wanderboat AI, MyFitnessPal, Nearby.
Finding: nobody covers steps 4-6 together; step 6 (food as reward) is empty for every competitor. The coverage ratings are Claude's judgment from general knowledge, not hands-on testing: verify before publishing.
Older frames on page 03 (affinity map for brand vibe, plan↔remember 2x2, 3 takeaways) are superseded; the affinity map belongs to the moodboard step.

## Current task: benchmark one flow, then build it
Flow chosen: **Build a crawl**. Sub-screens: 1 Entry (Home CTA) -> 2 Intent (prompt/vibe, area, time or step goal) -> 3 Suggested stops (list + map) -> 4 Edit crawl (add/remove/swap/reorder) -> 5 Review route (distance, steps, time, preview) -> 6 Save or start. See `nearby.md` for the detailed C-flow decisions and checks D1-D3; those take precedence over this summary.
Apps to benchmark: Strava (route builder, start/finish), AllTrails (route preview card), Google Maps (multi-stop walking, reorder), Wanderboat AI (prompt-to-itinerary).
Steps:
1. Benchmark on page 04: step-by-step comparison across the four apps; per step: observations + borrow / skip / question for Nearby. Mark anything unverified.
2. Define the flow in Dvija's template (Screen name / User task / User inputs / System response, plus decision diamonds). She audits.
3. Dvija sends a sketch. Claude builds a black-and-white boilerplate (grayscale only, existing spacing/type tokens, components for repeats).
4. Add clickable interactions and empty / loading / error states. Review loop.

## Mobbin (benchmark source)
- Dvija is logged in on Chrome. Free tier shows flow names but blurs flow screens; the student Pro plan (about $22 for 3 months) unlocks them.
- On Mobbin: Strava (709 screens, 188 flows incl. "Creating a route", "Creating a route (manual mode)", "Saving a route", "Route detail", "Saved routes"), AllTrails, Google Maps. Not on Mobbin: Wanderboat AI, so use Dvija's own screen recordings for it.
- MCP (unverified, needs Pro): `claude mcp add --scope user --transport http mobbin https://api.mobbin.com/mcp`, then sign in with `/mcp`. Options go before the server name.

## Open questions
- Time per stop: fixed vs editable (from nearby.md).
- Whether to rename pages so numbering closes up (03 -> 02, 04 -> 03).
