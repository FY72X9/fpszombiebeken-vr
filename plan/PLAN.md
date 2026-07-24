# FPZombieBeken VR — Game Plan & Boilerplate

## 1. Executive Summary

First-person survival stealth game set in BINUS Bekasi campus. Player (Bina) must sneak past zombies (infected students & lecturers), avoid line-of-sight, and inject them with finite antidote syringes to cure the campus. Secondary immediate goal: rescue fellow survivor Nusa from Kelas A Floor 2. Played as a WebXR title on Meta Quest 2, rendered via React Three Fiber with anime-style cel shading and 16-bit audio.

---

## 2. Decisions Made

| # | Decision | Choice | Reason |
|---|---|---|---|
| 1 | Rendering engine | **Three.js via @react-three/fiber** | Native WebXR support, React idiomatic, smaller bundle than multi-engine. |
| 2 | VR layer | **@react-three/xr** | Handles Meta Quest 2 controllers, session, 360° head tracking out of box. |
| 3 | Scope | **All 7 rooms from Day 0** | Full navigation graph + 7 rooms empty-shelled; detail/signal assets loaded phased. |
| 4 | Combat model | **Hybrid C — Stealth + Limited Ammo + Antidote Injection** | Core win = injection, not killcount. Resource scarcity creates tension (RE-style). |
| 5 | Zombie detection | **Sight Cone + Noise Radius** | Cone: front-facing 120° arc with distance falloff. Noise: sprinting 8m, door crash 10m, gunshot 25m, collision/fall 5m. Strategic depth allows flank/sneak plays. |
| 6 | Artstyle shader | **Custom Cel Shader + Sobel Outline** | Genshin Impact anime look. Per-character toon material with stepped light bands and specular rim light. |
| 7 | Movement control | **FPS Joystick (VR dual-thumbstick) + Teleport (optional)** | Locomotion comfort: left stick move, right stick snap-turn 30°, or smooth with vignette comfort. |
| 8 | View display | **Horizonal Web + VR stereo render** | Single canvas adaptive: WebXR session auto-enters stereo; desktop falls back to mouse/keyboard + pointer lock. |
| 9 | State management | **Zustand + bitecs (or simple entity store)** | Zustand for game/level/UI state. Lightweight ECS (local implementation or @react-three/ecs) for zombies/items/props to avoid React reconciler overhead on 50+ entities. |
| 10 | Audio engine | **Howler.js + Web Audio API** | 16-bit chiptune-like bgm streamed via Howler; spatial emitters for zombie groan/gunshot via Web Audio positional nodes. |

---

## 3. Environment: BINUS Bekasi Layout

### 3.1 Navigation Graph

```
[Entrance Gate]
    |
    v
[Lobby Lantai 1] --[Door MOTION open/close]--> [Kelas 1A] ---[Stairs UP lantai 2]--> [Koridor Lantai 2]
    |                                              [Kelas 1B]                             |            |            |
    |                                                                                       v            v            v
    v                                                                                   [Kelas 2A]   [Kelas 2B]  [Kelas 2C]
[Ruang Direktur]                                                                                (TARGET: Nusa here)
    |
    v
[Ruang Dosen]
```

### 3.2 Room Specs (7 rooms)

| Room | Floor | Detail Level | Key Features |
|---|---|---|---|
| Lobby Lantai 1 | 1 | 340 segs | Info desk, bench, water dispenser, glass doors with motion open. |
| Kelas 1A | 1 | 280 segs | Rows of chairs/tables, projector, whiteboard, AC unit. |
| Kelas 1B | 1 | 280 segs | Mirror layout to 1A, slight prop difference (bookshelf variant). |
| Ruang Direktur | 1 | 300 segs | Executive desk, sofa, wall certificate frames, large window. |
| Ruang Dosen | 1 | 280 segs | Shared work table, lockers, coffee machine, document rack. |
| Kelas 2A | 2 | 280 segs | Bina & Nusa spawn room. Exit to stair into corners. |
| Kelas 2B | 2 | 280 segs | Adjacent to 2A, one-way propagation route for late-game backtrack. |
| Kelas 2C | 2 | 280 segs | Dead end with high-value antidote cache, risk/reward traversal. |

All rooms have:
- Door with animated pivot hinge + collider.
- Ceiling lights (point) with flicker state for ambient tension.
- Window emitters (directional light proxy) for exterior fill.

