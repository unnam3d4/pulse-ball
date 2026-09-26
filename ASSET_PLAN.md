# Pulse Ball — Asset Plan

This file separates **Yandex Games catalog requirements** from **internal game/menu art**.

## 1. Required / catalog-facing Yandex Games assets

These are uploaded in the Yandex Games Developer Console.

### Icon
- 512 × 512 px
- PNG
- No game HUD or Yandex UI
- Bright, simple silhouette
- Use the Pulse Ball hero as the only focal character
- No tiny text

Target composition: close-up of the blue Pulse Ball, happy/determined expression, cyan energy arc, bright yellow/teal background.

### Maskable icon
- Same hero identity
- Keep all important content inside the central circular safe zone
- No text

### Cover
- 800 × 470 px
- PNG
- No game HUD
- Use real game visual language: hero + terrain + stars + Pulse energy
- No fake gameplay claims

Target composition: hero moving right, sunny colorful landscape, one Relay/Boost visual, stars leading toward the route.

### Hero Image
- 1560 × 520 px
- PNG or JPG
- Wide composition with safe central subject area

Target composition: Pulse Ball on the left/center, bright multi-biome landscape stretching to the right, no tiny text.

### Screenshots
For every selected platform:
- Capture target: at least 2 screenshots
- Landscape 16:9 for our build
- Long side 1280–2560 px
- JPEG or 24-bit PNG
- Real gameplay must occupy at least 70% of the image

Recommended capture set:
1. Early bright level — jumping + stars
2. Boost + Relay chain
3. Energy Orb + receiver
4. Late-game enemy/vertical sequence

Do not use the browser/system UI in screenshots.

### Horizontal gameplay video
- Required field in the current draft flow
- 16:9 MP4
- Up to 28 seconds
- Height at least 400 px

Recommended edit:
- 0–5 s: movement / jump
- 5–10 s: Pulse breaks block / pushes object
- 10–16 s: Boost + Relay
- 16–22 s: Energy Orb
- 22–28 s: fast late-level sequence + finish

### Optional vertical promo
- 9:16 MP4
- Up to 28 seconds
- Height at least 400 px

---

## 2. Internal menu/game assets — current implementation

The approved menu background, hero illustration and six chapter thumbnails are already embedded in `index.html` as WebP data URLs. Gameplay objects use Canvas drawing; the existing hero drawing is cached as two facing sprites. UI symbols are inline SVG/CSS. No external `assets/` tree is required or planned for this release.

Preserve the current art and menu hierarchy. The release ZIP contains only `index.html`. Catalog exports are separate deliverables, not replacements for the working embedded assets.

---

## 3. Main menu product structure

Main screen:
- Hero + game title
- One dominant **Play / Continue** button
- **Choose level** button
- **Settings** gear
- **How to play**
- Progress / stars summary

Settings:
- Language: **Русский / English**
- Sound: On / Off
- Fullscreen
- Controls / Help

Do not add:
- Exit button
- useless controls
- fake ad buttons
- social links
- third-party account login

Language is auto-detected through the Yandex Games SDK at launch. Manual language switching is an additional convenience only.

---

## 4. Advertising plan

### Fullscreen/interstitial
Call only after a deliberate player action and outside active gameplay:
- level transition after completion
- occasional retry after repeated losses

Never call from a blind timer during real-time gameplay.

### Rewarded video
Primary placement:
- Loss screen
- Clear label that this is an ad
- Reward: continue from checkpoint/start with 3 lives

The reward is granted only after the SDK rewarded callback.

Keep the existing voluntary continue placement. No additional reward placements or economy are part of this release.

### Sticky banner
- Use the Yandex API-controlled sticky banner; do not draw or reserve a fake ad slot inside the game
- Keep the sticky banner enabled in menus and during normal gameplay
- For mobile landscape, configure the banner **On the right** in the Developer Console
- Hide the banner while fullscreen/rewarded ads are open, then restore it after the ad closes

---

## 5. Final capture plan

Capture from the final release candidate at 1280 × 720 or 1920 × 1080. Use real play, original object positions and the normal HUD. Do not composite extra enemies, pickups or mechanics into gameplay screenshots/video. Desktop and mobile captures must show their respective real controls. Keep browser chrome and test tools out of exports.

| Asset / shot | Existing moment to use |
| --- | --- |
| Icon | Existing blue hero identity, large readable face, simple cyan/yellow field; no HUD or tiny text. Export the approved artwork, do not invent a different character. |
| Cover | Composition based on the real level 7 Boost/Relay section at x≈6990–7790; hero, stars and existing terrain. Use approved game art rather than a raw HUD screenshot. |
| Early screenshot | Level 1 x≈1180–1500: bright landscape, jump and two platform stars. |
| Movement screenshot | Level 6 x≈19900–20920: Boost, elevated landing and moving-platform continuation. |
| Orb screenshot | Level 12 x≈12550–13900: final orb, patrol/heavy lane, receiver and the bridge it activates. |
| Final screenshot | Level 18 x≈17500–18350: Boost, Drone, moving platform, Relay and breakable obstacle. |
| Ending shot | Actual level 18 finish and localized campaign-complete result. |

Horizontal video, up to 28 seconds: 0–5 s level 1 movement; 5–10 s Pulse/crate/switch; 10–16 s level 6 or 7 Boost/Relay; 16–22 s level 12 Orb lane; 22–28 s level 18 traversal and finish. These are recommended capture moments, not finished media. Record successful, readable gameplay; avoid frantic cutting or fake camera moves that imply unavailable gameplay.

Required before moderation: export and inspect the 512 × 512 PNG icon, 800 × 470 PNG cover, real landscape screenshots and 16:9 MP4 gameplay video. Maskable icon, showcase cover and vertical video are additional supported fields. Target at least two strong screenshots for each selected platform; the current documentation specifies dimensions/formats rather than a universal minimum count. Confirm mandatory fields in the actual Console draft.

Official specifications checked on 2026-09-26: [Draft media fields](https://yandex.ru/dev/games/doc/ru/console/add-new-game/draft), [truthful gameplay materials](https://yandex.ru/dev/games/doc/ru/concepts/requirements). Catalog exports/upload and real-device capture remain human release gates. No promo video or artwork was generated during this code pass.
