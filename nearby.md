# Nearby

**Status:** Active · **Rank:** 1 · **Kind:** Product · **Sector:** Consumer · **Effort:** 2.0 weeks

> Turns a prompt into one evening's route of nearby events and places.

## Next step
Discovery day Oct 8; design sprints 2-3: Oct 16 to Oct 23, 2026

## MVP
Prompt to one evening's route: mixed events + places, stop detail, time-based states. Cut: real APIs, coded build.

## Build
Figma prototype (no code).

## Deliverables
Figma prototype, walkthrough video, case study, X posts.

## References
Luma, Partiful, Beli, Citymapper

## Notes
2026-10-07: Scoped + tasked Oct 7. Habit: after each session, one line in notes: decided / rejected / why.

2026-10-13: Discovery session. Decided: pivot to food & beverage only, a diary + wishlist where crawls are walks; user picks the number of stops (no default), step goal, place type, F&B type, and source (wishlist or surprise me); mood quiz, goal and dish picks are required; swap any place or dish before starting; a stop completes with a photo of the chosen dish; the walk ends in an Instagram story; calories opt-in. Rejected: events, ticketing, fixed 2-3 stops. Why: discovery of new menu items is what leads, and walking makes it guilt-free.

2026-10-13 (2): Decided: dish sold out → swap at the stop; finishing a crawl earns an achievement (coupon-like); unfinished crawls still count steps toward the goal, no penalty; connect Apple Health; route shape asked in setup (loop / A→B / surprise me); stop-count options limited by radius. Next: map the full app flow, count screens per flow, design in batches starting with the core loop.

2026-10-14: Moved to Figma; Paper dropped. Flow states live in FigJam (hsVg0GWK4Ws62A7nw7Ez11). Process per flow: Claude lists screens → Dvija audits → Claude builds. Built 'C · Build a crawl' v1: mood quiz merged into setup (C1), time commitment + start time added, regenerate whole crawl from C3 and C7, swaps/doesn't-fit are modals, decision diamonds D1–D3. Open: time per stop fixed vs editable.

2026-10-14 (2): Flow diagrams now live in the Nearby design file (MAABKnUzZeUcHxZaz8Xa2b, page '1 — Page'), built from components: 'Flow node' (Type = Screen/Modal/Popup/Check/State/Flow; props Label/Title/Task/Inputs/Show body) and 'Path label' pill (Happy/Alt/No/Back). Build a crawl v2 rebuilt there in the dark, reference-inspired style.

2026-10-14 (3): Walk flow v1 built in Figma (W1 Walk map, W2 Arriving, W3 Stop check-in, W4 Dish sold out, W5 Moment, W6 End early, W7 Running late; checks D4–D7). Assumed, pending Dvija: D5 trusts the photo (no dish recognition); W7 in MVP; skipping a stop continues but the crawl ends as unfinished (F2).

2026-10-14 (4): Big map 'Nearby — App map' in Figma (flows connected screen-to-screen). Walk v2: pause + auto-resume, 'Lingering?' → info nudge (no time policing). Rules: complete = step goal reached (reaching all stops implies it); goal not reached → unfinished, no badge/coupon, steps still count, ask user keep/discard diary entry; skipped stops → complete + badge but no coupons; coupons need dish photo verified vs menu-item photo (no match still counts the stop).

2026-10-14 (5): Full app map built in Figma 'Nearby — App map': spine Onboarding → Home → Build a crawl → Walk → Finish + story (connected screen-to-screen), tabs Map · Diary (entries + wishlist) · Profile, System states. Decisions: steps count from Start walk; guest until first crawl (taste/diet/goal collected in first C1, sign-up at end of first crawl); tabs Home(discovery) · Map(Explore default, toggle Mine) · Diary(wishlist + entries) · Profile; wishlist = places + dishes; 3 story templates; coupon = one per crawl, only if every stop visited + every dish photo matched, from a place on the crawl, used on a later crawl there, code + expiry; app closed ends crawl; abandoned crawl keeps running + reminder notification.

## Local files
- `~/Downloads/nearby-case-study.md`
- `~/Downloads/nearby-figma` (folder)
- `~/Downloads/nearby-tokens.json`
- `~/Projects/Portfolio - 2 /public/assets/projects/nearby.png`

## Open tasks (14)