---

## 4. Characters & NPC Table

| ID | Name | Type | Role | Spawn |
|---|---|---|---|---|
| P1 | Bina | Player | Survivor protagonist | Kelas 2A (Day 1 start) |
| NP1 | Nusa | Friendly NPC | Must rescue; follows Bina after sequence | Kelas 2A (hiding under desk) |
| NP2 | Willy | Zombie (formerly Lecturer) | Area boss in Ruang Dosen | Ruang Dosen |
| NP3 | Indi | Zombie (formerly Lecturer) | Patrol Kelas 1A | Kelas 1A |
| NP4 | Gatot | Zombie (formerly Lecturer) | Patrol Ruang Direktur | Ruang Direktur |
| ZG1-10 | Spawns Zombie (Students) | Generic infected | Filler patrol/idle in all rooms | Distributed per room density target |
| ST1-6 | Spawns Mahasiswa (Students) | Dead/curable | Antidote target or already-down victims in cutscenes | Cinematic placements |

---

## 5. Gameplay Mechanics

### 5.1 Stealth Detection (Sight + Noise)

**Sight Cone:**
- FOV: 120° horizontal, 80° vertical.
- Distance tiers: Alert (15m, slow turn toward source) → Chase (8m, walking pursue) → Attack (3m, lunging).
- Obstruction: Raycast from head bone to Bina torso. If interrupted by wall/door, no detection even if in cone.
- Peripheral: beyond 120° but within 4m radius triggers slow alert (heard something, turn head).

**Noise Sources:**

| Action | Radius | Type |
|---|---|---|
| Walk | 0m | silent |
| Sprint | 8m | footfall + breathing |
| Open door slowly | 3m | creak |
| Slam door / sprint into door | 10m | bang |
| Gunshot | 25m | immediate room alert |
| Throwable item land | 5m | lure clay |
| Collide with furniture | 5m | screech/drop noise |

**Zombie States & Transitions:**

```
IDLE --(cone detect Bina)--> ALERT --(Bina in 8m + Ray clear)--> CHASE
CHASE --(Bina escapes LoS 5s)--> SEARCH --(search timer 10s expires)--> RETURN ---> IDLE
CHASE --(reach 3m + no obstacle)--> ATTACK
ATTACK --(hit registered)--> COOLDOWN --> CHASE if Bina still in range, else SEARCH
SEARCH --(hear noise/clue)--> ALERT
```

### 5.2 Combat / Survival Resources

| Item | Initial | Max | Function |
|---|---|---|---|
| Antidote Syringe | 3 | 6 | Inject downed/trapped zombie or cured student. Consumed on success. |
| Handgun | 1 | 1 | Down zombie (stun, not kill). Ammo scarce. Used to create inject window. |
| Ammo (9mm) Clip | 12 | 24 | Reload manually (press grip). |
| Bandage | 2 | 4 | Heal Bina (instant 40 HP or slow regen 20s). |
| Flashlight | 1 | 1 | Toggle, drains battery (slow). |
| Lure Item (Botol Kosong) | 2 | 4 | Throw to generate noise in radius 5m. |

### 5.3 Antidote Injection Rule

- Zombie must be **STUNNED** (shot successfully, door trap, or environmental stun) or **IDLE + NOT AWARE** if player successfully sneaks behind and executes stealth inject (risky, instant fail if zombie turns).
- Injection takes **2.5 seconds** hold.
- During injection: Bina locked in animation; any damage interrupts = syringe breaks (consume item).
- Cured zombie transitions to lying human NPC, no longer threat, drops no loot.

### 5.4 Win / Lose Conditions

| Condition | Trigger |
|---|---|
| **Win (Grand)** | Inject all named lecturers (Willy, Indi, Gatot) + cure Nusa (unique story syringe) + reach Lobby Exit. |
| **Win (Immediate Rescue)** | Lead Nusa from Kelas 2A to lobby without dying. Secondary objective. |
| **Lose** | HP reaches 0 OR Nusa dies (if following). |

---

## 6. VR / Control Scheme

### Meta Quest 2 Bindings

