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
- At least 2 screenshots
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

## 2. Internal menu/game assets

These are not mandatory Yandex catalog fields, but they are needed to make the game menu look like a polished product instead of a generic HTML UI.

### Hero render
Path target: `assets/menu/pulse-ball-hero.webp`
- Source master: 1024 × 1024 transparent PNG
- Runtime export: WebP with transparency
- Same approved hero as gameplay
- Full readable face
- Cyan energy trail/turbine accent
- No text

Use:
- Main menu hero
- Win/lose screens
- Catalog icon source
- Cover source

### Main menu background
Path target: `assets/menu/menu-world.webp`
- 1920 × 1080 or 2560 × 1440
- Bright positive world
- No UI/text baked into image
- Empty right-side area reserved for Play / Levels / Settings buttons
- Visual language taken from actual game biomes

### Chapter thumbnails
Paths:
- `assets/chapters/chapter-01.webp`
- `assets/chapters/chapter-02.webp`
- `assets/chapters/chapter-03.webp`
- `assets/chapters/chapter-04.webp`
- `assets/chapters/chapter-05.webp`
- `assets/chapters/chapter-06.webp`

Recommended runtime size: 640 × 360 WebP.

Each thumbnail should visually correspond to its real chapter:
1. Green valley / first Pulse
2. Sky / Boost
3. Resonance / Relay
4. Light / Energy Orbs
5. Sunny gardens / mixed mechanics
6. Energy peak / final challenge

Use these as visual chapter headers behind level buttons, not as fake screenshots.

### UI icons
Path target: `assets/ui/`
Needed only if we stop using SVG/CSS icons:
- settings
- sound on/off
- fullscreen
- language/globe
- pause
- restart
- level select

Prefer simple single-color SVGs. Do not rasterize basic UI icons.

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

Possible later placements only after we add a real meta-economy:
- cosmetic currency
- optional skin unlock progress

Do not bolt a fake currency onto the game only to create more rewarded placements.

### Sticky banner
- Request banner in main menu / level selection / settings
- Hide banner during active gameplay
- Enable API-controlled sticky banners in the Developer Console

---

## 5. Production order

1. Finish menu/settings UX and full RU/EN text coverage.
2. Generate the hero render and menu background.
3. Create 6 chapter thumbnails.
4. Replace CSS-only menu art with real assets while keeping responsive fallbacks.
5. Capture real 16:9 gameplay screenshots from the finished build.
6. Produce Yandex icon, maskable icon, cover, hero image.
7. Record the 16:9 gameplay video.
8. Test ads, language switching, gameplay markup, saves and focus/audio in Yandex Draft mode.
