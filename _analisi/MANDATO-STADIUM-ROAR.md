# MASTER PROMPT — "STADIUM ROAR" (working title)
## A mobile 3D football game with Clash-Royale-grade readability, animation and UX, a full real-football simulation with an emotional player model, and bug-proof online competition (friends + world ranking). Built with Godot 4.6, delivered by an orchestrated team of Claude Code subagents.

> **How to use this file (read by the human, not the agent)**
> 1. Create an empty git repository. Save this file as `docs/SPEC.md`. Create `CLAUDE.md` by copying **Appendix F** (a slim index, under 150 lines): Claude Code loads `CLAUDE.md` into every session and every subagent, so it must stay small and point to this specification instead of repeating it — that is the single biggest token saving in the whole project (section 14.1).
> 2. Open Claude Code in that folder and send the message in section 18, "KICKOFF MESSAGE". The agent's first job (M0) is to split this specification into `docs/SPEC/NN-title.md` sections, create the subagents with the model tiers of 14.1 and the skills of 8.8.4, and install the animation toolchain of 8.8.3.
> 3. Work phase by phase (section 15). Each phase ends with a **gate**: a playable build, automated test results, a short video capture and a cost/routing report that *you* review before approving the next phase. Never let the agent skip a gate.
> 4. This specification is the single source of truth for *requirements*; the agent adds `docs/ADR-*.md` decision records and keeps `docs/STATUS.md` as the single source of *status*, updated after every session.
> 5. Rename the working title, team names and colours as you like; everything else is deliberately opinionated so the agent never has to guess.
> 6. Two things only you can do: record the motion-capture shot list with your phone (8.8.2, about two hours, ideally with friends who play football) and approve any purchase or subscription (asset packs, mocap services, hosting).

---

## 0. WHO YOU ARE AND WHAT YOU ARE BUILDING

You are the **Lead Engineering Agent** of a small virtual studio. You plan, decompose, delegate to specialised subagents (section 14), integrate their work, test everything, and ship. You do not "describe" work: you produce running code, scenes, assets, tests, scripts and documentation in the repository, and you verify every claim by running it (tests, headless simulations, exports, on-device profiling, screenshots and video captures).

**Product in one sentence:** a mobile-first (iOS + Android) 3D football game where every match looks and feels like a stylised, cinematic broadcast, every player has a face, a body language and a mood that the viewer can read instantly, the rules are the real Laws of the Game, and online competition (against friends and in a global ranked ladder) is fair, fast and reliable.

**Game modes (all must ship, in this order of priority):**
1. **Ranked 11v11 ("Pro")** — full rules, compressed time (2 halves × 4 real minutes = 90 "match minutes", plus stoppage time; extra time of 2 × 1:20 real minutes and penalties in knockout formats; draws are allowed in the league-style ladder). Landscape, two-thumb touch controls with strong assists.
2. **Arcade 5v5 ("Street")** — 3-minute matches, same engine, simplified rules profile (no offside, kick-ins instead of throw-ins, rolling substitutions), designed for quick sessions and lower-end phones. Shares 100% of the code; only data (rules profile, pitch, team size, camera preset) changes.
3. **Friends** — private lobbies with invite codes, both formats, plus "practice vs AI" and a 90-second interactive tutorial.

**Quality bars (these are the definition of "done" for the whole project):**
- **Readability & animation:** any spectator can tell at a glance, on a 6-inch screen, who has the ball, where it is going, which team is which, what each player is doing and *how they feel*. Animation follows the 12 principles plus game-feel rules (section 8). The reference for readability, feedback and one-handed friendliness is the design *approach* of Supercell's Clash Royale (strong silhouettes, saturated team colours, exaggerated proportions, radial timers, colour-coded state, edge-glow warnings, emotes instead of chat). **Never copy or imitate any Supercell asset, character, name or logo** — copy the principles, not the property.
- **Simulation fidelity:** everything that happens in a real professional match can happen in the game (section 6), governed by a data-driven rules engine that implements the current IFAB Laws of the Game, including the 2025/26 and 2026/27 changes (Appendix D).
- **Emotional realism:** players have a research-based psychological model (section 7) that changes how they move, decide, celebrate, protest and collapse — visibly, fairly and within bounded limits.
- **Competitive integrity:** server-authoritative simulation, no client trust, deterministic replays, verified results, reconnection handling, cheat and boosting detection, a hidden Glicko-2 rating for matchmaking and a visible trophy ladder with seasons and global/country/friends leaderboards (section 10).
- **Cinematic presentation:** broadcast-style cameras, walk-outs, goal cinematics, VAR sequences, slow-motion replays, auto-generated highlight reels, stadium atmosphere (section 8.7).
- **Performance:** 60 FPS on the "Mid" reference device tier, 30 FPS floor on "Low" tier, < 6 s cold start to main menu, < 4 s into a match after matchmaking, ≤ 2.5% of a 4,500 mAh battery (≈ 110 mAh) per 10-minute online match on the named Mid device, measured on-device (section 12).
- **Bug-proofing:** every gameplay rule is covered by unit tests, every invariant in Appendix A is checked in thousands of automated bot-vs-bot headless matches before any release, and the netcode is soak-tested under simulated packet loss, jitter and reconnection (section 13).

**Explicit constraints:**
- Engine: **Godot 4.6.x stable** (Forward Mobile renderer; Jolt is the engine default for 3D physics but the match simulation does **not** use the engine physics, see 2.2). GDScript for presentation and tooling; the deterministic simulation core starts in GDScript with integer fixed-point math and a clean interface, and is ported to a **C++ GDExtension** (or Rust via godot-rust; choose one in ADR-001) at the decision point defined in 2.2, without changing callers.
- Backend: **Nakama** (open source, self-hostable, has a Godot 4 client SDK) for accounts, friends, matchmaking, leaderboards, tournaments/seasons and storage; **Godot headless dedicated match servers** run the authoritative simulation; Docker + docker-compose for local dev; Kubernetes/Agones (or an equivalent allocator) for production fleet scaling. Postgres via Nakama.
- Solo human owner + you. Assume no professional artist: you generate the art with scripted Blender (`bpy`) pipelines and procedural materials, and you **produce the animations yourself** — authored from pose grammars, captured from the human's own phone videos, or procedural at runtime (section 8.8) — using commercially licensed libraries only for generic motion and purchased packs only with the human's approval. Everything shipped must be usable in a monetised game. Design the art direction so that this constraint becomes a *style*, not an excuse.
- **No real clubs, leagues, competitions, players, kits, stadium names, broadcasters or FIFA/UEFA trademarks.** All teams, players and venues are fictional (a generator produces them). No copyrighted chants or music.
- No pay-to-win. Monetisation, if any, is cosmetic only and must never touch simulation data.
- Languages: code, comments, docs and commit messages in English; the game UI must be localisable (start with English and Italian).

---

## 1. ENGINEERING PRINCIPLES (NON-NEGOTIABLE)

1. **Server authority, always.** Clients send *inputs*, never state. Match results, ratings, trophies and statistics are produced only by the server. Anything the client says about the outcome is ignored.
2. **Deterministic SimCore.** The match simulation is a pure, engine-agnostic module: fixed timestep (30 Hz), integer tick counter, seeded PRNG, no wall clock, no engine physics, no scene-tree access, no floating-point transcendental functions in decision paths unless wrapped in a deterministic table. Given the same seed and input stream, it produces the same event log on the same platform (hard requirement) and across platforms (target requirement; measure and report drift).
3. **Data-driven rules.** Laws of the Game live in versioned rule profiles (`data/rules/*.json` or `.tres`), not in `if` statements scattered across the code. Pro, Street, "friendlies" and future variants are profiles.
4. **Tests before "done".** A feature without tests is not finished. A rule without a test that shows the correct decision and the incorrect one is not implemented. Bot-vs-bot headless soak runs are part of CI.
5. **No hidden randomness that decides outcomes.** Randomness exists (deflections, bounces, error dispersion) but is seeded, bounded, symmetric for both teams, and always visible through animation and feedback. A player must never lose a match to something they could not see coming.
6. **Readability beats realism when they conflict.** If a realistic animation makes an action unclear, exaggerate it.
7. **Performance budgets are requirements, not goals.** Every scene has a draw-call, triangle, texture-memory and frame-time budget (section 12). CI fails when a budget is exceeded.
8. **Presentation never affects simulation.** Animation, VFX, camera and audio read from the sim; they never write to it. Frame-rate drops must not change match outcomes.
9. **Everything is reproducible.** Any bug report can be reproduced from `(build hash, seed, input log)`. Replays are first-class.
10. **Small, verified steps.** Work in vertical slices. Commit often with conventional commits. Never leave the main branch broken. Record every architectural decision as an ADR.
11. **Accessibility from day one.** Colour-blind safe team palettes and markers, scalable HUD, haptics toggle, subtitles for commentary, reduced-motion option, left-handed layout.
12. **Legal hygiene.** Check the licence of every asset and library before adding it (`docs/LICENSES.md`), and never use anything under a non-commercial or share-alike licence.

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Layers (strict dependency direction: lower layers never import upper ones)

```
[Meta / Backend clients]  Nakama client, auth, leaderboards, matchmaking, friends, seasons, storage
        │
[Net]                     ENet (UDP, DTLS) transport, input/snapshot protocol, prediction, interpolation, reconnection
        │
[Presentation]            Godot scenes: rendering, animation, cameras, VFX, audio, HUD, controls, cinematics
        │
[SimCore]                 Deterministic match simulation: rules, physics, AI, emotions, event log, replay
        │
[Data]                    Rule profiles, team/player generators, tuning tables, localisation, animation manifests
```

### 2.2 SimCore design

- **Fixed tick 30 Hz** (`dt = 1/30`), all state in plain arrays/structs (Structure-of-Arrays where hot), positions in metres, velocities in m/s, angles in radians, time as tick counts.
- **Custom kinematic physics**: players are capsules with mass, acceleration, top speed, turning rate and stamina-scaled limits; the ball is a sphere with drag, Magnus lift (spin), rolling/sliding friction, restitution against pitch, posts, crossbar, nets, advertising boards and bodies. Contacts are resolved analytically (sphere-capsule, sphere-plane, sphere-cylinder for posts). Physics steps are sub-stepped ×4 for the ball when speed > 20 m/s.
- **Entities**: 22 players + ball + referee + 2 assistants (+ 4th official and VAR as abstract agents) + physio/stretcher agents when needed + substitutes on the bench + coaches (abstract, drive tactics).
- **Event log**: every rule-relevant thing is an immutable event with tick, type and payload (`KickOff, Pass, Shot, Save, Goal, Foul, Card, Offside, VARReview, Substitution, Injury, Stoppage, Whistle, Emotion*`). Presentation, commentary, statistics, highlights, replays and the emotion model all consume the same log.
- **Seeded PRNG** (PCG32 or xoshiro128**), one stream per subsystem (physics noise, AI, emotions, referee) so that adding randomness in one place does not change another.
- **Deterministic math**: while SimCore is in GDScript, all simulation state and arithmetic use **64-bit integer fixed-point** (Q20.12; ADR-004) with integer square root and table-based trigonometry — GDScript floats are doubles and engine vectors are float32, so float determinism cannot be controlled there. **Port decision point**: when profiling shows a sim tick > 2 ms on the Mid tier, or at the latest at the M2 gate, decide the port of SimCore to a C++ GDExtension (ADR-001 records the criteria); the extension keeps the same fixed-point representation so replays and tests stay compatible. Ship a cross-platform determinism test (Appendix A, INV-01) that runs a 10-minute recorded match on Linux x86-64, Android arm64 and iOS arm64 and compares event-log hashes every 30 ticks.
- **Public API** (stable, versioned): `sim.create(profile, teams, seed) -> state`, `sim.step(state, inputs[2]) -> events[]`, `sim.serialize/deserialize(state)` (for snapshots, replays and server hand-over), `sim.hash(state)`.
- **Time model**: the match clock runs at a compression ratio (Pro: 90 match-min in 8 real-min → 11.25×; extra time 2 × 15 match-min = 2 × 1:20 real; Street: 1×, 3 real minutes). As in real football the clock **keeps running during in-world stoppages** (fouls, injuries, substitutions, VAR, on-pitch celebrations) and the referee adds stoppage time to compensate (section 6.2). The clock **pauses only for non-diegetic time** (skippable cinematics, the half-time screen, menus), which is never counted as stoppage. Real-time rules (8-second goalkeeper possession, 5-second restart countdowns, 10-second substitute exit) stay in real seconds; durations that would be meaningless in real seconds under compression (injured player off the pitch, captain rally cooldown, warm-up before entering) are expressed in match-minutes.
- **Event density (ADR-005)**: 8 real minutes of real-speed football would produce roughly one eleventh of a real match's events, so the tuning target is *game* density, not real-match density: the AI plays more directly (higher tempo, earlier shots, aggressive pressing, faster transitions) and the statistics bands in 13.1 are defined per format. Pitch size, player speeds and ball physics stay real.
- **Replays**: online replays and highlights play back the **server snapshot stream** (no re-simulation on the phone, so cross-platform float drift can never corrupt them); input-log re-simulation is used for local/bot matches, tests and server-side verification.

### 2.3 Presentation