| Action | Controller | Input |
|---|---|---|
| Move | Left | Thumbstick Y (forward/back), X (strafe) |
| Turn | Right | Thumbstick X (snap 30° smooth option in settings) |
| Interact / Inject | Right | Trigger press + hold (2.5s for inject) |
| Fire / Use item | Right | Trigger pull (quick) |
| Reload | Right | Grip (squeeze) + thumbstick down |
| Sprint | Left | Thumbstick click (press down) |
| Crouch | Left | Grip (squeeze) |
| Open inventory / wrist UI | Right | A button tap |
| Pickup / Throw lure | Either | Grip (squeeze) near object, release to throw |
| Toggle flashlight | Left | X button tap |

### Desktop Fallback
- WASD move, Shift sprint, Ctrl crouch, Q/E lean (optional), F interact/hold inject, R reload, 1-4 weapon/item slots, Mouse look (pointer lock), Space jump (minor, no parkour).

---

## 7. Artstyle Technical Specs

### 7.1 Cel Shader (per material)

Implemented as `onBeforeCompile` custom Three.js shader chunk or via `@react-three/drei/Caustics` base then modified:

- **Diffuse bands:** Quantize `dot(N,L)` into 3-4 bands using `smoothstep` thresholds: 0.0-0.2 (shadow), 0.2-0.5 (mid), 0.5-0.9 (light), 0.9+ (highlight).
- **Specular band:** Blinn-Phong spec dot, quantized into 1-2 crisp highlights.
- **Rim light:** `pow(1.0 - dot(N,V), rimPower)` as unclamped additive (for Genshin edge glow).
- **Outline:** Post-process Sobel edge detection on normal + depth buffer (fullscreen pass), thickness 1.5px, color #2a2420. Alternative for characters: inverted hull backface geometry outline ( cheaper, but needs double geometry). Recommended: post-process Sobel for environment; inverted hull for main characters due to camera distance issues.

### 7.2 Model Detail Rules

- **Characters**: GLB format, ~8k-15k tris each, 3 texture sets (albedo, normal, mask for toon ramps).
- **Props & Furniture**: Modular kit, reused across rooms. Door: separate pivot child for animated rotation.
- **Environment**: Baked lightmap texture (2048 per floor) + real-time point for flickers.
- **Poly budget**: 280+ segs refers to cylindrical detail; maintain 60-90k tris visible at once for stable Quest 2 framerate.

### 7.3 Rigging Requirements

- **Bina/Nusa**: Skeleton with IK targets for arms (especially injection animation), head look-at IK for NPC tracking, procedural finger curl on grip.
- **Zombies**: Zombie locomotion blend tree (idle/walk/lunge), neck look-at limited by zombie state (head paralyzed in chase).

---

## 8. Audio Design

| Category | Spec |
|---|---|
| BGM | 16-bit orchestral/chiptune hybrid. 3 layers: calm (safe room), tension (detection), chase (fast drums). Crossfade by threat level. |
| SFX | Zombie groan loop (spatial), footstep per surface (wood/tile/carpet), door creak, gunshot (short, flat), injection hiss, UI click. |
| Spatialization | Web Audio PannerNode per emitter. Zombies use cone-based inner/outer angle for groan directionality. |

---

## 9. State Management Architecture

```
[Zustand: GameStore]
├── currentRoom: string
├── gamePhase: 'menu' | 'intro' | 'playing' | 'paused' | 'gameover' | 'win'
├── bina: { hp, stamina, inventory[], equippedSlot }
├── nusa: { state: 'hiding'|'following'|'saved'|'dead', hp, room }
├── globalFlags: { willyCured, indiCured, gatotCured, allCured }
├── threatLevel: 0-3 (calm/alert/chase)
├── saveData: { checkpointRoom, checkpointFlags }
└── ui: { inventoryOpen, wristMenuActive, messageQueue, subtitle }

[ECS / Entity Store (Zustand slice or separate simple store)]
entities: Map<entityId, { type, position, velocity, rotation, state, aiTimer, targetNode }>
  types: 'zombie', 'npc', 'prop', 'item', 'door', 'triggerZone'
  Queries updated per frame in useFrame loop (outside React reconciliation).
```

---

## 10. Boilerplate Project Structure

