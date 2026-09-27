# Pulse Ball audio assets

The game expects four soundtrack files in this directory:

- before_the_jump.mp3 — menu
- piston_gardens.mp3 — levels 1–6
- velocity_gate.mp3 — levels 7–13
- gravity_at_the_end.mp3 — levels 14–18

Playback uses Web Audio with musical loop points rather than looping through the generated fade-out tails.

Configured loop windows:
- menu: 10.2284s → 40.2286s
- early: 40.4724s → 95.0161s
- mid: 33.8547s → 95.9913s
- late: 40.4259s → 85.9719s

Audio must stay subordinate to gameplay SFX. The global Sound setting controls both music and SFX, and platform/ad/browser pauses suspend the shared AudioContext.