### Phase 0 Discovery
- [ ] Discovery · Scope: one-liner, core bet, kill list, MVP (what ships vs what's cut), hero magic moment (due 2026-10-08, ~1.5 h) — Oct 8: one discovery day per project, then design-only sprints · 2026-10-09: carried over
- [ ] Discovery · Research: one-page teardown (Luma, Beli, Citymapper, Google Maps lists) + 3 citable demand points (due 2026-10-08, ~2 h) — Oct 8: one discovery day per project, then design-only sprints · 2026-10-09: carried over
- [ ] Discovery · Concept: user + trigger moment, core flow, screen inventory, mark the 5 hero screens (due 2026-10-08, ~1.5 h) — Oct 8: one discovery day per project, then design-only sprints · 2026-10-09: carried over

### Phase 2 Design
- [ ] Gather visual references, name the system, two style tiles on the same screen, pick one (due 2026-10-19, ~2.5 h) — imported from Notion export
- [ ] Build foundations (tokens, type, spacing, radius, dark/light) incl. what the language does on a map surface (due 2026-10-19, ~2.5 h) — imported from Notion export
- [ ] Component library incl. empty / loading / error / stale as real components (due 2026-10-20, ~3 h) — imported from Notion export
- [ ] Design the hero flow: prompt → generation → route → stop detail (due 2026-10-21, ~3 h) — imported from Notion export
- [ ] Design the remaining loop screens (due 2026-10-21, ~3 h) — imported from Notion export
- [ ] Design edge + time-based states (due 2026-10-22, ~2.5 h) — imported from Notion export
- [ ] Wire the Figma prototype (due 2026-10-22, ~2 h) — imported from Notion export

### Phase 3 Case study
- [ ] Record the prototype walkthrough (60-90 s video + hero-moment GIF) (due 2026-10-22, ~1.5 h) — imported from Notion export
- [ ] Write the story from the decision log: problem, bet, rejected options, outcome (due 2026-10-23, ~2.5 h) — imported from Notion export
- [ ] Lay out the case study in the shared boilerplate, export visuals (due 2026-10-26, ~3 h) — Oct 7 scoping
- [ ] Publish the case study; fill case_study_link and figma_link (due 2026-10-26, ~1 h) — Oct 7 scoping

## Skipped (28)
- ~~Write the one-liner (no adjectives), the core bet, the kill list and the magic-moment hypothesis~~
- ~~Name the core bet — the one thing that must be true~~
- ~~Write the kill list: what Nearby is NOT~~
- ~~State the magic-moment hypothesis in one line~~
- ~~Decide: one crawl mixes events + places, or user picks a type up front~~
- ~~Teardown events: Luma, Partiful, Eventbrite, Dice (add a 'how do they handle time?' row)~~
- ~~Teardown places + routes: Google Maps lists, Beli, Thatch, Strava, Citymapper (time row)~~
- ~~Teardown Route/session: Strava, Citymapper~~
- ~~Teardown curated local: Resy/Infatuation, city newsletters (time row)~~
- ~~Add a “how do they handle time?” row to every teardown~~
- ~~Collect 6–8 citable demand data points, keep a sources doc~~
- ~~Define primary user segment + trigger moment~~
- ~~Catalog flows worth borrowing + write the positioning line vs each competitor~~
- ~~List boring-but-necessary features (permissions, auth, sold out, cancelled, passed, closed, offline, share)~~
- ~~Write the positioning line vs each competitor~~
- ~~Pick 1 hero magic moment + 2 supporting~~
- ~~Build the screen inventory (purpose, primary action, states) and mark the 5 magic-moment screens~~
- ~~Mark the 5 screens that carry the magic moments~~
- ~~Two style tiles on the SAME screen, pick one~~
- ~~Decide what the visual language does on a map surface~~
- ~~Set up React + Vite + Tailwind, tokens as CSS variables~~
- ~~Deploy empty to Vercel (night one)~~
- ~~Decide the map approach: MapLibre vs stylized static~~
- ~~Author mock data: one neighborhood, one specific evening~~
- ~~Build shell + nav~~
- ~~Build the hero flow~~
- ~~Build the remaining loop~~
- ~~Motion + polish pass~~


_Exported from the Job Pipeline database (projects / project_tasks) on 2026-10-12._