- One `MatchPresenter` reads snapshots every frame and interpolates between the two most recent ones for smooth 60/120 Hz rendering. **From M1 the client always consumes snapshots through a loopback `MatchServer`** (server and client in one process for offline, practice and bot matches), so presentation, prediction and input buffering are built against the real network path from the start; online play (M8) only swaps the transport.
- Players are `CharacterVisual` scenes: skeleton (Godot `Skeleton3D`), `AnimationTree` state machine + blend spaces, procedural layers (gaze via `LookAtModifier3D`, foot IK via Godot 4.6's IK modifiers — verify exact node names in the 4.6 docs —, lean, hit reactions, cloth/hair secondary motion via Godot's `SpringBoneSimulator3D` and physical bones), facial blend shapes, kit material variants, LOD0-2.
- Cameras are a stack of `VirtualCamera` nodes blended by a `CameraDirector` (section 8.7).
- HUD is a single `CanvasLayer` with safe-area handling for notches and gesture bars.

### 2.4 Networking (details in section 10)

- Transport: ENet over UDP with DTLS; WebSocket over TLS fallback when UDP is blocked.
- Server: Godot headless build running `SimCore` + `MatchServer` (no rendering). One process hosts N matches, where N is derived from measured tick time with 50% headroom (N × p99 tick time ≤ 16 ms of the 33 ms tick); report N per vCPU in `docs/TDD.md` and re-measure after the GDExtension port.
- Protocol: client → server `InputFrame {tick, seq, stick(x,y) int8×2, buttons bitmask, gesture(id, dir int8×2, power u8)}` sent every sim tick with the last 3 frames redundantly; server → client `Snapshot {tick, ballState, 22×PlayerState (quantised), refereeState, matchClock, events since last ack}` at 20 Hz, delta-compressed against the last acknowledged snapshot. Reliable channel for events; unreliable-sequenced for snapshots.
- Client-side prediction for the controlled player and for locally initiated actions' *animation start* (never for the outcome); snapshot interpolation (100 ms buffer, adaptive 60–160 ms) for everything else; server reconciliation with smoothing.

### 2.5 Repository layout

```
/project.godot
/addons/                 (third-party Godot addons, vendored, licences recorded)
/sim/                    SimCore (engine-agnostic; pure GDScript now, extension later)
  /rules/                law implementations, one file per Law, plus var.gd, referee.gd
  /physics/              ball.gd, body.gd, contacts.gd, pitch_geometry.gd
  /ai/                   team_shape.gd, roles/, decision/, set_pieces/
  /emotion/              model.gd, triggers.gd, contagion.gd, expression_map.gd
  /events/               event definitions, log, serialization
  /replay/               recorder, player, hashing
/game/                   Presentation
  /characters/           rigs, animation trees, facial, kits, LODs
  /stadium/              pitch, stands, crowd, lighting, weather
  /cameras/              director, virtual cameras, replay cameras
  /vfx/ /audio/ /ui/ /controls/ /cinematics/ /commentary/
/net/                    client transport, prediction, interpolation, reconnection
/server/                 headless match server, fleet hooks, admin tooling
/backend/                Nakama modules (TypeScript runtime): ratings, seasons, anti-cheat, match allocation
/data/                   rules profiles, tuning tables, team/player generators, localisation
/tools/                  Blender bpy pipelines, asset importers, test-match runner, profilers, screenshot bot
/tests/                  unit, property, replay, soak, netcode chaos, visual regression
/docs/                   GDD.md, TDD.md, STYLE_BIBLE.md, ADR-*.md, TEST_PLAN.md, RISKS.md, LICENSES.md, STATUS.md
```

### 2.6 Tooling and CI

- GitHub Actions (or the human's CI of choice): lint (gdlint/gdformat), unit tests (GUT or gdUnit4 — choose via ADR), headless soak matches (1,000 matches per profile nightly, 100 per PR), determinism check, export builds (Android APK/AAB, iOS Xcode project — signing and archiving need a macOS lane: a Mac runner or the human's Mac, listed in `docs/HUMAN_ACTIONS.md` —, Linux server Docker image), performance budget check on a recorded benchmark scene (draw calls, triangles and frame time need a real renderer: a GPU runner, or Xvfb + Mesa lavapipe software Vulkan; plain `--headless` uses the dummy renderer and cannot capture frames or render stats), visual regression screenshots on the same runner; if neither runner is available, capture on the human's device via `tools/device_capture.sh` and store baselines.
- A `tools/run_match.sh --profile pro --seed 42 --bots --ticks 18000 --report` script prints statistics, invariant violations and the event log; it is the fastest way to test any sim change.
- A `tools/juice_review.py` script renders a fixed set of 12 "money shots" (kick-off, sprint, tackle, shot, save, goal celebration, protest, injury, VAR, penalty, rain, night) to PNG for the human to review after every presentation change.

---

## 3. GAME MODES AND MATCH FORMATS

| Mode | Players | Real length | Rules profile | Orientation | Purpose |
|---|---|---|---|---|---|
| Ranked Pro | 11v11 | 2×4 min + stoppage; draws allowed (+ ET 2×1:20 min + penalties in cup/season-final formats) | `pro.json` (full Laws) | Landscape | Main ladder |
| Ranked Street | 5v5 | 3 min single period; in ranked a draw goes to golden goal capped at 60 real seconds, then a 3-kick shoot-out | `street.json` | Landscape (portrait one-hand layout is a stretch goal, section 9.6) | Quick sessions, low-end devices |
| Friends | either | as above | either | — | Invite code, rematch, spectate (stretch) |
| Practice | either | any | either, plus `training.json` (free-kick/penalty/skill drills) | — | Onboarding, testing tactics |
| Tutorial | 5v5 | 90 s | `tutorial.json` | — | First launch |

Match formats are data: `data/formats/*.json` define halves, duration, extra time, penalties, substitution windows, squad size, bench size, VAR availability and clock compression. Ranked season finals and "Cup Weekend" events reuse them.

---

## 4. TEAMS, PLAYERS AND DATA MODEL

- **Fictional universe generator** (`data/generators/`): 48 clubs across 6 fictional regions, each with name, city, 2 kits (home/away) + goalkeeper kit, crest built from a procedural heraldry system (shapes + palette, never real crests), stadium (capacity, roof type, pitch dimensions within IFAB limits 100–110 m × 64–75 m, sea level/altitude, typical weather), fan culture parameters (loudness, hostility, patience), a squad of 23 players and a coach profile.
- **Player attributes (0–100)**: pace, acceleration, agility, balance, strength, stamina, jumping; ball control, dribbling, short pass, long pass, crossing, finishing, shot power, long shots, volleys, heading, free kicks, penalties, curve; marking, standing tackle, sliding tackle, interceptions, positioning, vision, reactions; goalkeeper: handling, reflexes, diving, positioning, kicking, one-on-ones, sweeping. **Psychological traits (0–100)**: composure, confidence baseline, aggression, temperament (how fast frustration builds), resilience (how fast it decays), leadership, work rate, flair, sportsmanship (diving/dissent propensity is inversely related), injury proneness, preferred foot (+ weak-foot level). Physical: height, weight, age, dominant foot, body type (drives silhouette and animation set).
- **Symmetric competitive balance (ADR-002)**: in ranked both players choose from the same pool of clubs, and every club is built from one of four *archetype templates* (Possession, Counter, Physical, Technical). Clubs sharing an archetype have identical per-position attribute and psychological-trait templates — only names, faces, kits, crests, stadium and fan culture differ. The four archetypes have equal total power, and their pairwise bot-vs-bot win rates must stay within 45–55% in soak tests (a CI check). Ranked matches use a neutral stadium and fixed weather; stadium and weather variety is cosmetic or Friends/Practice-only. Team identity is expression, not power; skill, tactics and reading emotions decide matches.
- **Squad, formation, tactics** are set pre-match and adjustable at half time (a fixed 25-second real-time window for both players) or during play through a one-tap radial quick-menu of four tactical presets (instant) and a substitution queue that the referee executes at the next stoppage lasting ≥ 3 real seconds (section 6.10). The simulation never pauses for menus in online matches.

---

## 5. PROGRESSION, SEASONS AND SOCIAL (meta layer)

- **Trophies** (visible): Clash-style ladder. One formula everywhere: Δ = round(30 × (S − E)) where S = 1 / 0.5 / 0 for win / draw / loss and E is the Glicko-2 expected score, plus +5 for a win as the lower-rated side; leagues ("Arenas": Sunday League → Amateur → Semi-Pro → Pro → Elite → Legend), season reset every 4 weeks with partial trophy decay above the Legend threshold; league rewards are cosmetic only.
- **Hidden rating**: Glicko-2 (rating, deviation, volatility) per mode; matchmaking uses hidden rating ± expanding window with a trophy-gap cap; new players play 5 placement matches against bots and calibrated opponents.
- **Leaderboards**: global top 10,000, country (from account setting, not IP), friends, club/guild (stretch). Player always sees their own rank and percentile. Seasons snapshot to a hall of fame.
- **Friends**: friend codes, invite to private match, spectate (stretch), emotes/quick-chat only (no free text), block/report.
- **Profile**: favourite fictional club, banner, emotes, celebrations, kits, stadium skins, commentator voice packs — all cosmetic.
- **Fair play score**: affects matchmaking pool (persistent quitters and abusers play each other).

---

## 6. FOOTBALL SIMULATION SPECIFICATION — EVERYTHING THAT HAPPENS IN A REAL MATCH

You must implement all of the following as SimCore systems, each backed by unit tests, a rules-profile entry where applicable, an event type, an animation/VFX/audio hook and a commentary line set. Use the IFAB Laws of the Game 2026/27 as the canonical reference (download and cite the official PDF in `docs/RULES_SOURCES.md`; keep a diff of changes per season).

### 6.1 Pre-match
- Squad selection (11 + up to 12 bench in Pro; 5 + 3 in Street), formation, roles, captain (drives Law 3 captain-only communication), penalty takers order, set-piece takers, tactical presets.
- Coin toss (which team kicks off / which end), line-ups shown as broadcast graphics, tunnel walk-out with mascots (children, optional), handshake line, team photo, huddle, warm-up loops on the pitch, anthem/crowd tifo display for finals, kick-off whistle.
- Weather and time of day selected from stadium climate + season calendar: clear/overcast/rain/heavy rain/snow-light/fog (visibility), wind (affects long balls), pitch wetness (ball speed, slide length), temperature (fatigue rate).

### 6.2 Match structure and clock
- Two halves, half-time (tactics screen, substitutions, "team talk" emotional reset opportunity, see 7.6), extra time (two periods, one additional substitution), penalty shoot-out (separate coin toss for the goal end and for who kicks first; ABAB order, 5 each, then sudden death; only players on the pitch at the end of the match take part; an injured goalkeeper may be replaced by a named substitute only if the team has a substitution left; the larger team reduces to equal numbers). Goalkeeper edge cases: a sent-off or injured goalkeeper with no substitution left is replaced in goal by an outfield player (kit swap, referee permission, at a stoppage); voluntary GK/outfield swaps are allowed at stoppages. If a team drops below 7 players the match is abandoned and, in ranked, awarded to the opponent as 3–0 or the current score if that is better for them.
- **Stoppage time** computed by a referee model from actual stoppages (substitutions, injuries/assessment, VAR, goals and celebrations, disciplinary sanctions, time-wasting), announced by the 4th official board at 44'/89' match-minutes; referee can extend for further stoppages during added time.
- Units under compression: goalkeeper 8-second possession, 5-second restart countdowns (rules-profile flags) and the 10-second substitute exit are measured in *real seconds*; the injured-player off-pitch requirement is 1 match-minute (≈ 5 real seconds at 11.25×) so it stays proportionate; every rule entry in a profile states its unit explicitly (`_s` real seconds or `_mm` match-minutes).
- Own goals are first-class: a `Goal` event carries `own_goal: true`, credited to the last touch, with its own statistics, commentary, celebration suppression and emotional trigger (Appendix B).

### 6.3 Ball physics
- Mass 0.43 kg; radius 1.15 × real (real circumference 69 cm → radius ≈ 11 cm → sim radius ≈ 12.6 cm) — **the same radius is used by physics and rendering** (ADR-006, readability); drag with Reynolds-number-dependent coefficient (simplified two-regime model), Magnus force from spin (curl, dip, knuckle when spin ≈ 0 and speed high), rolling vs sliding friction, wet-pitch modifiers, bounce restitution vs pitch/post/crossbar/body/net (nets absorb), out-of-play detection on whole-ball-over-line in 3D including in the air above the touchline (assistant model), goal-line technology (instant, whole ball over line).
- Deflections: contact normal jitter bounded and seeded; pace and spin transfer from foot/head/body contact with contact-point offset determining curl.

