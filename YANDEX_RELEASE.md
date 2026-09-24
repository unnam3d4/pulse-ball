# Pulse Ball: Побег — Yandex Games release

This repository is prepared for Yandex Games upload.

## Build

The production game is `index.html` in the repository root.

GitHub Actions workflow **Yandex Games Release** validates the build and creates:

- `pulse-ball-yandex.zip`
- the ZIP contains `index.html` at archive root

Download the artifact from the latest successful workflow run and upload it to the Yandex Games Developer Console.

## SDK integration already in the game

- Yandex Games SDK initialization
- `LoadingAPI.ready()` after the interactive menu is visible
- `GameplayAPI.start()` when gameplay starts/resumes
- `GameplayAPI.stop()` in menus, pause, win/loss and ads
- `game_api_pause` / `game_api_resume` handling
- audio suspension on focus loss/platform pause
- automatic language detection through `ysdk.environment.i18n.lang`
- Russian and English UI
- cloud progress through Player `getData/setData`
- Safe Storage fallback when available
- fullscreen interstitial calls only at chapter breaks (after levels 3, 6, 9 and 12)
- local fallback outside Yandex Games, so GitHub Pages stays usable

## Draft settings

Recommended initial configuration:

- **Platforms:** Desktop, Mobile / Android, Mobile / iOS
- **Mobile orientation:** Landscape
- **Languages:** Russian, English
- **Cloud saves:** Yes
- **Version:** 1.0.0
- **Age rating:** 6+ (confirm in the Console based on the final content)
- **Categories:** Platformer + Arcade/Casual equivalent available in the current Console
- **Postpone publication:** enable until draft-mode testing is complete

## Russian catalog text

### Title
Pulse Ball: Побег

### Short description
Прокатись через яркие уровни, используй Pulse и собери звёзды.

### Description
Pulse Ball: Побег — яркий физический платформер про энергичный синий шар. Прыгай через разломы, обходи ловушки, побеждай противников и используй импульс Pulse, чтобы ломать блоки, двигать объекты и активировать механизмы. На уровнях появляются ускорители, Relay-узлы и энерго-сферы. Проходи 12 уровней, собирай звёзды и улучшай своё время.

### How to play
Двигайся стрелками или клавишами A и D. Прыгай пробелом, W или стрелкой вверх. Нажимай E, чтобы использовать Pulse перед героем. На телефоне используй экранные кнопки. Pulse ломает специальные блоки, толкает объекты и запускает энерго-сферы. Доберись до финиша, собирай звёзды и используй белые флаги как контрольные точки.

## English catalog text

### Title
Pulse Ball: Escape

### Short description
Roll through bright levels, use Pulse powers and collect every star.

### Description
Pulse Ball: Escape is a colorful physics platformer starring an energetic blue ball. Jump across gaps, dodge hazards, defeat enemies and use the Pulse ability to break blocks, move objects and activate mechanisms. Later levels add Boost Pads, Relay nodes and energy orbs. Clear 12 levels, collect stars and replay stages to improve your time.

### How to play
Move with the arrow keys or A and D. Jump with Space, W or the Up arrow. Press E to fire a Pulse in front of the hero. On mobile, use the on-screen controls. Pulse can break special blocks, push objects and launch energy orbs. Reach the finish, collect stars and use white flags as checkpoints.

## Keywords

Suggested Russian keywords:
`платформер,аркада,шар,прыжки,физика,приключение,головоломка`

Suggested English keywords:
`platformer,arcade,ball,jump,physics,adventure,puzzle`

## Required catalog assets still produced outside the HTML build

Prepare/upload in the Console:

- Icon: 512 × 512 PNG
- Maskable icon
- Cover: 800 × 470 PNG
- Hero image: 1560 × 520 PNG/JPG (optional but recommended)
- At least 2 real gameplay screenshots for Desktop and for every selected Mobile platform, 16:9 landscape, long side 1280–2560 px
- Horizontal gameplay video: 16:9, MP4, up to 28 seconds, height at least 400 px
- Optional vertical promo video: 9:16, MP4, up to 28 seconds

Do not use a gameplay screenshot directly as the icon or cover. Keep all promotional visuals consistent with the actual game and localized title.

## Draft-mode verification before moderation

Open the game with the Yandex debug panel and check:

1. SDK loader initializes successfully.
2. Game Ready turns green only when the menu is interactive.
3. Gameplay indicator is green only during active gameplay.
4. Gameplay indicator turns red in menu, pause, win/loss, ads and when the tab loses focus.
5. Language mock switches the UI between Russian and English before gameplay.
6. Cloud progress survives reload and a second device/account session.
7. Startup/fullscreen ads pause gameplay and audio, then resume cleanly.
8. Desktop and mobile landscape layouts have no browser scroll, swipe-to-refresh, clipping or overlapping UI.
9. Every level can be completed from a clean save.
10. Console stays free of gameplay-breaking JavaScript errors.

Only after these checks should the draft be submitted for moderation.
