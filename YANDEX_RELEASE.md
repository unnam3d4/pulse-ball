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
- fullscreen interstitial calls only at natural breaks: level transitions and repeated retry flow; Yandex controls actual fullscreen-ad frequency
- rewarded video continue after a loss: clearly labeled as an ad, reward is 3 lives and continuation from the current checkpoint/start
- sticky banner API hooks: banner is requested in menus and normal gameplay, then hidden/restored around fullscreen or rewarded ads
- local fallback outside Yandex Games, so GitHub Pages stays usable

## Draft settings

Recommended initial configuration:

- **Platforms:** Desktop, Mobile / Android, Mobile / iOS
- **Mobile orientation:** Landscape (required). In unsupported portrait orientation, Yandex will show its rotate-device placeholder; the build also includes its own fallback for local/GitHub preview.
- **Languages:** Russian, English
- **Cloud saves:** Yes
- **Version:** 0.9.0 for closed draft testing; switch to 1.0.0 only after full 18-level playthrough and Yandex debug-panel verification
- **Age rating:** 6+ (confirm in the Console based on the final content)
- **Categories:** Platformer + Arcade/Casual equivalent available in the current Console
- **Postpone publication:** enable until draft-mode testing is complete

## Russian catalog text

### Title
Pulse Ball: Побег

### Short description
Прокатись через яркие уровни, используй Pulse и собери звёзды.

### Description
Pulse Ball: Побег — яркий физический платформер про энергичный синий шар. Прыгай через разломы, обходи ловушки, побеждай противников и используй импульс Pulse, чтобы ломать блоки, двигать объекты и активировать механизмы. По мере прохождения появляются ускорители, Relay-узлы, энерго-сферы и комбинированные испытания. Проходи 18 уровней, собирай звёзды и улучшай своё время.

### How to play
Двигайся стрелками или клавишами A и D. Прыгай пробелом, W или стрелкой вверх. Нажимай E, чтобы использовать Pulse перед героем. На телефоне используй экранные кнопки. Pulse ломает специальные блоки, толкает объекты и запускает энерго-сферы. Доберись до финиша, собирай звёзды и используй белые флаги как контрольные точки.

## English catalog text

### Title
Pulse Ball: Escape

### Short description
Roll through bright levels, use Pulse powers and collect every star.

### Description
Pulse Ball: Escape is a colorful physics platformer starring an energetic blue ball. Jump across gaps, dodge hazards, defeat enemies and use the Pulse ability to break blocks, move objects and activate mechanisms. Later levels add Boost Pads, Relay nodes, energy orbs and mixed challenge sequences. Clear 18 levels, collect stars and replay stages to improve your time.

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

## Monetization configuration in the Console

On the **Advertising** tab:

- Enable YAN/internal monetization for the game.
- Keep fullscreen and rewarded units enabled.
- For Sticky banners, enable **Use the API to display a sticky-banner**.
- **Mobile landscape sticky banner: choose “On the right”.** This matches the intended Yandex Games layout: platform chrome/banner stays outside the game field while the game adapts to the remaining viewport.
- The game now keeps the sticky banner enabled during normal gameplay for monetization, and hides/restores it around fullscreen/rewarded ads.
- Do not draw or reserve a fake ad slot inside the game: Yandex owns the banner area and may resize the game viewport when it is shown.
- Do not add custom or third-party banners.

Current in-game monetization flow:

- fullscreen ad request after every second completed level transition; the Yandex platform controls whether an ad is actually shown and its frequency;
- fullscreen ad request after every third manual retry following a loss;
- voluntary rewarded video on the loss screen: **continue with 3 lives from the checkpoint/start**;
- no fullscreen or rewarded ad calls during active gameplay.

## Draft-mode verification before moderation

Open the game with the Yandex debug panel and check:

1. SDK loader initializes successfully.
2. Game Ready turns green only when the menu is interactive.
3. Gameplay indicator is green only during active gameplay.
4. Gameplay indicator turns red in menu, pause, win/loss, ads and when the tab loses focus.
5. Language mock switches the UI between Russian and English before gameplay.
6. Cloud progress survives reload and a second device/account session.
7. Startup/fullscreen ads pause gameplay and audio, then resume cleanly.
8. Desktop and mobile landscape layouts have no browser scroll, swipe-to-refresh, clipping or overlapping UI. Test mobile landscape both with and without a right-side sticky banner, including live viewport resize when the banner appears/disappears.
9. Every level can be completed from a clean save.
10. Console stays free of gameplay-breaking JavaScript errors.

Only after these checks should the draft be submitted for moderation.