```
fpszombiebeken-vr/
├── public/
│   ├── assets/
│   │   ├── models/
│   │   │   ├── characters/
│   │   │   │   ├── bina.glb
│   │   │   │   ├── nusa.glb
│   │   │   │   ├── zombie_student.glb
│   │   │   │   ├── zombie_willy.glb
│   │   │   │   ├── zombie_indi.glb
│   │   │   │   └── zombie_gatot.glb
│   │   │   ├── props/
│   │   │   │   ├── door_single.glb
│   │   │   │   ├── chair.glb
│   │   │   │   ├── table.glb
│   │   │   │   └── ...
│   │   │   └── environment/
│   │   │       ├── floor_lobby.glb
│   │   │       ├── floor_classroom.glb
│   │   │       └── wall_segments.glb
│   │   ├── textures/
│   │   │   ├── toon_ramp_1.png
│   │   │   ├── toon_ramp_2.png
│   │   │   └── lightmap_floor1.png
│   │   ├── audio/
│   │   │   ├── bgm_calm.ogg
│   │   │   ├── bgm_tension.ogg
│   │   │   ├── bgm_chase.ogg
│   │   │   ├── sfx_step_tile.ogg
│   │   │   ├── sfx_door.ogg
│   │   │   └── ...
│   └── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── store/
│   │   ├── useGameStore.ts          # Zustand root store
│   │   ├── useEntityStore.ts         # Lightweight ECS / entity map
│   │   └── slices/
│   │       ├── playerSlice.ts
│   │       ├── inventorySlice.ts
│   │       ├── roomSlice.ts
│   │       └── npcSlice.ts
│   ├── game/
│   │   ├── GameManager.tsx           # Orchestrates phase transitions, cutscenes
│   │   ├── Level.tsx                 # Scene loader per room
│   │   ├── constants.ts              # Room graph, spawn tables, detection constants
│   │   └── checkpoints.ts
│   ├── xr/
│   │   ├── VRSession.tsx             # @react-three/xr session start
│   │   ├── VRControls.tsx            # Controller binding mapping
│   │   ├── ComfortVignette.tsx       # Reduces motion sickness on smooth locomotion
│   │   └── HandModel.tsx             # Procedural hand or controller model
│   ├── characters/
│   │   ├── Bina.tsx                  # Player avatar (arms + items visible)
│   │   ├── Nusa.tsx                  # Friendly NPC with follow IK
│   │   ├── Zombie.tsx                # Base zombie component
│   │   └── AiBrain.ts                # Zombie state machine (pure TS helper)
│   ├── rooms/
│   │   ├── RoomLayout.tsx            # Wrapper: loads floor walls, applies lightmap
│   │   ├── LobbyLantai1.tsx
│   │   ├── Kelas1A.tsx
│   │   ├── Kelas1B.tsx
│   │   ├── RuangDirektur.tsx
│   │   ├── RuangDosen.tsx
│   │   ├── Kelas2A.tsx
│   │   ├── Kelas2B.tsx
│   │   └── Kelas2C.tsx
│   ├── props/
│   │   ├── Door.tsx                  # Hinge pivot animation + collider
│   │   ├── InteractableItem.tsx      # Pickup, hold, throw using useXR + physics
│   │   ├── Furniture.tsx
│   │   └── TriggerZone.tsx           # Room transition, noise events
│   ├── mechanics/
│   │   ├── DetectionSystem.ts        # Cone + raycast checks per frame
│   │   ├── NoiseSystem.ts            # Broadcast noise radius to zombies
│   │   ├── InjectionSystem.ts        # 2.5s hold mechanic
│   │   ├── StealthHelpers.ts         # Angle + distance math
│   │   └── Pathfinding.ts            # Simple node-graph A* between rooms
│   ├── audio/
│   │   ├── AudioManager.ts           # Howler global + Web Audio panner
│   │   ├── SpatialEmitter.tsx        # R3F component wrapping PannerNode
│   │   └── bgmLayers.ts              # Crossfade logic
│   ├── shaders/
│   │   ├── CelMaterial.tsx           # Custom mesh material using onBeforeCompile
│   │   ├── OutlinePass.tsx           # Post-processing Sobel via @react-three/postprocessing
│   │   └── shaders/
│   │       ├── celFragment.glsl
│   │       └── sobelFragment.glsl
│   ├── ui/
│   │   ├── WristInventory.tsx        # In-world pinned to wrist transform in XR
│   │   ├── HealthBar.tsx
│   │   ├── Crosshair.tsx             # Desktop only; 2D HUD overlay
│   │   ├── SubtitleOverlay.tsx
│   │   ├── PauseMenu.tsx
│   │   └── HUD.tsx                   # Desktop fallback HUD
│   ├── physics/
│   │   └── useSimpleCollisions.ts    # Raycast-based collider, no heavy physics engine (Quest friendly)
│   └── utils/
│       ├── math.ts
│       └── gltfLoader.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js (optional, for UI overlay polish)
```

