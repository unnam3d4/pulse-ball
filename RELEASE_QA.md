# Release QA — 2026-09-26

## Status and remaining release gates

READY FOR FINAL HUMAN PLAYTEST. No blocking failure was found in the automated checks below. This is a release candidate, not a claim of Yandex moderation approval or completed physical-device QA.

Before release: run the actual Yandex Draft with debug indicators, startup/fullscreen/rewarded ads and right-side sticky banner; verify real cloud saves across devices and offline recovery; test physical Android/iPhone multitouch, audio, safe areas and frame pacing; complete a human 18-level run including optional star routes; export/upload catalog media. See YANDEX_RELEASE.md and ASSET_PLAN.md.

## Scope

Base: main `6a04cd7fecb548539bf4a2595941eff8ae0563b5`. Review branch: `astra-release-final`. One production index.html; no runtime dependencies. Physics, ball radius, gravity, jump and Pulse logic, save keys, campaign order, RU/EN and unlocking model retained. No Flow, Mastery, economy or new progression layer.

- Save sources merge independently: corrupt v2 no longer loses valid legacy records; maximum stars and minimum time survive local/Safe/cloud reconciliation.
- SDK pause listeners register before storage/cloud awaits. Browser focus and visibility have separate pause reasons. Rewarded continuation clears stale motion/input state; only onRewarded grants lives.
- Touch viewport reserves space above the actual buttons. Compact result layout also covers 640×480. Resize does not reset simulation state.
- Moving platforms and opened bridges have distinct mechanical surfaces. Inactive checkpoint flag matches the white-flag help. Hero/sky caches, visible-area culling and bounded particles reduce repeated rendering work. Ending text is localized for completing all 18 levels.
- Level 6: final moving platform now continues the elevated Boost landing (x20420, y310, width180). The former 170-unit ground gap remains jumpable.
- Level 12: existing Heavy moved into the final Orb lane (x13150, patrol13040–13260).
- Level 13: checkpoint moved from ledge x7600 to stable ground x8180.
- Level 18: existing Drone moved into the final Boost/moving-platform/Relay sequence (x17720, patrol17690–17860). Enemy counts and all star coordinates retained.

## Verified results

`node --test tests/release.test.cjs`: 8/8 passed. Three inline scripts parse; every level completes using recorded ordinary input from its normal initial state with health3 throughout; 18 checkpoint margins and four respawn phases pass; Orb receivers and crate/switch bridges activate; save migration and invalid data handling pass; startup pause and once-only ready/reward callbacks pass.

`node tests/browser-qa.cjs`: 9/9 passed with externally supplied Playwright Chromium. Covers corrupt/legacy saves, early platform pause, blur during reward, ground/control clearance, SDK language/ready/cloud merge/reload, reward cancellation/duplicate callback, fullscreen transition waiting for portal resume, visible small-window result actions, orientation/resize/manual pause. SDK is a controlled mock. Browser test instrumentation is injected only by the test harness.

`node tests/geometry-audit.cjs`: 719/719 local star routes and 117/117 ground-gap routes passed. These trials remove enemies/spikes, sample launch surfaces and permit activated bridges. Mechanism gaps are classified separately; bridge activation is checked by the logic tests. Moving gap trials include nearby platform extrema. This establishes local kinematic routes, not a single clean all-star run or proof that every sampled launch surface is globally reachable. Clean campaign replays collect only a subset of stars.

| Level | Clean input replay | Local stars | Ground gaps |
| --- | --- | --- | --- |
| 01 | PASS, 3 lives | 25/25 | 5/5 |
| 02 | PASS, 3 lives | 35/35 | 9/9 |
| 03 | PASS, 3 lives | 47/47 | 12/12 |
| 04 | PASS, 3 lives | 35/35 | 6/6 |
| 05 | PASS, 3 lives | 45/45 | 9/9 |
| 06 | PASS, 3 lives | 61/61 | 11/11 |
| 07 | PASS, 3 lives | 41/41 | 7/7 |
| 08 | PASS, 3 lives | 51/51 | 8/8 |
| 09 | PASS, 3 lives | 48/48 | 7/7 |
| 10 | PASS, 3 lives | 37/37 | 4/4 |
| 11 | PASS, 3 lives | 37/37 | 5/5 |
| 12 | PASS, 3 lives | 43/43 | 5/5 |
| 13 | PASS, 3 lives | 34/34 | 4/4 |
| 14 | PASS, 3 lives | 34/34 | 5/5 |
| 15 | PASS, 3 lives | 35/35 | 5/5 |
| 16 | PASS, 3 lives | 36/36 | 5/5 |
| 17 | PASS, 3 lives | 37/37 | 5/5 |
| 18 | PASS, 3 lives | 38/38 | 5/5 |

## Layout and rendering

Menu, chapter picker, settings, help, pause, loss, win and gameplay were captured in RU/EN at desktop1280×720, 640×480, 1920×1080 and touch667×375, 568×320, 844×390, 448×320, 740×360, 896×414. No page errors. Picker tabs intentionally scroll horizontally in narrow layouts. The448×320 viewport is a reduced-space proxy, not a real sticky-banner test. Portrait/landscape return was exercised in the browser regression suite.

Isolated desktop draw samples (100 draws each, not mobile FPS): level1 0.237→0.212ms, level6 0.397→0.180ms, level12 0.376→0.251ms, level13 0.358→0.221ms, level18 0.461→0.272ms. Per-frame gradients dropped from10–12 to0–4 in those samples. Real-device thermal/frame-pacing testing remains pending.

Free-flight reference at fixed step1/120, same-height landing: ordinary jump rise127.30/range251.88; Boost rise313.80/range395.42; right Relay rise166.73/range289.79. These are sampled engine trajectories, not new physics constants.

## Packaging and review

The upload ZIP contains only root-level index.html; development tests/docs stay outside it. Workflow runs syntax, campaign/save/SDK regressions and geometry audit before packaging on main, the review branch and PRs targeting main. Browser tests remain local and add no game dependencies. Local package bytes are compared with the production source after ZIP creation.

Self-review completed against the base. A separate reviewer ran the tests and reported no findings in its interim scan, but its final review was interrupted; this is not represented as a completed independent sign-off. No merge or moderation submission is performed by this pass.