### 6.4 Player motion and physicality
- Locomotion model: acceleration curves per attribute, top speed, turning radius scales with speed, deceleration, first-touch control radius, dribble ball offset, body feints (skill moves) with commitment windows, shielding (body between opponent and ball), jostling/shoulder-to-shoulder with strength/balance, jumping and aerial duels (timing + jumping + height), falling/recovery, collision avoidance between teammates.
- **Fatigue**: distance covered (target 9–12 km per 90 match-minutes for outfielders in the sim's distance accounting), sprint count, high-intensity decay in the second half and extra time, cramps in extra time (visible: player drops, stretch by teammate), fatigue lowers pace/acceleration/decision quality/tackle timing and raises injury risk.
- **Injuries**: contact (tackles, collisions, goalkeeper collisions) and non-contact (hamstring during sprint, ankle on landing), severity tiers (knock → play on with reduced attributes; treatable → physio enters, player must leave the pitch for 1 match-minute per rule flag then returns; substitution required; head injury → concussion protocol and concussion substitute per profile), stretcher cart animation for severe cases, injury-time accounting.

### 6.5 Actions (the verb set of the game)
- **Passing**: ground pass, driven pass, through ball (ground/lofted), lob/chip pass, cross (early, standard, whipped, cut-back), backheel/flick (flair), one-touch, first-time volley pass, header pass, throw-in (short/long).
- **Shooting**: standard, power, finesse/curl, chip over keeper, volley, half-volley, header (glancing/powered/diving), bicycle kick (flair, rare), toe-poke, low driven, near-post/far-post targeting, weak-foot penalties.
- **Dribbling**: close control, knock-and-run, sprint dribble, skill moves (step-over, body feint, roulette, elastico, drag-back, nutmeg, rainbow (flair ≥ 85)), shield, stop-and-go.
- **Defending**: jockey/contain, press trigger, standing tackle, sliding tackle (with foul risk model), block shot/cross, interception, clearance (safe/aimed), header clearance, shepherding out of play, goal-line clearance, tactical foul (deliberate, card consequence).
- **Goalkeeping**: set position, shot-stopping (catch/parry/tip over/push wide), reflex saves, dives (low/high, near/far), one-on-one (spread, stand up, rush), claim crosses (catch/punch), sweeper-keeper rushes outside the box, distribution (throw, roll, short pass, drive, long kick, goal kick), 8-second possession timer with visible referee count (last 5 s), penalty behaviour (line rule: at least part of one foot on/above the line), time-wasting behaviour tied to emotion/tactics.
- **Off-ball**: call for pass, make run (near/far/overlap/underlap), hold position, drop deep, press, cover, offside trap step-up, wall formation, marking (zonal/man) at set pieces, encourage teammate, protest, celebrate.

### 6.6 Set pieces and restarts
- Kick-off (both halves, after goals; ball may go backwards), goal kick (defenders may receive inside the box, attackers stay outside until ball is kicked), corner kick (short/standard/in-swinger/out-swinger/near post/far post/edge-of-box routines; defenders on posts as tactic), throw-in (foul throw detection; 5-second restart countdown per profile flag), free kick direct (wall placement at 9.15 m, attackers must stay 1 m from wall, wall jumps/crouches, spray/vanishing foam visual, shooting/crossing/short options, dummy runs), indirect free kick (referee arm signal until touched), penalty kick (run-up styles, stutter run allowed but no feinting after run-up completed, goalkeeper encroachment/retake rules, accidental double touch: retake if scored / indirect free kick if missed), dropped ball (to the team that would have had possession; to the goalkeeper if inside the penalty area; all others 4 m away).
- Quick restarts allowed when the rules permit; the referee may hold play for cards, injuries or wall management.

### 6.7 Fouls, misconduct and sanctions (Law 12)
- Foul types: careless/reckless/excessive force tackles, holding, pushing, tripping, charging, jumping at, handball (deliberate / arm unnatural position / accidental leading directly to goal), impeding, dangerous play, playing the ball while on the ground dangerously, goalkeeper handling back-pass or throw-in, goalkeeper > 8 s (→ corner kick), simulation/diving (caution), dissent (caution; captain-only communication: non-captains approaching the referee aggressively are cautioned), time-wasting, delaying restart, encroachment, leaving/entering the field without permission, denying an obvious goal-scoring opportunity (DOGSO: red, or yellow if a genuine attempt to play the ball inside the box; **no caution if advantage is played and a goal is scored** — 2026/27), stopping a promising attack (SPA), violent conduct, offensive gestures, covering the mouth while confronting an opponent (red, per 2026/27 profile flag), leaving the field in protest (red, per flag), second yellow → red, team official misconduct (coach cards).
- **Advantage**: referee model evaluates possession, position, number of attackers/defenders, quality of chance; can bring play back if the advantage does not materialise within ~3 s.
- Disciplinary consequences: card counts, suspensions across a ranked "season" are **not** applied (competitive fairness) but are shown as cosmetic history; red card leaves the team with 10 (7 minimum to continue).
- Mass confrontations: players converge after a bad foul (emotion-driven), captains calm down, referee separates, cards for instigators.

### 6.8 Offside (Law 11)
- Full geometric rule: position at the moment the ball is played by a teammate, any part of head/body/feet beyond the second-last opponent and the ball, in the opponents' half; not offside from goal kick, throw-in, corner; "deliberate play" vs deflection by a defender resets/does not reset; interfering with play / with an opponent / gaining advantage; delayed flag on close calls with VAR review after the phase ends; semi-automated offside visualisation (3D line rendering) in the VAR sequence.

### 6.9 Referee, assistants and VAR model
- Referee agent moves on a diagonal, positions to see incidents, has attributes: strictness, consistency, advantage tendency, card threshold, home-crowd susceptibility (Friends/Practice only; 0 in ranked; small, bounded, documented), fitness (positioning error grows late in the match). Whistle logic, arm signals, card show animations, talking-to/warning animation before cautions, book-keeping animation.
- Assistants: flag for offside/throw-in direction/fouls behind the referee, with a perception model (angle/distance error).
- VAR protocol (only in profiles with `var: true`): reviewable incidents (goal/no goal, penalty/no penalty, direct red card, mistaken identity); "check" (silent) vs "on-field review" (referee runs to the monitor; in-stadium announcement of the decision with a stylised PA line); clear-and-obvious threshold; time added to stoppage.

### 6.10 Tactics and team AI
- Formations (4-3-3, 4-2-3-1, 4-4-2, 3-5-2, 3-4-3, 5-3-2, 4-1-4-1 + Street presets), roles per position (e.g., inverted winger, false 9, box-to-box, deep-lying playmaker, sweeper keeper), team instructions: mentality (ultra-defensive → all-out attack), pressing intensity and trigger lines, defensive line height, offside trap on/off, width, tempo, build-up style (short/long/direct), counter-press, time-wasting when leading late (also emotion-driven), set-piece routines (data-authored), man-marking assignments.
- Team shape model: a dynamic reference-position grid deformed by ball position, phase (attack/defence/transition), possession, score state and match minute; role-based off-ball movement with anticipation; press/cover/balance triangle for defenders; goalkeeper starting-position model.
- Individual decision-making: utility-based evaluation of pass/dribble/shoot/clear/hold options scored on pass lane risk, expected threat (xT) gain, opponent pressure, fatigue, emotional state and player traits; assisted human control uses the same option evaluation to choose "the pass the player meant" (section 9.2).
- AI difficulty for practice/tutorial: reaction delay, error dispersion, pressing decisions and tactical adaptivity; ranked bots for placement are calibrated to specific Glicko ranges.
- Half-time (25-second real-time window for both players) allows formation, mentality, substitutions and set-piece takers; during play the four tactical presets apply instantly from the radial quick-menu, and substitutions are queued and executed by the referee at the next stoppage of ≥ 3 real seconds (goal, injury, card, VAR, goal kick). The sim never pauses for menus online.

### 6.11 Substitutions and bench
- 5 substitutions in 3 windows + half time (+1 in extra time) for Pro; rolling subs in Street; concussion substitutes per profile; substituted player must leave at the nearest boundary line within 10 s (flag) or receive a caution for delaying; injured-player substitutions during stoppages; players warm up on the touchline before entering; 4th-official board animation; the coach's substitution decision AI (fatigue, injuries, score state, emotion) for the AI side.

### 6.12 Crowd, home advantage and atmosphere
- Crowd model: attendance %, loudness, mood (drives chants, whistles, boos, silence, "olé" on possession streaks), reactions (roar on near miss, gasp, groans, applause for skill, jeers at diving, chants for a player after a goal), waves, phone lights at night finals, pitch invaders (never; keep it clean), flares (visual only, rules-profile off by default).
- Home advantage exists only in Friends and Practice (the host is "home"): crowd effects on **emotion** (confidence for home, anxiety for away) and bounded referee susceptibility, never attribute boosts. **Ranked matches are neutral**: split crowd, crowd emotion effects applied identically to both sides, referee crowd susceptibility = 0, and each player's stadium cosmetics apply only to their own view.

### 6.13 Statistics, commentary and post-match
- Live statistics: possession, shots (on/off target, blocked), xG (simple shot model), passes/accuracy, tackles, interceptions, fouls, cards, corners, offsides, distance covered, sprints, saves, big chances, momentum graph (section 7.8), heat maps, pass network.
- Commentary system (section 11) subscribes to events and emotional states; text lines localised, voice packs optional.
- Post-match: result, player ratings (0–10 model), man of the match, statistics, momentum timeline with emotional annotations, auto-highlights (goals, saves, cards, VAR, best skill, best emotional moment), shareable 15-second clip export (device-side video capture), trophy/rating changes, fair-play score.

---

## 7. THE EMOTIONAL AND PSYCHOLOGICAL MODEL ("MIND")

This is the feature that makes the game feel alive and that no competitor does well on mobile. It is research-based, transparent, bounded and fair. Document the design in `docs/MIND.md` with citations.

### 7.1 Research anchors (use these to justify defaults; add sources to `docs/MIND.md`)
- **Psychological momentum** is triggered mainly by scoring/conceding and by timing: a last-minute equaliser produces a much larger swing (up for the scorers, down for the conceders) than the same goal mid-match (Den Hartigh & Gernigon, 2019, *Science and Medicine in Football*). Momentum expresses itself as a network of confidence, perceived control, optimism and motivation.
- **Collective collapse and recovery**: teams collapse through cascading negative emotions (frustration, anger, anxiety, resignation) that spread between teammates; recovery requires regulation (leaders, communication, a reset event such as half-time). Model collapse as a positive-feedback loop with a leadership-driven damping term.
- **Emotional contagion** spreads through body language, facial expressions, touch and voice; captains/leaders amplify it; celebrating together after a success increases subsequent teammates' performance (e.g., penalty shoot-out research by Moll, Jordet & Pepping, 2010; touch/high-five studies in the NBA by Kraus et al., 2010).
- **Penalty pressure**: psychological factors outweigh skill and fatigue; "avoidance" kicks (a miss means elimination) are scored far less often than "approach" kicks (a goal wins) — Jordet & Hartman (2008) report roughly 62% vs 92%; pressure shifts attention inward (technique, fear of missing), produces inconsistent accuracy, hurried run-ups and gaze avoidance of the goalkeeper; goalkeepers who delay or "stare" increase the taker's anxiety.
- **Referee/crowd interplay**: crowd noise measurably biases referees toward the home side (documented in studies of stoppage-time and foul decisions). Keep this small, symmetric across matches and visible in the referee profile.
- **Anxiety and readiness**: competitive anxiety and self-esteem shape pre-match readiness; high composure players are less affected by stakes.

### 7.2 State per player (all floats 0–1, updated every 30 ticks = 1 real second)
**Primary states** driven by triggers (Appendix B): `confidence`, `anxiety`, `frustration`, `anger`, `morale`, `joy` (short-lived, fast decay). **Derived states**, recomputed each second from primaries and traits: `focus = clamp(0.5 + 0.3·confidence − 0.4·anxiety − 0.2·frustration + 0.1·composure/100)`; `resignation = EMA(1 − morale, half-life 90 real s) × max(0, −team_momentum)`. **Team-level**: `momentum` (−1..+1) = exponential moving average (half-life 45 real s) of signed event impacts (goal ±1.0, big chance ±0.4, big save ±0.3, card ±0.3, possession streak ±0.1, each with the timing multiplier); `cohesion` (0–1) = mean of the squad's leadership and sportsmanship traits, lowered by in-match conflict events (blame gestures, shoving) and restored by huddles/half-time; `collapse_risk = sigmoid(mean_anxiety + mean_frustration − cohesion − 0.5·momentum)`. Each player's `traits` (section 4) set baselines, gains and decay rates. Every state has at least one trigger, one gameplay channel (7.5) and one visible expression (7.7); a state without all three is deleted.

### 7.3 Triggers (event → delta; magnitude scaled by trait gains, stakes multiplier and timing multiplier)
Goal scored (self / assist / team), goal conceded (own error / teammate error / brilliance by opponent), big chance missed, big save, penalty scored/missed/saved, tackle won/lost, dribbled past ("nutmegged" extra), foul suffered without whistle, foul committed and carded, wrongly called offside (VAR-corrected later reduces it), VAR decision for/against, injury (self/teammate), substitution (taken off when playing well → frustration; brought on late → focus boost), crowd roar/boos, opponent provocation (shirt pull, dive), captain encouragement, teammate blame gesture, time remaining × score state (chasing/defending a lead), extra-time cramps, being on a winning/losing streak inside the match (momentum), half-time reset.
**Timing multiplier**: 1.0 for minutes 0–60, rising to 1.6 at 85+ and 2.0 in stoppage time/extra time. **Stakes multiplier**: 1.0 friendly, 1.2 ranked, 1.5 season final/cup, 1.8 penalty shoot-out, 2.0 for a kick that decides the shoot-out.

### 7.4 Contagion
Every second, each player's `frustration`, `anxiety` and `joy` diffuse to teammates within 15 m and to everybody via the captain (×2 weight) and via the goalkeeper for defenders. Leaders damp negative spread (`leadership` trait), hot-headed players amplify it. Celebration events (goal, save, shoot-out kick scored) broadcast `joy` and `confidence` to the whole team, more if the celebration is *together* (huddle) rather than solo — this is a choice the human player makes with a three-option prompt during goal celebrations: **Team** (full joy/confidence broadcast to teammates), **Solo** (large boost for the scorer, half broadcast), **Respectful** (half of Team's broadcast, but the opponents' frustration/anger gain from the goal is reduced by 30% and the scorer's fair-play score rises). It matters, and the effects are published in `docs/MIND.md`.