---

## 11. Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.167.0",
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.108.0",
    "@react-three/xr": "^6.0.0",
    "@react-three/postprocessing": "^2.16.0",
    "zustand": "^4.5.2",
    "howler": "^2.2.4",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.167.0",
    "@types/howler": "^2.2.11",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vite-plugin-glsl": "^1.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

> Physics engine (`@react-three/rapier`, `cannon-es`, `ammo.js`) was intentionally omitted. For Meta Quest 2 WebXR, a lightweight raycast-based collision system is preferred over full rigid-body simulation to maintain 72fps. Add Rapier selectively later if object physics become critical.

---

## 12. Key React Three Fiber Patterns

### 12.1 Cel Shader Material Component

```tsx
// src/shaders/CelMaterial.tsx
import { useRef } from 'react';
import { MeshStandardMaterial } from 'three';

const CEL_RAMP = [0.15, 0.4, 0.7, 1.0];

export function CelMaterial(props: JSX.IntrinsicElements['meshStandardMaterial']) {
  const matRef = useRef<MeshStandardMaterial>(null);

  const onBeforeCompile = (shader: THREE.Shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      float intensity = dot(normalize(vNormal), normalize(directionalLights[0].direction));
      vec3 cel = vec3(0.0);
      if (intensity > 0.8) cel = vec3(1.0);
      else if (intensity > 0.5) cel = vec3(0.7);
      else if (intensity > 0.2) cel = vec3(0.4);
      else cel = vec3(0.1);
      gl_FragColor.rgb *= cel;
      float rim = 1.0 - max(dot(normalize(vNormal), normalize(viewPosition.xyz)), 0.0);
      rim = pow(rim, 3.0);
      gl_FragColor.rgb += vec3(0.2, 0.25, 0.35) * rim * 0.5;
      `.trim()
    );
  };

  return <meshStandardMaterial ref={matRef} onBeforeCompile={onBeforeCompile} {...props} />;
}
```

### 12.2 Snapshot: Zombie State Machine (pure TS)

```ts
// src/characters/AiBrain.ts
export type ZombieState = 'IDLE' | 'ALERT' | 'SEARCH' | 'CHASE' | 'ATTACK' | 'STUNNED';

export interface ZombieBrain {
  state: ZombieState;
  lastKnownPlayerPos: THREE.Vector3;
  searchTimer: number;
  attackCooldown: number;
}

export function tickBrain(
  brain: ZombieBrain,
  dt: number,
  selfPos: THREE.Vector3,
  selfFwd: THREE.Vector3,
  playerPos: THREE.Vector3,
  isLoS: boolean,
  noiseLevel: number
): ZombieBrain {
  const dist = selfPos.distanceTo(playerPos);
  const canSee = isLoS && dist < 15 && angleTo(selfFwd, playerPos.clone().sub(selfPos)) < 60 * (Math.PI / 180);

  switch (brain.state) {
    case 'IDLE':
      if (canSee) return { ...brain, state: 'ALERT', lastKnownPlayerPos: playerPos.clone() };
      if (noiseLevel >= 3) return { ...brain, state: 'SEARCH', lastKnownPlayerPos: playerPos.clone(), searchTimer: 10 };
      break;
    case 'ALERT':
      if (dist < 8 && isLoS) return { ...brain, state: 'CHASE' };
      break;
    case 'CHASE':
      if (dist > 18 || !isLoS) return { ...brain, state: 'SEARCH', searchTimer: 8 };
      if (dist < 3) return { ...brain, state: 'ATTACK', attackCooldown: 1.5 };
      break;
    case 'ATTACK':
      brain.attackCooldown -= dt;
      if (brain.attackCooldown <= 0) {
        return { ...brain, state: dist < 4 && isLoS ? 'CHASE' : 'SEARCH', searchTimer: 6 };
      }
      break;
    case 'SEARCH':
      brain.searchTimer -= dt;
      if (canSee) return { ...brain, state: 'CHASE' };
      if (brain.searchTimer <= 0) return { ...brain, state: 'IDLE' };
      break;
    // STUNNED handled externally by animation controller + timer
  }
  return brain;
}
```

### 12.3 Level Manager: Room Lazy Loading

```tsx
// src/game/Level.tsx
import { Suspense, lazy } from 'react';

