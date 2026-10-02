# Player artwork and rendering

The existing embedded menu mascot is the identity reference: dark blue armor,
cyan inlays, two turbine modules, and the same three-quarter face. The previous
procedural circle renderer is replaced by transparent artwork derived from that
mascot. All eight original embedded WebP images remain unchanged.

## Production assets

Five 192 × 192 transparent WebP images live in `assets/player/` (63,954 bytes total):

| File | Expression and use |
| --- | --- |
| `hero-confident.webp` | Neutral, running/focused, boosted/determined, Pulse and Super Pulse |
| `hero-happy.webp` | Stars, checkpoints, health pickups, victory |
| `hero-scared.webp` | Fast downward flight |
| `hero-hurt.webp` | Brief reaction to damage |
| `hero-defeat.webp` | Defeat |

The built-in image generation tool edited the existing mascot reference. The
generation brief removed only the exterior energy trail and floating fragments,
retained the recognizable armor, turbines, proportions, eyes and lighting, and
required a transparent background with clean edges and no text. Expression edit
briefs retained this same shell and changed only the eyes and mouth: a happy
smile, widened worried eyes, a brief damage wince, and a disappointed expression.
These are summaries of the generation briefs, not verbatim prompt transcripts.
1254 × 1254 working masters were reduced to 192 × 192 WebP at quality 90 with
alpha quality 100. Large working masters are not shipped.

## Rendering and scope

The renderer prewarms ten cached canvases (five expressions × two directions).
Every expression shares the confident shell; only clipped face areas use the
alternate artwork, preventing changes to the body between expressions. The
face stays upright and mirrors with facing direction. The visible spherical
core matches the original 44-pixel diameter; turbine modules extend beyond it.
The physical radius remains 22.

The player uses one sprite draw per frame and a cached contact shadow. Shield
and charged Super Pulse use peripheral arcs; the original opaque effect fills
over the face are removed. There are no new runtime dependencies, per-frame
canvas allocations, image filters, or real-time 3D rendering.

Expression state is separate from the engine in a WeakMap. Loading is bounded
to four seconds per parallel image request; unavailable expressions use the
confident art, and unavailable base art uses the original embedded mascot.

Physics, controls, levels, collision, lives, ability mechanics, advertising,
and the Yandex SDK are unchanged. The SDK and engine inline scripts were
compared byte for byte with main at
`5cc0ef64b8b1c75c8662ce2db1e1a5b56e8b854d`.

## Validation

Install development dependencies and a Playwright Chromium browser, then run:

```sh
npm install
npx playwright install chromium
npm run test:player
npm run build:yandex
```

The browser test checks event expressions, isolated player pixels, clear faces
under shield/Super overlays, gameplay state isolation, bounded sprite caches,
restart, level transition, stalled image requests, and JavaScript errors.
The release builder copies the player assets and validates ES5 output.

Additional local visual QA covered desktop, mobile landscape at 844 × 390 with
DPR 2, portrait pause, all 18 level renderings, keyboard/touch input, real engine
events for pickups/damage/shield/Super/win/loss, result buttons, and release boot.
CPU-throttled browser measurements used a 6× slowdown; these measure CPU draw
submission time, not full GPU frame rate or performance on a physical weak
Android device. Live Yandex advertising and SDK services were not exercised.