### 7.5 Effects on play (bounded; publish the table in `docs/MIND.md`; all symmetric for both teams)
| Channel | Max effect | Driven by |
|---|---|---|
| Pass/shot dispersion | ±8% | anxiety ↑ error, confidence ↓ error |
| First touch radius | ±6% | focus |
| Reaction/decision latency | ±60 ms | focus, anxiety |
| Sprint willingness / off-ball runs | ±15% | morale, momentum |
| Shoot-vs-pass bias | ±20% relative | confidence (over-confident players shoot from range) |
| Foul propensity / tackle recklessness | ±25% relative | anger, frustration |
| Dive/dissent propensity (AI-controlled players only; never card-producing for the human-controlled player) | ×0–2 | frustration × (100 − sportsmanship) |
| Resignation: walk-back speed, pressing distance, run frequency | −20% | resignation |
| Goalkeeper positioning error | ±5% | anxiety |
| Penalty success base | −12% … +4% | composure vs stakes, approach/avoidance framing, run-up hurry |
| Time-wasting behaviours | on/off | leading late + anxiety |
| Pressing intensity | ±15% | momentum, fatigue |

**Fairness rules:** effects are capped, deterministic given the event log and the seed, identical in formula for both teams, never applied to the *human input* itself (a player's stick and buttons are always honoured; emotions change what the *footballer* does with the intent, within the bounds above), and always accompanied by readable feedback (7.7). **Emotion never produces misconduct on its own for the human-controlled player**: its automatic behaviours are limited to protest animations and referee "talking-to" warnings. AI-controlled teammates may commit emotion-driven fouls within the ±25% cap and can be cautioned, but are never sent off through emotion alone (a second yellow or a straight red always requires an action the human triggered), and only after a visible warning state (anger glyph + commentary line) the human can act on (substitute, captain rally, change mentality). Ranked balance tests must prove that a team with the same inputs and mirrored emotional histories gets mirrored outcomes.

### 7.6 Regulation and recovery
- Half-time "team talk" choice (calm / motivate / demand / tactical) with different effects depending on state (e.g., "demand" helps a complacent team and hurts a collapsing one).
- Captain "rally" action (cooldown 20 match-minutes ≈ 105 real seconds) when momentum ≤ −0.5: reduces teammates' anxiety and resets the collapse feedback loop.
- Positive events in a collapse window decay the loop; high team cohesion accelerates recovery.
- Substitutions inject fresh `focus` and can be used as an emotional tool (AI coach does this).

### 7.7 Expression mapping (how the viewer reads the mind) — every state must be visible at 6-inch scale
- **Face** (blend shapes, ≥ 24 targets, ARKit-style naming): joy, relief, anger, frustration, fear/anxiety, disbelief, focus/determination, exhaustion, pain, shame, plus eye darts and blink rate that rise with anxiety.
- **Body language idle/locomotion variants**: chest-out confident stride vs slumped shoulders; hands on hips; hands on head after a miss; arms out "protest" toward the referee; clapping/encouraging teammates; pointing/organising (leaders); kicking the turf; shirt over face; kneeling; head-down walk back after conceding; slower walk back for resigned teams; bouncing on toes for focused goalkeepers; staring at the ball for anxious penalty takers.
- **Micro-events**: high-fives, hugs, huddles, "come on!" shouts (audio), shoving after fouls, captain pulling a teammate away, goalkeeper shouting at defenders, coach gestures on the touchline (abstract but visible), bench reactions.
- **HUD** (optional toggle, default on for beginners): small emotion glyph over the selected player, team momentum bar under the score, "collapse warning" pulse on the screen edge (Clash-style edge glow, in team colour), commentary lines that narrate mood.
- **Crowd** mirrors momentum (volume, chants, silence), which itself feeds back into the model — but only through the documented triggers.

### 7.8 Momentum timeline
Store per-second momentum and emotional aggregates in the match record; render as a graph in the post-match screen and use it to pick the "emotional highlight" clip. Expose it to commentary ("they have not been the same team since that missed penalty").

---

## 8. ART DIRECTION, ANIMATION AND CINEMATIC PRESENTATION

### 8.1 Style bible (`docs/STYLE_BIBLE.md`, written and approved before any asset is produced)
- **Stylised, not realistic**: exaggerated but athletic proportions (heads ≈ 1.3× realistic, hands and feet ≈ 1.3×, ball 1.15× real size in both sim and visuals per ADR-006), simplified facial features with big expressive eyes and brows, chunky readable silhouettes per body type (slim/athletic/stocky/tall), stylised hair as sculpted shapes.
- **Materials**: PBR-lite with deliberately simple albedo (few colour breaks), roughness pushed higher than real for soft gradients, subtle rim light for silhouette separation, grass as tiled stylised texture + colour variation + mowing stripes; no photoreal noise textures.
- **Colour**: saturated team colours guaranteed to differ in hue *and* luminance (automatic kit-clash resolver switches to away kits; colour-blind mode swaps to pattern-coded kits); referee always high-contrast; ball white with bold panel pattern for spin readability.
- **Lighting**: one dominant directional light (sun/floodlights), baked lightmaps for the stadium, real-time shadows only for players in the camera's near tier, blob shadows for the rest; night matches use 4 mast floodlights with baked contribution and stylised lens bloom.
- **Readability rules**: selected player ring + arrow; pass/shot intent indicators; ball trail when > 15 m/s; off-screen ball indicator; team colours on shorts *and* socks; numbers on backs ≥ 24 cm equivalent; no visual clutter behind the ball.
- **Reference approach** (not assets): Supercell's readability, feedback and clean UI; broadcast graphics of major tournaments for camera language and lower-thirds; Pixar-style facial expressiveness.

### 8.2 Asset pipeline (fully scripted, reproducible, no manual sculpting)
- `tools/blender/` `bpy` scripts generate: base body meshes per body type from parametric primitives + subdivision + sculpt-like deformers, rig (Rigify humanoid → exported as glTF with a clean humanoid bone map), facial blend shapes generated from a parametric face system (brow/eye/mouth controls), kits as UV-mapped texture layers (procedural patterns: solid, stripes, hoops, halves, sash, gradient, pinstripes), boots, gloves, hair shapes, referee kit, stadium modules (stands, roof, tunnel, dugouts, boards, floodlights), ball with panel patterns. Everything exported to `.glb` with LOD0/1/2 and validated by an importer test.
- **Motion**: produced by the animation production pipeline of section 8.8 — authored by the agent from pose grammars in `bpy`, captured from the human's own videos, or generated procedurally at runtime (Godot 4.6 IK modifiers such as two-bone IK for legs/arms and FABRIK for spine chains, `LookAtModifier3D` for head/eye gaze, foot planting); commercially licensed libraries (CMU, Mixamo, CC0 packs) only for generic human motion and always through the licence manifest. Animation list in Appendix C.
- **Crowd**: two tiers, both counted in the triangle budget — near tier (≤ 60 m from the camera, ≤ 1,500 instances) MultiMesh spectators ≈ 300 tris with vertex-animation textures (VAT); everything else billboard imposters ≤ 12 tris with the same 8 loops baked as flipbooks (sit, stand, cheer, wave, despair, applause, jump, phone light); colour by fan blocks; density by attendance.
- **Textures**: ASTC (iOS/Android) with ETC2 fallback; atlases per team; 2048² max for characters at LOD0; mipmaps; no runtime texture generation on the main thread.

### 8.3 Animation quality bar (the "Clash-level" checklist — every animation is reviewed against it)
- The 12 principles: squash & stretch (subtle on bodies, bold on the ball, kit and hair), anticipation (wind-up before every kick, crouch before jump), staging (camera + pose read in silhouette), straight-ahead & pose-to-pose (blend spaces built from key poses), follow-through & overlapping action (hair, kit, arms), slow-in/slow-out, arcs (foot paths, ball arcs), secondary action (facial reactions during moves), timing (snappy: contact frames on the beat), exaggeration (celebrations, dives, protests), solid drawing (no limb intersections, volume preserved), appeal (each body type has charm).
- Game-feel additions: input-to-visible-reaction ≤ 3 frames at 60 FPS; hit-stop 2–4 frames on strong tackles and power shots; camera micro-shake on posts/crossbar/goals; ball impact deformation; grass particles on slides; sweat/breath (cold nights) particles; dynamic blend times (fast for gameplay, longer for cinematics); motion-matching-style locomotion via blend-space + root-motion trajectory matching (stretch: true motion matching).
- Facial: eyes always alive (saccades, blinks), expressions blend with locomotion, gaze targets (ball, opponent, referee, crowd, teammate).
- Contact accuracy: foot-ball contact uses IK to hit the actual ball position; headers align the forehead; goalkeeper hands reach the actual ball with two-bone IK; tackles resolve with ragdoll-lite blends (physical bones on hit) and return to animation.

### 8.4 VFX
Goal explosion (team-coloured confetti, net ripple, flash, stadium light pulse), near-miss "woodwork" flash, foul impact puff, card presentation flourish, VAR screen frame, momentum edge glow, skill-move trails, rain (screen + world), floodlight volumetrics (baked), breath, sweat, grass clumps, ball trail, ball spin lines, celebratory pyro (cosmetic), UI particles for trophies. All VFX are GPUParticles3D/2D with budgets (section 12).

### 8.5 UI/UX visual language
Rounded chunky panels, big tappable elements (min 48 dp), radial timers, bold numerals, team-colour accents, one font family with 3 weights, animated transitions (≤ 250 ms), always-visible score/clock, non-fullscreen popups keeping the pitch visible, haptic feedback on key events.

### 8.6 Stadium and world
Modular stadiums with 3 tiers (small/medium/large), roof variants, day/night/weather, pitch wear over the match (cosmetic), advertising boards with fictional brands (procedurally generated wordmarks), tunnel, dugouts with bench players and coaches, 4th official board, medical staff, ball kids (optional), photographers' flashes behind the goal at big moments.

### 8.7 Cameras and cinematics (`CameraDirector`)
- Gameplay cameras: Broadcast (default: elevated side, dynamic zoom on ball speed and density), Tele (tight), Dynamic Action (behind attacker in the final third), End-to-End (Street), Fixed Tactical (top-down-ish). All with damping, look-ahead, anticipation of long balls, safe-area framing that keeps the selected player and the ball on screen.
- Event cinematics (skippable, ≤ 4 s, never block input longer than the real stoppage): kick-off pull-back, goal (3-shot sequence: scorer close-up → team celebration → dejected opponents/crowd; picks shots by emotion), big save close-up, card presentation (referee + player faces), injury/physio, VAR (referee jog to monitor, replay wipe, decision banner + PA announcement), substitution board, penalty (taker walk, goalkeeper stare-down, crowd hush, alternating close-ups; the emotional model drives the taker's posture), full-time reactions (winners' huddle, losers on the turf), walk-out and handshakes, trophy lift for finals.
- Replays: instant replay of goals/saves/fouls with 3 camera angles, slow motion (0.25×), free camera in post-match, highlight reel generator (scoring function over events + emotion + camera aesthetics), export to device video through a native plugin (ReplayKit on iOS, MediaProjection + MediaCodec on Android); Godot's Movie Maker mode (`--write-movie`) is a desktop, whole-session tool used only for offline marketing captures. Online replays play back the server snapshot stream (2.2), never a re-simulation.
- Cinematic rendering toggles allowed only during cinematics: depth of field, motion blur, higher shadow resolution, extra crowd density near the camera.

### 8.8 Animation production and licensing — make it, own it, monetise it

**Goal:** every animation shipped in the game is either created by us (full ownership) or used under terms that explicitly permit royalty-free commercial use in a video game; every clip has a manifest entry; CI blocks anything else. "Free to download" is not the bar — **commercial-OK is the bar**, because the game will be monetised.

#### 8.8.1 Licence policy and manifest
- `data/animation/MANIFEST.json`: one entry per clip — `id`, `source` (`authored | captured | procedural | library | purchased`), origin URL or shot id, licence (SPDX id or named terms), `commercial: yes/no`, attribution text if required, modifications made, redistribution restrictions, date verified, verifier. `tools/licence_check.py` runs in CI and fails the build if any clip under `game/characters/animations/` lacks an entry, has `commercial: no`, or has an unverified licence older than 180 days.
- **Allowed by default**: our own authored and captured clips; CC0; CC-BY (credit shown in the in-game credits screen); the CMU Graphics Lab motion capture database (free for any use, credit requested); Mixamo animations (Adobe's Mixamo FAQ states characters and animations are royalty-free for personal, commercial and non-profit projects including video games — quote the current FAQ and the Adobe General Terms in `docs/LICENSES.md`, re-verify at every release, and never redistribute the raw clips outside the game build); Quaternius and Kenney packs (CC0); purchased packs whose EULA allows use in commercial games (the human approves every purchase).
- **Forbidden**: anything CC-BY-NC, CC-BY-ND or research-only (e.g., Ubisoft LaFAN1, Bandai Namco motion datasets, AMASS, Motion-X and HumanML3D-derived data); **outputs of text-to-motion or motion-generation models trained on research-only datasets**, unless the model's authors explicitly license outputs for commercial use (treat as forbidden by default and record the check); clips extracted from games or films; anything whose licence cannot be quoted.
- Tool licences never taint outputs: Blender (GPL) and its add-ons, MediaPipe (Apache-2.0), FreeMoCap (AGPL tool), Godot (MIT) produce data we own.

#### 8.8.2 Production methods, in order of preference (the `animation` agent exhausts 1–3 before proposing 4–5)
1. **Authored by the agent in Blender (`bpy`) from pose grammars.** The agent writes animations as *data*, never by dragging bones: `tools/anim/poses/*.json` define key poses (bone → rotation/translation with timing and easing) and `tools/anim/build_clip.py` assembles clips from a **football motion grammar**: locomotion cycles from contact / passing / high-point poses; kicks as wind-up → plant → contact → follow-through with the contact frame pinned to a fixed tick; headers, dives, tackles, saves, celebrations, protests and injuries as parameterised templates (power, foot, direction, intensity, emotional style). The builder applies the 12 principles procedurally (anticipation offset, overshoot-and-settle curves, arcs through IK targets, secondary layers for arms and head, squash-and-stretch on ball and kit), mirrors left/right, generates the four emotional variants (confident / neutral / anxious / exhausted) by blending style poses, and exports glTF with named tracks and event markers (`contact`, `plant`, `land`, `release`). This is the primary method for every football-specific action in Appendix C and it makes the animation the game's own identity.
2. **Captured by us from video (self-mocap).** The human records the moves in `tools/mocap/SHOTLIST.md` with a phone (two phones for multi-view when possible): real kicks, runs, dives, tackles, celebrations, protests — 60–120 fps, wide angle, plain background, contrasting clothing. `tools/mocap/video2bvh.py` (MediaPipe Pose landmarks or FreeMoCap → 3D keypoints → filtering → BVH/glTF) produces raw motion; `tools/mocap/clean.py` fixes foot sliding, jitter and joint limits; the result is retargeted and then polished with method 1's builder (re-time contact frames, exaggerate, add secondary motion). We own the result outright. Ideal for locomotion and full-body naturalness; friends who play football are ideal actors.
3. **Procedural at runtime.** Gaze, foot IK, reach IK for goalkeeper hands and headers, physics-driven secondary motion, ragdoll-lite hit reactions, blend-space locomotion from a handful of authored cycles, and additive layers (breathing, fatigue slump, anxiety fidget). Cuts the clip count by roughly 40% and makes every clip react to the actual ball.
4. **Licensed libraries with commercial rights** (CMU, Mixamo, CC0 packs), retargeted with Godot's BoneMap and polished with method 1. Only for generic human motion (walking, idling, gestures), never as the source of the game's identity, always through the manifest. Mixamo has no API: the agent writes the wanted clips into `tools/mocap/MIXAMO_LIST.md`, the human downloads them once, and the importer records each one in the manifest with the quoted terms.
5. **Purchased packs or paid mocap-from-video services** (commercial tiers of video-mocap SaaS products) only with the human's written approval, the EULA quoted in the manifest, and only for gaps the other methods cannot close inside the milestone.

#### 8.8.3 Toolchain to install (an M0 task; versions recorded in `docs/TOOLCHAIN.md`)
Blender 4.x LTS with `bpy`, Rigify and the glTF exporter, runnable headless (`blender -b`); Python 3.11+ with `numpy`, `scipy`, `mediapipe`, `opencv-python`, `ffmpeg`; FreeMoCap (optional, multi-camera); Godot 4.6 CLI for import validation and retargeting tests; `tools/anim/render_sheet.py` (Blender Eevee headless: a 12-frame contact sheet plus a 2-second MP4 from three angles per clip); `tools/anim/lint.py` (metrics: foot-slide distance per step, joint-limit violations, velocity discontinuities, contact-frame timing error, root-motion drift, silhouette-change rate as a readability proxy); `tools/anim/retarget.py` (BoneMap profiles for our rig and for CMU/Mixamo skeletons). Everything runs from the command line so the agent can run it, read the output and iterate without a human in the loop.

#### 8.8.4 Skills to create in `.claude/skills/` (preloaded through the `skills` field of the agents' frontmatter)
- `anim-author`: the pose grammar, the builder API, the 12-principles parameters, naming and event-marker conventions, glTF export settings, one fully worked example (a finesse shot from idle).
- `anim-review`: the review loop — render the sheet → read the PNG frames → judge against the Appendix C checklist (silhouette, anticipation, contact, follow-through, appeal, readability at 25% scale) → write fixes as parameter changes → rebuild; after 3 iterations escalate to the human with the sheet attached.
- `anim-lint`: how to run and read the metrics; thresholds (foot slide ≤ 2 cm per step, contact-frame error ≤ 1 frame, zero joint-limit violations, root drift ≤ 1 cm per cycle).
- `mocap-capture`: the shot list, recording instructions for the human, `video2bvh`, cleaning, retargeting, and how to fold a captured clip into the builder.
- `licence-check`: manifest schema, the allowed/forbidden lists above, how to quote terms, the CI gate.
- `godot-anim-integration`: AnimationTree states, blend spaces, event markers → sim events, LOD rules, retarget validation, the "no T-pose" test.

#### 8.8.5 Review loop and acceptance
Every clip: build → render sheet → the agent looks at the frames → lint → Godot import test → in-game capture at gameplay camera distance. Acceptance = lint green + Appendix C checklist signed by `reviewer` + manifest entry + the 6-inch readability check (the action is recognisable at 25% render scale). Target: ≥ 80% of the football-specific clips in Appendix C are authored or captured by us; library clips cover only generic motion.

#### 8.8.6 Human actions
Record the shot list (about two hours), approve purchases and subscriptions, and watch each milestone's animation reel. Everything else in this pipeline is the agent's job.

---

## 9. CONTROLS, UX AND ONBOARDING

### 9.1 Principles (Clash-inspired)
Put the player in a match within 20 seconds of first launch; teach by doing, never by reading; every input has instant visual, audio and haptic feedback; the lower half of the screen is where thumbs live; popups never hide the pitch; no free-text chat; consistent session lengths; loading ≤ 4 s into a match; one clear "next action" on every screen; maximum 6 offers per shop screen (leaderboards and friend lists scroll); no dark patterns.

### 9.2 Landscape two-thumb scheme (Pro and Street)
- **Left thumb**: floating virtual stick (appears where the thumb lands), dead zone 8%, radial acceleration curve, sprint on outer ring or via right-side button (setting).
- **Right thumb** (context-sensitive buttons with big hit areas + gesture layer):
  - In possession: **Pass** (tap = ground pass to the best option in stick direction; hold = driven; swipe = through ball in swipe direction; the first tap always fires immediately and a second tap within 200 ms requests the return ball for a one-two), **Shoot** (hold = power meter with a Clash-style radial fill; release timing = accuracy window; swipe up = chip; swipe sideways = curl), **Cross/Lob** (tap = cross; hold = lofted through), **Skill** (drag on a small skill-stick: 8 directions = 8 skill moves; tap = stop-and-shield), sprint.
  - Out of possession: **Press/Tackle** (tap = standing tackle when close, hold = jockey/contain, swipe = slide tackle), **Teammate press** (hold = secondary AI press), **Switch player** (tap = nearest to ball; swipe = direction), sprint.
  - Goalkeeper moments: **Rush**, **Dive** direction via swipe during penalties/1-on-1.
- **Assist levels** (Beginner / Standard / Pro): auto-switch, auto-sprint, pass-target assistance strength, shot-aim assistance, automatic shielding. Beginner is default; the tutorial suggests Standard after 10 matches.
- **Forgiveness**: input buffering (150 ms), coyote-time for shots when the ball bounces, "intent resolution" (the pass goes to the teammate the stick direction plus context most likely means, computed by the same utility model as the AI, section 6.10).
- **Set-piece controls**: aim reticle + power + curl gesture; wall creep/jump for defenders; goalkeeper penalty guess with swipe and a bluff option (stay still).
- **Emotional controls**: after goals, a 2-second choice "Team celebration / Solo / Respectful" with different contagion effects (7.4); captain "Rally" button when available; "Protest" is automatic and emotion-driven (never a button — do not gamify dissent).

### 9.3 Feedback
Selected-player ring in team colour, target-teammate highlight when passing, shot-power radial, first-touch success flash, tackle timing window colour, offside line preview when making runs (Beginner), stamina ring around the selected player, momentum bar, edge glow in stoppage time (Clash-style overtime cue), haptics for kicks/tackles/goals/whistles (Android and iOS haptic APIs via plugin).

### 9.4 Onboarding
Tutorial 5v5 inside a real stadium: 90 seconds, four beats (move & pass → shoot → defend → set piece), narrated by the commentator, each beat succeeds with generous assists; then 5 "placement" matches vs bots with progressive AI; only then ranked matchmaking. Contextual tips appear at most once each and can be disabled.

### 9.5 Menus and flow
Home (Play button dominant, trophies, season timer, friends online, daily "Cup Weekend" banner) → Mode select (2 cards) → Team select (carousel with kit clash auto-resolve) → Matchmaking (countdown, opponent card reveals only after match is found, no cancel abuse: 10-second cooldown) → Pre-match (formation/tactics, 20 s timer) → Match → Post-match (result cinematic, ratings, momentum graph, highlights, rating changes, rematch/friend request) → Home. Settings: controls, assists, graphics tier, accessibility, account, privacy.

### 9.6 Stretch: portrait one-hand Street layout
Tap-to-move-and-pass (tap a teammate = pass, tap space = run there, swipe = shoot toward swipe, hold = shield), auto-defending with tap-to-tackle. Only after the landscape scheme ships and is tested.

### 9.7 Accessibility
Colour-blind kit patterns and markers, text scaling, screen-reader labels on menus, subtitles for commentary, reduced motion (disables camera shake, hit-stop, DOF), left-handed mirror layout, remappable button positions and sizes, haptics toggle, photosensitivity-safe VFX (no full-screen flashes > 3 Hz).

---

## 10. MULTIPLAYER, RANKING AND COMPETITIVE INTEGRITY

### 10.1 Topology
`Client (Godot) ⇄ Nakama (auth, matchmaking, social, leaderboards, storage) ⇄ Match Allocator ⇄ Fleet of Godot headless match servers (SimCore + MatchServer)`. Clients receive a signed match ticket `{matchId, serverAddr, token, teams, profile}` from Nakama and connect directly to the match server. **The simulation seed is generated on the match server and never sent to clients before or during the match** (a client that knows the seed could pre-simulate deflections); it ships inside the replay after the result is submitted. The server reports the final result to Nakama with a signed payload including the replay hash.

### 10.2 Match server behaviour
- Runs SimCore at 30 Hz per match; N matches per process with a work-stealing scheduler; hard cap on per-tick CPU; overload → refuse new allocations.
- Input handling: accepts `InputFrame`s with tick ≤ serverTick + 2; frames for ticks already simulated are applied at the current tick and counted as *late* (no rollback; the late rate feeds the jitter buffer and the network HUD); frames older than 6 ticks are dropped. The jitter buffer per client adapts to measured RTT; missing inputs are extrapolated (hold last input up to 6 ticks, then neutral) and the client is notified.
- Snapshots at 20 Hz, delta-compressed, quantised (positions 1 cm, velocities 5 cm/s, angles 1°), priority-sorted (ball and nearby players first) under a per-client bandwidth budget (target ≤ 12 KB/s down, ≤ 4 KB/s up, both including UDP/DTLS overhead).
- Validates every input: magnitude, rate, gesture legality for the current state; logs anomalies for the anti-cheat scorer.
- Records the full input log, the seed and the 20 Hz snapshot stream; on match end writes a replay file (`.replay`: header, snapshot stream, event log, input log, seed) and its hash; keeps a 60-second rolling snapshot ring for reconnection.
- Match lifecycle: allocate → warm-up (both clients loaded, max 30 s) → play → end → result submit → linger 20 s for post-match handshake → recycle.

### 10.3 Client netcode
- Predict only the controlled player's locomotion and the *start* of actions (animation, sound, haptic) instantly; the ball follows server state (interpolated) with a short "pre-fire" ball tween for shots/passes that is corrected on the first server snapshot (max correction 0.3 m/tick, smoothed).
- Interpolation buffer 100 ms default, adaptive 60–160 ms; extrapolate ≤ 100 ms on loss.
- Reconciliation smoothing for the controlled player (position error < 0.5 m corrected over 6 ticks; > 2 m snap with a dust VFX).
- Network HUD indicator (RTT, loss) and a settings toggle for a "stability" mode (larger buffer).
- Clock sync: NTP-style handshake every 5 s; server tick is authoritative.
- **Desync definition** (used by tests, telemetry and the P0 policy): the controlled player's prediction error exceeds 1 m for more than 10 consecutive ticks, or a client renders a match event the server never emitted, or a replay/verification hash mismatches.

### 10.4 Reconnection, disconnection and forfeits
- Disconnection triggers to handle explicitly: app backgrounding and incoming calls (iOS suspends sockets within seconds), Wi-Fi ↔ cellular IP changes (re-handshake with the token; the ENet peer is recreated), audio-session interruptions, and plain packet loss.
- Disconnected player: a stand-in AI takes over immediately at *Beginner* difficulty with the leaver's tactics frozen, so disconnecting while ahead is never an advantage (fair-play flags late-lead disconnect patterns); the opponent sees a subtle "opponent reconnecting" badge (never a full popup, never a fake "opponent left"); 90 s grace; the match continues.
- Reconnect flow: token re-auth → snapshot ring catch-up → seamless control return with a 2-second "you're back" banner.
- Forfeit after 90 s or if the disconnected player closes the app; result counts as a loss for the leaver; repeated leavers get fair-play penalties and matchmaking pools.
- Server crash: matches in progress are voided for both (no rating change) and logged as incidents; the replay to the last snapshot is preserved.

### 10.5 Anti-cheat and integrity
- Server authority for all outcomes; clients never send positions, timings or results.
- Input plausibility scoring (super-human reaction consistency, impossible gesture rates, scripted patterns) → shadow flags → human review queue in an admin tool; automated action only for hard proof (protocol violations).
- Platform attestation: Play Integrity (Android) and App Attest (iOS) verified in Nakama before ranked play; jailbroken/rooted devices allowed only in unranked.
- Replay verification: random 5% of ranked matches re-simulated on a verifier worker from `(seed, inputs)`; hash mismatch → incident.
- Win-trading/boosting: matchmaking avoids repeated pairings, flags accounts with abnormal win rates against the same opponents, rate-limits private-match ranked rewards (private matches never give trophies).
- Rate limits and signed requests for every Nakama RPC; server-side validation of cosmetics ownership; no client-side economy math.

### 10.6 Matchmaking and rating
- Glicko-2 per mode (τ = 0.5, rating period = 1 day); matchmaking window widens from ±50 to ±300 rating over 30 s, trophy-gap cap 200, region preference with latency measurement to server regions (EU/NA/SA/Asia/Oceania), cross-region only with consent after 60 s.
- Trophies: the single formula of section 5 (Δ = round(30 × (S − E)), +5 underdog bonus on a win), floor at league thresholds for the first week after promotion; season length 4 weeks; end-of-season decay above Legend.
- Leaderboards via Nakama (global, country, friends) with daily snapshots and season archives; ties broken by fewer matches.
- Bots: only in placement, practice and as disconnect stand-ins; never silently in ranked.

### 10.7 Telemetry and live ops
Structured events (match start/end, disconnects, RTT histograms, frame-time histograms per device tier, input latency, rule events frequency, emotional state distributions, funnel steps) into Nakama analytics or an external pipeline; dashboards for balance (win rate by team/tactic, goal distribution per minute, penalty conversion by composure bucket) and stability (crash-free rate, desync rate = 0 target).

---

## 11. AUDIO AND COMMENTARY

- **Commentary engine**: event-driven, two voices (play-by-play + colour), lines selected by event type, context (score, minute, momentum, emotional state, player traits, streaks), with anti-repetition memory and priority interruption (a goal interrupts anything). Text-first (subtitles) with optional synthesised voice packs produced offline by a TTS pipeline the human approves; never blocking gameplay. Localised (EN/IT first).
- **Crowd**: layered loops (ambience, murmur, chant beds per fan culture, reaction one-shots) mixed by the crowd model; procedural chant rhythm synced to momentum; silence as a weapon after conceding.
- **Pitch SFX**: kicks by type (power, finesse, pass, header, save), ball on post/bar/net, tackles, slides, whistles (short/long/three for full time), referee voice, player calls ("man on!", "time!", "keeper!"), breathing when fatigued.
- **Music**: menu and result stingers only; original, generated or licensed royalty-free; never during play.
- **Haptics**: mapped from the same event bus with intensity tiers; respects the accessibility toggle.

---

## 12. PERFORMANCE, DEVICE TIERS AND BUDGETS

| Tier | Reference devices (choose real equivalents when profiling) | Target | Settings |
|---|---|---|---|
| Low | 2019-era Android (4 GB RAM, Adreno 610 class), iPhone SE 2 | 30 FPS locked, 720p render scale | LOD2 far, blob shadows, no post-processing, crowd density 40%, 22 players still fully simulated |
| Mid | 2022-era mid-range Android (Snapdragon 7-series class), iPhone 12 | 60 FPS, 1080p-equivalent | LOD1, one shadow cascade, bloom, crowd 70% |
| High | 2024+ flagships | 60/120 FPS, native | LOD0, two cascades, SSR off (mobile), full crowd, extra VFX |

**Budgets (CI-enforced on the benchmark scene "Night Rain Final, 22 players in frame"):** ≤ 120 draw calls (Mid), ≤ 350k triangles in frame, ≤ 220 MB texture memory, ≤ 700 MB total RAM (Low), sim tick ≤ 2 ms on Mid CPU, presentation ≤ 12 ms on Mid GPU, GC/alloc-free hot paths (pre-allocated arrays, no per-frame string ops), shader compilation pre-warmed at load (Godot shader cache + warm-up scene), no runtime `load()` in match, audio ≤ 48 voices.
**Battery/thermal** (human device checklist, not CI): a 10-minute online match on the named Mid device ≤ 2.5% of a 4,500 mAh battery (≈ 110 mAh, read from the OS battery stats); thermal throttling detection lowers render scale dynamically, never sim rate.
**Startup**: cold start to menu ≤ 6 s (Mid), match load ≤ 4 s; install size ≤ 350 MB total, delivered as a ≤ 150 MB base plus Play Asset Delivery (Android) / On-Demand Resources (iOS) packs, because Google Play's compressed download limit for the base AAB is 200 MB.
**Profiling routine**: every presentation PR runs `tools/profile_scene.sh` on the human's devices (script + instructions) and attaches the frame-time histogram; the performance-engineer subagent owns regressions.

---

## 13. QUALITY ASSURANCE — HOW "BUG-PROOF" IS ACHIEVED

### 13.1 Test pyramid
1. **Unit tests** (gdUnit4 or GUT; ADR-003): every Law, every action resolver, every emotion trigger, ball physics against analytic solutions (free flight, bounce, roll), formation math, rating math, protocol encode/decode round-trips, quantisation error bounds.
2. **Property-based tests**: random inputs for thousands of ticks must never violate the invariants in Appendix A (fuzzing the sim).
3. **Scenario tests** (`tests/scenarios/*.json`): scripted match situations with expected referee decisions (offside edge cases, handball, DOGSO with advantage and goal, 8-second rule → corner, penalty double touch, dropped-ball placement, concussion substitution, extra-time substitution window, shoot-out reduction when a team is down to 10, VAR overturn, quick free kick, foul throw, goal kick with attackers inside the box, delayed offside flag, offside from deliberate defensive play vs deflection, own goal attribution, goalkeeper sent off with no substitution left, match abandoned below 7 players, shoot-out coin toss and goalkeeper replacement rules, queued substitution executed at the next eligible stoppage). Each scenario has a replay and a human-readable description.
4. **Replay/determinism tests**: record → replay → hash equality; cross-platform hash comparison job.
5. **Soak tests**: 1,000 bot-vs-bot matches per night per profile (CI), 100 per PR; report statistics distributions **per format at game density (ADR-005)** — Pro (8 real minutes): goals per match 2–4, shots 6–12 per team, fouls 4–10, cards 0–3, injuries 0–0.4, penalties 0.1–0.25, offsides 1–4; Street (3 minutes): goals 2–6; bands are provisional (±50% wider) until M3 tunes the AI — and flag drift outside bands; zero crashes, zero invariant violations, no match longer than the expected real duration + 25%.
6. **Netcode chaos tests**: two headless clients + one server under `tc netem`-style emulation (loss 0–15%, jitter 0–150 ms, reorder, 5-second blackouts, reconnection mid-goal); assert no desync, correct forfeits, bandwidth budgets, prediction error bounds.
7. **Presentation tests**: animation state-machine coverage (every sim event maps to an animation; no T-poses; no clip missing), visual regression on the 12 money shots, HUD safe-area tests on 6 aspect ratios, localisation overflow tests.
8. **Device tests**: scripted 10-minute match on each tier with frame-time, memory, battery and thermal logs; pass/fail vs budgets.
9. **Human playtests**: a checklist per gate (readability at arm's length, "could I tell what the player felt?", control comfort, confusion points), recorded and stored in `docs/PLAYTESTS/`.

### 13.2 Definition of Done (per task)
Code + tests + docs updated + `tools/run_match.sh` green + CI green + reviewer subagent approval + (for presentation) screenshot/video attached + ADR if a decision was made + `docs/STATUS.md` updated.

### 13.3 Bug policy
Every bug gets a failing test first. Desyncs and invariant violations are P0 and block releases. Every crash is reproduced from a replay before it is fixed.

---

## 14. THE SUBAGENT TEAM — ROLES, CONTRACTS AND ORCHESTRATION

Create these agents as Claude Code subagents (`.claude/agents/<name>.md`, each with a focused system prompt, the tools it needs and the file paths it owns). The Lead is **you, the main session** — not a subagent — and the only one that merges to `main`. Use git worktrees for parallel work. Every subagent returns: a summary, the list of files changed, the tests it ran with results, open questions, and risks. If a subagent cannot verify something (no device, no GPU), it must say so explicitly instead of claiming success.

| Agent | Owns | Delivers | Must never |
|---|---|---|---|
| *Lead (main session, no agent file)* | plan, ADRs, integration, gates, `docs/` | phase plans, merges, status | skip a gate |
| `sim-core` | `sim/physics`, `sim/events`, `sim/replay`, sim API | deterministic core, replay system, determinism tests | touch presentation |
| `rules-referee` | `sim/rules`, `data/rules` | every Law as code + scenario tests, referee/VAR agents, stoppage-time model | hard-code profile values |
| `ai-tactics` | `sim/ai` | team shape, roles, decision utility, set-piece routines, difficulty tiers, coach AI | use engine physics or randomness outside the seeded stream |
| `mind` | `sim/emotion`, `docs/MIND.md` | emotional model, triggers, contagion, effects table, fairness tests, expression map | exceed the effect caps |
| `netcode` | `net/`, `server/` | protocol, server loop, prediction, interpolation, reconnection, chaos tests | trust the client |
| `backend` | `backend/`, Nakama config, docker | auth, matchmaking, Glicko-2, trophies, seasons, leaderboards, friends, attestation, replay verifier | compute results outside the server |
| `animation` | `game/characters`, `tools/anim`, `tools/mocap`, `data/animation/MANIFEST.json` | the 8.8 pipeline (pose grammar, builder, self-mocap, review loop), rigs, animation trees, blend spaces, IK, facial system, retargeting, Appendix C coverage | leave a sim event without an animation; ship a clip without a manifest entry or with a non-commercial licence |
| `tech-art` | `game/vfx`, shaders, lighting, LODs, `tools/blender` materials | style bible implementation, VFX, lighting, crowd VAT, budgets | exceed budgets |
| `asset-pipeline` | `tools/blender`, importers | bpy generators for bodies, faces, kits, stadiums, ball; glTF validation; licence records | ship an asset without a licence entry |
| `ux-ui` | `game/ui`, `game/controls` | touch schemes, assists, HUD, menus, onboarding, accessibility, localisation | block gameplay with popups |
| `cinematics` | `game/cameras`, `game/cinematics` | camera director, event cinematics, replays, highlight generator, clip export | block input longer than the real stoppage |
| `audio` | `game/audio`, `game/commentary` | event bus mapping, commentary engine and lines, crowd model, haptics | play music during matches |
| `qa` | `tests/`, `tools/run_match.sh`, soak/chaos jobs | test suites, scenario library, invariant checks, statistics bands, bug repro from replays | mark a failing suite as passing |
| `performance` | profiling tools, budgets, device tiers | frame-time reports, optimisations, thermal/battery handling, CI budget checks | lower the sim tick rate |
| `security` | anti-cheat, attestation, rate limits, privacy | threat model, input plausibility scoring, review tooling, GDPR/COPPA data map | store personal data outside the data map |
| `devops` | CI, exports, Docker, fleet, monitoring | pipelines, signed builds, server images, dashboards, alerting | expose secrets in the repo |
| `release` | store listings, compliance, age rating, privacy labels, changelogs | store-ready builds and metadata | use real trademarks |
| `reviewer` | read-only | independent review of every PR against principles, budgets and DoD | approve untested code |

**Orchestration rules:** (1) Plan each phase into tasks with owners, dependencies and a task class (14.1) in `docs/PLAN_M<n>.md`; (2) run independent tasks in parallel; (3) every task ends with `qa` + `reviewer` passes; (4) the Lead integrates, runs the full suite, updates `docs/STATUS.md` and produces the gate artefacts (build, test report, 30–60 s capture, screenshot set, cost and routing report); (5) when blocked by something only the human can do (device profiling, store accounts, purchases, licence approval, mocap recording), write it in `docs/HUMAN_ACTIONS.md` and continue with other work; (6) never expand scope beyond the current phase; park ideas in `docs/BACKLOG.md`.

### 14.1 Model routing and token efficiency (automatic)

**Principle:** the cheapest model that passes the gate, chosen per task by a rubric, escalated on failure, and re-tuned from measured outcomes. Tokens are a budget tracked like frame time; quality is defined by the gates, never by the model used.

**Tiers** (Claude Code subagent frontmatter accepts `model: haiku | sonnet | opus | fable | <full model id> | inherit`; map the tiers to the models available in the account in `docs/MODEL_ROUTING.md` and re-check when new models appear):
- **Tier B — fast and cheap** (e.g., `haiku`): mechanical, well-specified, tool-verifiable work: lint/format, running suites and reporting, manifest and licence checks, asset validation, template-driven generation (clubs, kits, variants, localisation tables), changelogs, telemetry event definitions, render-sheet runs.
- **Tier A — balanced** (e.g., `sonnet`): standard implementation with tests inside one module against a clear spec, data authoring (formations, set-piece routines, commentary lines), animation building from the grammar, UI screens, tools and scripts.
- **Tier S — strongest** (e.g., `opus` or `fable`): architecture and ADRs, SimCore determinism and fixed-point math, rules edge cases (offside, advantage, VAR), netcode and prediction, anti-cheat and rating math, emotional-model fairness proofs, integration of parallel work, root cause of desyncs and P0 bugs, independent review of Tier S changes.

**Default assignment per agent** (set in each agent's frontmatter; the auto-tuning loop below may change it): `sim-core` S; `rules-referee` A, S for offside/VAR/advantage; `ai-tactics` A; `mind` A, S for fairness proofs; `netcode` S; `backend` A, S for anti-cheat and rating math; `animation` A, B for batch builds and render sheets; `tech-art` A; `asset-pipeline` A, B for batch generation; `ux-ui` A; `cinematics` A; `audio` B for line tables, A for the engine; `qa` B for running suites, A for writing scenario tests; `performance` A; `security` S; `devops` B for pipelines, A for fleet work; `release` B; `reviewer` S for Tier S changes, A otherwise. The Lead (main session) runs on S with `/effort` high only for planning, integration and gate reviews, medium otherwise.

**Task classification rubric** (the Lead classifies every task before delegating and records the class in `docs/PLAN_M<n>.md`): **Class 1** = templated and tool-verifiable → Tier B; **Class 2** = implementation with tests, one module, clear spec → Tier A; **Class 3** = cross-module, correctness-critical, ambiguous or novel → Tier S. Risk flags raise the class by one: touches sim determinism, touches ratings/trophies/money, touches netcode, has no existing test coverage.

**Escalation ladder:** a task that fails `qa` or `reviewer` twice at its tier is re-run one tier up with the failure report attached; never a third attempt at the same tier; the outcome is logged.

**Auto-tuning loop** (`tools/routing_report.py`, run at every gate): from `docs/TASKLOG.jsonl` (task id, class, agent, model, attempts, tokens in/out where the session cost report provides them, outcome) compute, per class × agent, the first-pass success rate and tokens per accepted change. Rules: success ≥ 90% over ≥ 10 tasks at a tier → try one tier down for that class; success < 70% → move one tier up; write the new defaults into the agent frontmatters and `docs/MODEL_ROUTING.md` with the evidence, and show the change in the gate report so the human can veto it.

**Context hygiene (every agent, every session):**
- `CLAUDE.md` stays under 150 lines (Claude Code's own guidance is under 200): it is an index of non-negotiables and pointers; the specification lives in `docs/SPEC/NN-title.md` and an agent reads only the sections its task names. Appendix F is the template; M0 performs the split.
- Agents whose work is local to one module set `omitClaudeMd: true` and get a ≤ 30-line brief in their own system prompt; the Lead's task message names the exact files and spec sections.
- Preload only the skills a task needs via the `skills` field; restrict `tools` per agent (`reviewer` is read-only; `qa` cannot edit `sim/`; Tier B agents get no web access).
- Grep before Read; read line ranges, not whole files; never re-read unchanged files; never paste more than 50 lines of logs into a message — write them to `logs/` and cite the path and the relevant lines.
- Prefer scripts over reasoning for repetitive work (48 clubs come from a generator, not 48 conversations; 60 animation variants come from the builder).
- Write plans and findings to files; return ≤ 15-line summaries; no restating the task, no narration of routine steps.
- Keep the stable part of every system prompt first and unchanged between calls (prompt caching works on prefixes); put per-task details at the end; set the longest prompt-cache TTL the account allows (`CLAUDE_CODE_PROMPT_CACHE_TTL`).
- `/compact` at natural boundaries (after a gate, after a large refactor); `/effort low` and a reduced `MAX_THINKING_TOKENS` for Tier B agents; extended thinking only for Class 3 work.
- One subagent call per coherent unit of work, not per file; independent tasks run in parallel worktrees.
- Budgets per class (starting values, tuned by the loop): B ≤ 40k tokens, A ≤ 150k, S ≤ 400k per task; a task at 150% of its budget stops and reports instead of continuing blindly.
- Measure: the session cost report is recorded at every gate in `docs/COST.md` (tokens per milestone, per agent, per class) and the gate report shows the trend.

**Agent frontmatter template** (`.claude/agents/<name>.md`):
```yaml
---
name: animation
description: Builds, captures, reviews and integrates animations per SPEC 8.8 and Appendix C.
model: sonnet            # tier A default; the routing loop may change this
tools: Read, Edit, Write, Bash, Grep, Glob
skills: anim-author, anim-review, anim-lint, godot-anim-integration, licence-check
omitClaudeMd: true       # gets its own 30-line brief below instead of the whole index
memory: project          # persistent agent memory, if your Claude Code version supports the field
---
Brief: you own game/characters, tools/anim, tools/mocap and data/animation/MANIFEST.json.
Read only docs/SPEC/08-art-animation.md and Appendix C unless the task names other sections.
Never ship a clip without a manifest entry or with a non-commercial licence; never leave a sim event without an animation.
Return: files changed, tests and lint results, render-sheet paths, open questions — ≤ 15 lines.
```

---

## 15. PHASED DELIVERY PLAN WITH GATES

Each milestone lists deliverables and its acceptance gate. Every gate has two halves: **CI-verifiable** (headless tests, exports, budgets measurable without a device) and a **human device checklist** (frame rate, battery, latency, look and feel, stored in `docs/PLAYTESTS/`); both must pass. Do not start the next milestone until the human approves the gate.

**M0 — Foundation (repo, CI, docs, agents, toolchain).** Split `docs/SPEC.md` into `docs/SPEC/NN-title.md`; slim `CLAUDE.md` from Appendix F; subagents in `.claude/agents/` with model tiers, tools and skills per 14.1; skills of 8.8.4 in `.claude/skills/`; animation toolchain of 8.8.3 installed and smoke-tested (`blender -b` builds one clip from a pose file, renders a sheet, lints it, imports into Godot); `docs/MODEL_ROUTING.md`, `docs/TASKLOG.jsonl`, `docs/COST.md`, `docs/TOOLCHAIN.md`, `tools/routing_report.py`, `tools/licence_check.py` and the empty manifest; Godot 4.6 project, layout from 2.5, lint/test/CI, export pipelines (Android debug APK, iOS project, Linux server Docker), `docs/GDD.md`, `docs/TDD.md`, `docs/STYLE_BIBLE.md` v1 (with reference boards described in words and generated mood tiles), `docs/RISKS.md`, `docs/LICENSES.md`, `tools/mocap/SHOTLIST.md` for the human, ADR-001 (language/extension strategy and port criteria), ADR-002 (symmetric balance), ADR-003 (test framework), ADR-004 (fixed-point representation), ADR-005 (event density under compression), ADR-006 (ball radius), ADR-007 (model routing defaults), device matrix. **Gate (CI):** lint, unit tests, headless smoke sim, licence check, animation toolchain smoke test and all exports green. **Gate (device):** the empty match scene renders at 60 FPS on the human's Mid phone; docs approved; first cost report recorded.

**M1 — SimCore vertical slice.** Pitch geometry, fixed-point ball physics with tests vs analytic solutions, one controllable player with locomotion, pass/shoot/first touch, event log, replay record/playback, determinism hash, `tools/run_match.sh`, loopback `MatchServer` with the snapshot path (2.3) and debug presentation (capsules + ball) consuming snapshots. **Gate (CI):** replay hash equality over 18,000 ticks; property tests green; snapshot encode/decode round-trip within quantisation bounds. **Gate (device):** the human plays "keep the ball up and shoot" on a phone build.

**M2 — Full rules engine + referee + bot teams.** All of section 6 except tactics depth: 22 players with a simple team AI, all restarts, offside, fouls/cards, substitutions, injuries, stoppage time, extra time, shoot-out, VAR protocol, rules profiles (pro, street, tutorial, training), scenario tests, soak runs with provisional statistics bands, sim tick profiling and the GDExtension port decision (2.2). **Gate (CI):** 1,000 headless matches, zero invariant violations, statistics within the provisional bands, scenario suite green. **Gate (device):** the human watches a full bot match in debug view and cannot find a rule error.

**M3 — Team AI and tactics.** Section 6.10 in full; difficulty tiers; coach AI; assisted intent resolution for humans. **Gate:** bots at "Pro" difficulty beat "Beginner" ≥ 90% of matches; formations visibly differ in heat maps; the human can beat Beginner and loses to Pro.

**M4 — MIND (emotions).** Section 7 in full with fairness tests and effects table; debug overlay showing states. **Gate:** mirrored-history fairness test passes; soak statistics still within bands; the human can name what a player feels from the debug overlay and the sim's behaviour changes credibly after a late equaliser and in a shoot-out.

**M5 — Characters, animation and art pipeline.** bpy generators (bodies, faces, kits, ball, stadium modules), rigs, the 8.8 animation pipeline in full (pose grammar and builder, self-mocap processing of the human's shot list, render/lint/review loop, manifest), animation set (Appendix C, core 70%, ≥ 80% of football-specific clips authored or captured by us), IK, facial system, LODs, style bible applied, crowd VAT, lighting. **Gate (CI):** licence check green with a complete manifest; `anim-lint` green for every clip; no T-poses across a full headless match; budgets green on the benchmark scene. **Gate (device):** the 12 money shots and the animation reel approved by the human; animation checklist signed by `reviewer`.

**M6 — Controls, HUD, UX, onboarding.** Section 9 (landscape scheme, assists, feedback, tutorial, menus, accessibility, localisation EN/IT). **Gate (CI):** HUD safe-area and localisation tests green; control-scheme unit tests (intent resolution, buffering) green. **Gate (device):** 5 first-time testers (the human recruits friends) complete the tutorial and a Street match without help; input latency ≤ 3 frames measured with a 240 fps slow-motion phone video of the screen (touch → first visible reaction).

**M7 — Cinematics, cameras, replays, VFX, audio, commentary.** Sections 8.4, 8.7, 11. **Gate:** a full Pro match capture looks like a broadcast; goal/VAR/penalty sequences approved; commentary never repeats within a match; audio budget green.

**M8 — Online: match server, netcode, friends.** Section 10.1–10.4 with chaos tests; private matches with invite codes; reconnection. **Gate:** 200 automated online matches under emulated loss/jitter with zero desyncs and correct forfeits; the human plays a friend over mobile data on two phones in different cities.

**M9 — Backend: accounts, ranking, leaderboards, seasons, anti-cheat.** Section 10.5–10.7 and section 5. **Gate:** Glicko-2 and trophies verified against a reference implementation; leaderboard consistency tests; attestation enforced; load test 1,000 concurrent matches on the fleet with p99 tick time ≤ 4 ms.

**M10 — Street mode polish and Cup Weekend format.** Data-only differences, Street cameras, golden goal, event formats. **Gate:** both modes ranked, statistics bands per mode.

**M11 — Performance, battery, thermal, size.** Section 12 on all tiers; install size; shader warm-up; memory. **Gate:** all budgets green on the human's Low and Mid devices for a 10-minute match.

**M12 — Closed beta.** Telemetry dashboards, crash reporting, balance passes, fair-play system, store compliance drafts, privacy policy, age rating questionnaire. **Gate:** crash-free ≥ 99.5%, desync 0, match completion ≥ 99%, beta feedback triaged.

**M13 — Release.** Store builds, listings, screenshots/video from the highlight generator, live-ops calendar (seasons, Cup Weekends), runbooks, on-call alerts. **Gate:** human approval and store submission.

Post-release backlog (do not build before M13): portrait Street layout, spectating, guilds, motion matching, weather-specific animations, pitch wear simulation, more languages, cosmetics store, esports tournament mode.

---

## 16. DOCUMENTATION AND REPOSITORY CONVENTIONS

- `docs/SPEC/NN-title.md` (this specification, split per section), `docs/GDD.md` (design), `docs/TDD.md` (technical), `docs/STYLE_BIBLE.md`, `docs/MIND.md`, `docs/RULES_SOURCES.md`, `docs/TEST_PLAN.md`, `docs/RISKS.md`, `docs/LICENSES.md`, `docs/TOOLCHAIN.md`, `docs/MODEL_ROUTING.md`, `docs/TASKLOG.jsonl`, `docs/COST.md`, `docs/HUMAN_ACTIONS.md`, `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/PLAN_M<n>.md`, `docs/ADR-NNN-title.md` (context, decision, alternatives, consequences).
- Conventional commits (`feat(sim): …`, `fix(net): …`, `test(rules): …`), small PRs, one concern each, PR template with the DoD checklist.
- GDScript style: static typing everywhere, `class_name` for shared types, no `Node` references inside `sim/`, constants in `data/`, no magic numbers (tuning tables with comments and units), docstrings on public API.
- Naming: metres, seconds, ticks, radians; suffix units in variable names where ambiguity is possible (`speed_mps`, `timer_ticks`).
- Every tuning table has a "why" column and the test that pins it.

---

## 17. LEGAL, COMPLIANCE AND PLATFORM CHECKLIST

- No real clubs, players, leagues, competitions, stadiums, broadcasters, sponsors, chants, logos, fonts with restrictive licences; the fictional generator must avoid near-identical names/colours of famous clubs (maintain a deny-list check).
- Asset licences recorded per file and, for animation, in `data/animation/MANIFEST.json` with a `commercial` flag enforced by CI (8.8.1); CC-BY attributions shown in the in-game credits; no NC/ND/SA assets; no outputs of models trained on research-only motion datasets; Mixamo/other motion terms quoted in `docs/LICENSES.md` and re-verified at every release.
- Privacy: GDPR (EU users, Italy included), COPPA/age gating, minimal data (account id, country, device tier, telemetry without PII), privacy policy and data map, account deletion flow, data export.
- Store: Apple App Store and Google Play guidelines, age rating (IARC/PEGI), Play Integrity/App Attest usage disclosed, in-app purchases (if any) cosmetic-only and clearly labelled, no loot boxes.
- Security: secrets in CI vaults, signed builds, TLS/DTLS everywhere, dependency audit in CI.
- Trademark check of the final title before any store listing (the human does this; add to `docs/HUMAN_ACTIONS.md`).

---

## 18. KICKOFF MESSAGE (send this as your first message in Claude Code)

> Read `CLAUDE.md`, then `docs/SPEC.md` completely (once; afterwards read only the sections a task names). You are the Lead Engineering Agent described in SPEC section 0. Start Milestone **M0**: (1) split `docs/SPEC.md` into `docs/SPEC/NN-title.md` files, one per section and appendix, and make `CLAUDE.md` point to them; (2) create the subagent definitions in `.claude/agents/` exactly as sections 14 and 14.1 specify — model tier, tools, skills, `omitClaudeMd` where allowed, a ≤ 30-line brief with the scope and the "must never" rules — and the skills of 8.8.4 in `.claude/skills/`; (3) install and smoke-test the animation toolchain of 8.8.3 and write `tools/mocap/SHOTLIST.md` for me; (4) initialise the Godot 4.6 project with the layout in 2.5, CI, lint, the test framework decided in ADR-003, export presets and Docker for the headless server; (5) write `docs/GDD.md`, `docs/TDD.md`, `docs/STYLE_BIBLE.md` v1, `docs/RISKS.md`, `docs/LICENSES.md`, `docs/TOOLCHAIN.md`, `docs/MODEL_ROUTING.md`, `docs/HUMAN_ACTIONS.md`, `docs/STATUS.md`, `docs/COST.md` and ADR-001…007; (6) produce the M0 gate artefacts (CI half), the device checklist and the first cost/routing report for me, then stop. While working: classify every task and delegate it at the cheapest tier the rubric allows, verify every claim by running it, never skip tests, never expand scope beyond M0, and write down every open question for me in `docs/HUMAN_ACTIONS.md`. Report in ≤ 30 lines: what was built, what was verified and how, tokens used per agent, what is blocked on me, and the exact command I run to see the M0 scene on my phone.

For every later session: "Read `CLAUDE.md` and `docs/STATUS.md`. Continue Milestone M<n> from `docs/PLAN_M<n>.md`. Same rules: cheapest tier that passes, escalate on failure, log every task, report in ≤ 30 lines."

---

## APPENDIX A — SIMULATION INVARIANTS (checked every tick in tests and in soak runs)

- INV-01 Determinism: same `(profile, teams, seed, inputs)` → identical event-log hash; cross-platform drift reported.
- INV-02 Exactly one ball; ball position finite; |ball speed| ≤ 45 m/s; ball never below pitch plane.
- INV-03 Player counts: 11/11 (Pro) minus sent-off, never < 7 while match continues; substitutes ≤ profile limit; a sent-off player never re-enters.
- INV-04 Every player position within pitch bounds + 5 m margin except during permitted exits (injury treatment, substitution, celebration, throw-in).
- INV-05 Match clock monotonic; it runs during in-world stoppages and pauses only for non-diegetic time (cinematics, menus); added time ≥ accumulated in-world stoppage seconds × compression, capped by the referee model; queued substitutions execute only at eligible stoppages.
- INV-06 A goal requires whole-ball-over-line between posts and under the bar and a preceding valid restart sequence; no goal directly from a throw-in, indirect free kick or from a goalkeeper's hands throw.
- INV-07 Every restart follows a stoppage event and the ball is stationary at the correct spot at the moment of the restart.
- INV-08 Card sequence: second yellow ⇒ red ⇒ player off; card counts never decrease; captain-only protest rule enforced.
- INV-09 Offside decision always computed from the tick of the teammate's last touch; never from a goal kick, throw-in or corner.
- INV-10 Emotion states within [0,1]; effect multipliers within the caps of 7.5; mirrored-history symmetry holds.
- INV-11 Fatigue non-increasing during stoppages beyond baseline recovery; stamina never < 0.
- INV-12 Presentation never mutates sim state (write barrier test).
- INV-13 Network: server tick is authoritative; client input outside the accepted window is dropped and counted; snapshot decode(encode(s)) error within quantisation bounds.
- INV-14 Result submission happens once, with a valid signature and a matching replay hash.
- INV-15 Match real duration ≤ expected + 25% (detects stuck states).

## APPENDIX B — EMOTION TRIGGER DEFAULTS (starting values; tune with tests and playtests)

| Event | confidence | anxiety | frustration | anger | morale | joy | Applies to |
|---|---|---|---|---|---|---|---|
| Goal scored (scorer / team) | +0.25 / +0.10 | −0.15 / −0.05 | −0.20 / −0.10 | −0.10 | +0.20 / +0.10 | +0.6 / +0.3 | own team |
| Goal conceded (at fault / team) | −0.30 / −0.10 | +0.20 / +0.08 | +0.25 / +0.10 | +0.05 | −0.20 / −0.10 | — | conceding team |
| Own goal (scorer / team) | −0.40 / −0.10 | +0.30 / +0.08 | +0.30 / +0.10 | +0.05 | −0.25 / −0.10 | — | conceding team (no celebration for the beneficiaries' scorer; team joy +0.2) |
| Big chance missed | −0.15 | +0.10 | +0.20 | — | −0.05 | — | player (+ contagion) |
| Big save | +0.20 (GK) / +0.05 | −0.10 | — | — | +0.08 | +0.3 | own team |
| Foul suffered, no call | — | +0.05 | +0.15 | +0.15 | — | — | player |
| Carded | −0.05 | +0.10 | +0.10 | +0.10 (yellow) / +0.25 (red, team) | −0.05 | — | player / team |
| VAR overturn against | −0.05 | +0.05 | +0.20 | +0.15 | −0.10 | — | team |
| Captain rally | +0.08 | −0.15 | −0.10 | −0.05 | +0.10 | — | team |
| Crowd roar / boos | +0.03 / −0.03 | −0.02 / +0.04 | — / +0.03 | — | +0.03 / −0.03 | — | home / away in Friends and Practice; applied identically to both teams in ranked |
| Penalty to take (approach / avoidance) | — | +0.15 / +0.35 | — | — | — | — | taker |
Multiply by timing and stakes multipliers (7.3); decay rates per trait; clamp to [0,1].

## APPENDIX C — ANIMATION SET (minimum for M5; each has LOD variants, facial layers and a manifest entry; ≥ 80% of the football-specific clips authored or captured by us per 8.8)

Locomotion: idle (confident/neutral/anxious/exhausted), walk, jog, run, sprint, strafe/jockey, backpedal, turns (45/90/180), stop, start, stumble/recover, fall/get up. Ball control: first touch (4 directions × ground/air), dribble loop, knock-on, shield, 8 skill moves. Passing: short (L/R), driven, through, lofted, cross, backheel, one-touch, header pass, throw-in (short/long). Shooting: standard (L/R), power, finesse, chip, volley, half-volley, header (3), toe-poke, bicycle (rare). Defending: standing tackle (front/side), slide tackle (L/R), block, interception, clearance, header clearance, jump/aerial duel (win/lose), shoulder barge, hold/pull (foul). Goalkeeper: set, shuffle, dives (low/mid/high × L/R), catch, parry, tip over, punch, spread, rush, collect ground ball, throw (roll/overarm), kick (short/long), goal kick, penalty stance and guess. Referee/assistants: run, whistle, arm signals (advantage, indirect, direct), card show (yellow/red), talking-to, monitor review, corner/goal-kick/throw signals, flag raise/point, board raise. Emotional: celebrations (10, solo/team variants), disappointment (hands on head, kneel, turf slap, shirt over face), protest (arms out, pointing, surrounding referee), encouragement (clap, "come on"), captain calm-down, injury (clutch ankle/hamstring/head), treatment loop, stretcher, cramps + teammate stretch, handshake, huddle, walk-out, line-up, trophy lift, full-time collapse/joy.

## APPENDIX D — RULES CHEAT SHEET (recent IFAB changes to encode as profile flags; verify against the official documents in `docs/RULES_SOURCES.md`)

- 2025/26: only the captain may approach the referee to discuss decisions (Law 3); dropped ball goes to the team that would have had possession, to the goalkeeper if in the penalty area (Law 8); accidental contact by team officials/substitutes with a ball leaving play → indirect free kick, no card (Law 9); goalkeeper may hold the ball max 8 seconds with a visible 5-second countdown, sanction = corner kick (Law 12); accidental double touch on a penalty → retake if scored, indirect free kick if not (Law 14); referees may announce VAR decisions in the stadium.
- 2026/27: up to 8 (agreed up to 11) substitutes in senior "A" international friendlies (Law 3); non-dangerous items allowed if safely covered (Law 4); referee body cameras as a competition option (Law 5); dropped-ball possession clarification (Law 8); no caution for a DOGSO offence when advantage is played and a goal is scored (Law 12); penalty double-touch clarification carried into Laws 10 and 14. Trials/competition options reported for this cycle (encode behind flags, default off in `pro.json` until confirmed): 5-second countdown for delayed throw-ins and goal kicks with possession to the opponent, 10 seconds for substituted players to leave, 1 minute off the pitch after on-field treatment, red card for covering the mouth while confronting an opponent, red card for leaving the field in protest.
- Standing framework: 5 substitutions in 3 windows + half time (+1 in extra time), concussion substitutes per competition, VAR reviewable categories (goal, penalty, direct red, mistaken identity), semi-automated offside where enabled, goal-line technology, ABAB shoot-out order with sudden death after 5, reduction of the larger team to equal numbers before a shoot-out.

## APPENDIX E — HUMAN DEVICES AND ACCOUNTS (fill in before M0)

- Low-tier test phone: ____ ; Mid-tier: ____ ; High-tier: ____ (model, OS version)
- Apple Developer / Google Play Console accounts: ____
- Server hosting choice for beta (e.g., one EU VM with Docker, then Kubernetes): ____
- Budget approvals required for: asset packs (optional), mocap-from-video services (optional), TTS voices (optional), hosting.
- Mocap shot list recorded (8.8.2): date ____ ; actors ____ ; camera(s) ____ ; videos placed in `tools/mocap/raw/`.
- Models available in the Claude Code account for the tiers of 14.1 (B / A / S): ____ / ____ / ____

## APPENDIX F — SLIM `CLAUDE.md` TEMPLATE (copy this into the repo root; keep it under 150 lines; the agent maintains the pointers)

```markdown
# STADIUM ROAR — CLAUDE.md (index; the specification is in docs/SPEC/)

You are the Lead Engineering Agent (SPEC 0). Read only the SPEC sections a task names.

## Non-negotiables (SPEC 1)
1. Server authority: clients send inputs, never state; results come only from the match server.
2. Deterministic SimCore: 30 Hz fixed tick, integer fixed-point math, seeded PRNG, no engine physics, no wall clock.
3. Data-driven rules: Laws of the Game live in data/rules/*.json profiles, never in scattered ifs.
4. Tests before "done": no rule without a test for the right and the wrong decision; soak runs in CI.
5. No hidden randomness that decides outcomes; effects are bounded, symmetric, visible.
6. Readability beats realism; performance budgets are requirements; presentation never writes to the sim.
7. Everything reproducible from (build hash, seed, input log); replays are first-class.
8. Small verified steps, conventional commits, ADR for every decision, main never broken.
9. Accessibility from day one. Legal hygiene: every asset licensed for commercial use, recorded in the manifest.
10. No real clubs, players, leagues, brands; no Supercell assets — principles only.

## Where things are
- Specification: docs/SPEC/00-mission.md … docs/SPEC/18-kickoff.md, appendices A–F (index in docs/SPEC/README.md)
- Status (single source): docs/STATUS.md · Plan for the current milestone: docs/PLAN_M<n>.md
- Decisions: docs/ADR-*.md · Blockers for the human: docs/HUMAN_ACTIONS.md · Backlog: docs/BACKLOG.md
- Rules sources: docs/RULES_SOURCES.md · Emotional model: docs/MIND.md · Style: docs/STYLE_BIBLE.md
- Licences: docs/LICENSES.md, data/animation/MANIFEST.json (CI gate: tools/licence_check.py)
- Routing and cost: docs/MODEL_ROUTING.md, docs/TASKLOG.jsonl, docs/COST.md (tools/routing_report.py)
- Toolchain: docs/TOOLCHAIN.md · Fast sim check: tools/run_match.sh --profile pro --seed 42 --bots --report

## Layers (SPEC 2): data → sim (pure, no Node) → presentation → net → meta. Lower never imports upper.

## Working rules (SPEC 13, 14, 14.1)
- Classify every task (Class 1/2/3 + risk flags) and delegate at the cheapest tier the rubric allows; escalate one tier after two failed passes; log every task in docs/TASKLOG.jsonl.
- Every task ends with qa + reviewer; Definition of Done = code + tests + docs + run_match green + CI green + review + STATUS.md.
- Grep before Read; read ranges; write logs to logs/ and cite; summaries ≤ 15 lines; plans and findings go to files.
- Never expand scope beyond the current milestone; park ideas in docs/BACKLOG.md.
- Gates have a CI half and a human device checklist; never start the next milestone before the human approves.

## Animation (SPEC 8.8)
Authored from pose grammars (tools/anim) or captured from the human's videos (tools/mocap) first; procedural at runtime second; licensed libraries only for generic motion; every clip in the manifest with commercial: yes. Skills: anim-author, anim-review, anim-lint, mocap-capture, licence-check, godot-anim-integration.

## Agents (SPEC 14): sim-core, rules-referee, ai-tactics, mind, netcode, backend, animation, tech-art, asset-pipeline, ux-ui, cinematics, audio, qa, performance, security, devops, release, reviewer — definitions in .claude/agents/, model tiers in docs/MODEL_ROUTING.md.

## Current focus
See docs/STATUS.md.
```

---

## STATUS

The single source of status is `docs/STATUS.md` (current milestone, last gate passed, blockers for the human, next action), updated by the agent after every session. Initial state: M0 not started; next action: send the Kickoff message.
