# Nearby — A Local Event Discovery & RSVP Platform

**Role:** Solo Product & UX Designer — brand system, information architecture, and every core user flow
**Team:** Small team; engineering handled independently. Product and UX ownership was mine.
**Status:** Concept project, not shipped — no live users, no metrics
**Tools:** Figma (design system, brand components, UI-experimental design), Claude Design (rapid prototyping), Claude Code (development), Notion (planning)

---

## The Problem

Local event discovery has no shortage of players — Luma, Partiful, Eventbrite, and Meetup all solve the basic loop of "find an event, RSVP to it." But that basic loop is also all most of them offer. They're built for scale and city-wide browsing, not for the independent host: the farmers-market vendor setting up a stall for a Saturday, the bar running a weekly bingo night, the solo musician announcing a gig. These hosts don't need a citywide directory. They need a way to be found locally, look distinct from every other listing on the page, and actually know who's showing up.

## The Stakes

Without a visual identity and a system that scales from an individual poster-a-week host to an actual business, Nearby would read as a commodity clone of the apps already crowding this space — just another RSVP form with no reason for a host to invest time building a following on it, and no reason for an attendee to trust it over something they already use.

## Who It's For

Nearby has four distinct users, each with a different relationship to the same event:

- **Attendee** — discovers events, RSVPs, holds tickets and unlocked offers
- **Host** — the entity attached to a specific event; a single business profile can run many events
- **Business Profile** — the account layer above Host, with access to event management, ticket and offer-redemption analytics, and settings across every event it runs
- **Logistics / Door Staff** — bartenders and event-floor staff with access to ticket scanning and offer-redemption confirmation in real time

Designing for four roles inside one system — rather than just "host" and "guest" — was the core information-architecture challenge underneath almost every screen.

## My Role

I owned the brand system and every product surface end to end: discovery and map, event creation, ticketing, the offer/redemption system, RSVP and confirmation flows, MyEvents, user profile, business profile, event management, and the analytics dashboard. My job wasn't just to design individual screens — it was to continuously reconcile what businesses needed to run and grow their events against what kept the actual attendee experience simple, fast, and worth opening the app for.

## Process & Key Decisions

**Discovery: rejecting the feed, rejecting the city grid.**
An endless list of events was the easy default, and it was the first thing I ruled out — it doesn't reward a user for opening the app more than once. My first instinct was to look at how bigger platforms solve this: most of them segment by city. But Nearby is scoped as a single-city MVP, so city-based segmentation would have organized a list of exactly one thing. Instead, I built the homepage around four sections — this week's most relevant local events, interest-based filtering (sports, music, food, and so on), a host spotlight, and a general explore stream — paired with a map that lets people search by location as well as interest.

That map-plus-interest structure is also what seeded **Crawls**: curated, location-based routes through multiple events in one night (a bar crawl, a gallery walk, a food-and-music night), designed as a natural extension of the same discovery logic rather than a bolt-on feature.

**Ticketing: solving a tracking problem, not just a checkout problem.**
Hosts had no reliable way to know who was actually coming to their event or validate attendance against RSVPs — there was no source of truth. Ticketing was designed primarily to close that gap: QR-based check-in, tiered ticket types, and promo/discount support all exist to make the ticket itself the record of who showed up, not just a formality before the door.

**Offers: a flexible mechanic, not a fixed feature.**
Every type of host wanted a different kind of incentive — a bar wants "first drink free," a vendor wants "10% off if you RSVP," a band wants nothing at all. Rather than build one fixed offer type, I designed offers as a standalone mechanic that can attach to any event or stand alone, giving hosts flexibility to define their own hook while giving the business layer redemption data to see which offers actually convert attendees and which don't.

## Key Insight

Midway through scoping the business-facing side of the product, the honest tension became: a 0→1 product cannot sequence mature features ahead of basic engagement. Business analytics, growth tooling, and an AI-driven Crawls recommendation engine are genuinely valuable — but none of them mean anything until the core loop (discover → RSVP → show up) is proven with real users. Designing analytics for events that don't have attendees yet is designing for a hypothetical.

## Turning Point

That insight reordered the roadmap. Discovery, RSVP, ticketing, and offers were treated as the MVP core — the features that had to work first, because they're what earns a host's trust and an attendee's repeat visit. Crawls and the deeper analytics dashboard were scoped and designed, but explicitly as validation-stage and future-facing work, not as day-one requirements.

## Solution

The system spans:
- **Discovery & Map** — interest-based homepage sections, host spotlight, and location-based search
- **Event Details, RSVP & Confirmation** — including calendar sync, notification opt-in, and a post-RSVP "get ready" state
- **Ticketing & Offers** — QR-based tickets, tiered pricing, and a standalone/attachable offer system with a live door-staff redemption flow
- **MyEvents & Profile** — a personal wallet of upcoming events and tickets
- **Event Creation** — a four-stage host wizard (details, settings, perks, business info)
- **Business Dashboard & Analytics** — event management, attendee and redemption metrics, and top-performer rankings across a host's events

## Outcome

Nearby is an unshipped concept project. It has not been tested with real users, and there are no usage or business metrics to report — that's stated plainly rather than implied otherwise.

## Reflection

The hardest part of this project wasn't any single screen — it was resisting the pull to design every mature feature just because it was easy to imagine. It's genuinely easy to sketch a whole system: analytics, growth tools, AI-driven recommendations. It's much harder to sit with the discipline that a 0→1 product should prove its most basic loop before it earns the right to those features. If I did this again, I'd push earlier for a scrappier, testable version of the core discovery-to-RSVP flow before designing anything downstream of it — because a feature like Crawls or business analytics is only as good as the user base it's built to serve, and a one-sided, founder's-eye MVP doesn't validate that user base exists.
