# Pulse Ball — Level Design Rules

This document is the gameplay source of truth for campaign difficulty and future levels.

## Core rule

Difficulty must increase through **mechanic combinations, enemy pressure, route reading and timing** — never through broken geometry, frame-perfect mandatory jumps or unclear routes.

A difficult section is valid only if a player who understands the mechanic can complete it consistently.

## Fairness budget

For mandatory traversal:

- Static jump routes should keep a visible landing margin; do not tune required jumps to the absolute physics limit.
- Mandatory moving-platform landings must remain reachable in the **worst relevant platform phase**, unless a bridge/orb/switch intentionally replaces that route.
- Boost -> moving-platform chains should normally retain at least ~25 px of landing overlap in late-game worst-case geometry.
- Earlier late-game sections should be more forgiving (~40–55 px); later sections may tighten toward ~25–35 px.
- Relay activation must not require a single-frame Pulse input. The player should enter a readable activation window.
- Checkpoints must never respawn the player inside immediate enemy/spike contact.
- Collectible stars may be harder than the main route, but they still must be consistently reachable without physics exploits.
- Difficulty should come from decisions and combinations, not hidden collision quirks.

## Campaign escalation

### Levels 1–3 — Fundamentals
Teach movement, jump, Pulse, breakables, crates, switches, plates, bridges and simple enemies. Large safety margins.

### Levels 4–6 — Momentum
Add Boost Pads, vertical routes, ramps/slopes, longer sequences and more enemy pressure. The player learns to preserve momentum.

### Levels 7–9 — Resonance / combat
Introduce Relay chains, spikes, Charger and Heavy enemies. Difficulty comes from mixing traversal and combat, not longer raw gaps.

### Level 10 — Orb introduction
Teach Energy Orb -> Receiver as a clear, readable mechanic.

### Level 11 — Controlled combinations
Orb, Boost, Relay, moving platforms and enemy pressure begin to overlap. Still generous enough that the player can learn the combined language.

### Level 12 — Multi-stage Pulse routing
More orb gates and chained traversal. The player must read several mechanics ahead, but mandatory landings stay reliable.

### Level 13 — New threat / flow reset
Introduce the Drone as a vertical threat and emphasize slopes/flow. Difficulty rises through a new attack axis rather than tighter jumps.

### Level 14 — Timing
Boost + moving platform + Relay sections become more timing-sensitive. The route must remain reachable in the platform's bad phase.

### Level 15 — Technical synthesis
Crate, ramps, Orb, Boost and Relay coexist. The challenge is choosing and executing the correct mechanic sequence. No pixel-perfect jumps.

### Level 16 — Pressure
Higher combat density and shorter recovery windows. Moving-platform margins may be smaller, but still positive and repeatable.

### Level 17 — Endurance
Longer mixed sequences, multiple Drones and repeated mechanic switches. Hard because the player must stay consistent over time, not because any one jump is unfair.

### Level 18 — Final exam
Use the full vocabulary: Boost, Relay, Orbs, ramps, crate/switch logic, enemy mix and hazards. Every mechanic should feel familiar; the difficulty comes from combining them cleanly.

## Future levels 19+

Every new 3-level chapter should follow:

1. **Introduce** one new enemy, mechanic, terrain behavior or rule in a safe context.
2. **Develop** it together with one or two established mechanics.
3. **Master** it in a set-piece that mixes several systems.

Do not increase difficulty by only:
- widening gaps;
- shrinking platforms;
- increasing enemy count;
- adding more spikes;
- hiding the intended route.

Instead increase:
- mechanic interaction;
- timing choices;
- enemy/terrain interaction;
- alternate star routes;
- sequence length;
- recovery decisions;
- risk/reward.

## QA gate for every late-game level

Before a level is considered finished:

- complete it from a clean save;
- complete all mandatory moving-platform jumps repeatedly;
- verify each checkpoint is safe;
- verify every star is reachable;
- verify no static/moving geometry visually merges into an unreadable object;
- verify mobile touch controls can perform the same route;
- verify a failure feels attributable to player input, not geometry or timing randomness.