const rooms = {
  'lobby_l1': lazy(() => import('../rooms/LobbyLantai1')),
  'kelas_1a': lazy(() => import('../rooms/Kelas1A')),
  // ... etc
};

export function Level({ roomId }: { roomId: string }) {
  const Room = rooms[roomId as keyof typeof rooms];
  if (!Room) return null;
  return (
    <Suspense fallback={null}>
      <Room />
    </Suspense>
  );
}
```

### 12.4 VR Setup Entry Point

```tsx
// src/xr/VRSession.tsx
import { XR, createXRStore } from '@react-three/xr';

const xrStore = createXRStore({
  hand: { model: false }, // use controller models, not hand tracking
});

export function VRSession({ children }: { children: React.ReactNode }) {
  return (
    <XR store={xrStore}>
      {children}
    </XR>
  );
}

// App.tsx
// <Canvas>
//   <VRSession>
//     <GameManager />
//   </VRSession>
// </Canvas>
```

---

## 13. Implementation Phases

**Phase 0 — Boilerplate Skeleton (done by this plan)**
- Vite + React + R3F + XR project setup.
- `useGameStore` + `useEntityStore` stubs with devtools.
- Empty room shells (7 rooms + navigation graph).

**Phase 1 — Player Locomotion & VR**
- XR dual-stick locomotion + snap-turn.
- Comfort vignette on smooth turn option.
- Desktop fallback KBM mapped.

**Phase 2 — Stealth & Detection**
- 1 zombie test in Kelas 2A.
- Debug visualizer for cone + noise radius (dev).
- AI state machine wired to animation blend.

**Phase 3 — Inventory & Injection**
- Wrist inventory UI (in-world canvas pinned to controller).
- Syringe hold mechanic + 2.5s hold progress.
- Gun + ammo + reload.

**Phase 4 — Environment & Doors**
- Animated door prefab with hinge pivot.
- Stairs navigation + no blocking colliders.
- Light flicker events.

**Phase 5 — Nusa Rescue Sequence**
- Cutscene / dialog system.
- Nusa follow IA with simple node routing.
- Win condition trigger at Lobby Exit.

**Phase 6 — Art & Polish**
- Cel shader applied globally.
- Outline post-processing.
- 16-bit audio layers.
- Model swap from placeholder -> final GLBs.

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Quest 2 WebXR framerate drops on complex campus | Aggressive LOD (level of detail), frustrum culling, baked lightmaps, limit real-time shadow casters to player + dynamic characters only. |
| Custom cel shader incompatible with post-processing | Test OutlinePass + CelMaterial in isolation on first build. Keep fallback standard material flag in store. |
| Injection hold interrupted by snap-turn | Lock rotation during injection (_OVR input suppression or force 0° delta on hold). |
| Large asset loading times over web | Use `KHR_meshopt_compression` on GLBs. Implement loading screen with per-room chunk streaming. |
| Zustand state sync lag on 50+ entities | Keep ECS entity store outside Zustand (plain JS Map) and batch sync to React only for visible/nearby entities. |

---

## 15. Validation Checklist

- [ ] `npm run dev` serves on HTTPS (WebXR requires secure context). Use `vite --host` + mkcert or ngrok.
- [ ] Meta Quest 2 Browser: enters immersive VR session via `@react-three/xr`.
- [ ] Single zombie in Kelas 2A reacts to player movement with correct cone debug gizmo.
- [ ] Injection holds 2.5s and produces "cured" state transition in entity store.
- [ ] Room transition via stairs/door maintains entity positions and checkpoint save.
- [ ] 72 FPS maintained on Meta Quest 2 in Lobby with 10 visible zombies (use Oculus Browser Performance HUD).

---

## 16. Out of Scope for Initial Plan

- Multiplayer/network sync.
- Procedural room generation.
- Advanced IK full-body avatars (floating arms are acceptable for VR FPS).
- Realtime GI / ray tracing.
- Native Quest APK build (stays WebXR).
