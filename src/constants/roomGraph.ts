import { RoomId } from '../types/game';

export const ROOM_GRAPH: Record<RoomId, { name: string; connections: RoomId[] }> = {
  lobby_l1: {
    name: 'Lobby Utama Lantai 1',
    connections: ['kelas_1a', 'kelas_1b', 'ruang_direktur', 'ruang_dosen', 'stairs_l1_to_l2']
  },
  kelas_1a: {
    name: 'Kelas 1A',
    connections: ['lobby_l1']
  },
  kelas_1b: {
    name: 'Kelas 1B',
    connections: ['lobby_l1']
  },
  ruang_direktur: {
    name: 'Ruang Direktur Kampus',
    connections: ['lobby_l1']
  },
  ruang_dosen: {
    name: 'Ruang Dosen',
    connections: ['lobby_l1']
  },
  stairs_l1_to_l2: {
    name: 'Tangga Lt 1 ke Lt 2',
    connections: ['lobby_l1', 'koridor_l2']
  },
  koridor_l2: {
    name: 'Koridor Utama Lantai 2',
    connections: ['stairs_l1_to_l2', 'kelas_2a', 'kelas_2b', 'kelas_2c']
  },
  kelas_2a: {
    name: 'Kelas 2A (Nusa)',
    connections: ['koridor_l2']
  },
  kelas_2b: {
    name: 'Kelas 2B',
    connections: ['koridor_l2']
  },
  kelas_2c: {
    name: 'Kelas 2C',
    connections: ['koridor_l2']
  },
  entrance: {
    name: 'Gerbang Utama Kampus',
    connections: ['lobby_l1']
  }
};

export const ROOM_LABELS: Record<RoomId, string> = {
  lobby_l1: 'Lobby Lt 1',
  kelas_1a: 'Kelas 1A',
  kelas_1b: 'Kelas 1B',
  ruang_direktur: 'Ruang Direktur',
  ruang_dosen: 'Ruang Dosen',
  stairs_l1_to_l2: 'Tangga Lt 2',
  koridor_l2: 'Koridor Lt 2',
  kelas_2a: 'Kelas 2A',
  kelas_2b: 'Kelas 2B',
  kelas_2c: 'Kelas 2C',
  entrance: 'Gerbang Utama'
};

// ─── ROOM SPAWN POINTS ────────────────────────────────────────────────────────
// Used as fallback spawn when no directional door transition is known.
// Coordinates are safe interior positions, well within every room's wall boundary.
//
// Room geometry reference:
//   lobby_l1      : 16×16 (halfW=8, halfD=8)  → safe zone [±6, ±6]
//   kelas_1a      : 12×12 (halfW=6, halfD=6)  → safe zone [±4, ±4]
//   kelas_1b      : 12×12                      → safe zone [±4, ±4]
//   ruang_direktur: 12×10 (halfW=6, halfD=5)  → safe zone [±4, ±3]
//   ruang_dosen   : 14×10 (halfW=7, halfD=5)  → safe zone [±5, ±3]
//   stairs_l1_to_l2: 8×12 (halfW=4, halfD=6) → safe zone [±2, ±4]
//   koridor_l2    : 16×16 (halfW=8, halfD=8)  → safe zone [±6, ±6], Y=4.8
//   kelas_2a/2b/2c: 12×12                     → safe zone [±4, ±4], Y=4.8
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number]> = {
  lobby_l1:         [0,    1.6, 2.0],
  kelas_1a:         [0,    1.6, 0.0],
  kelas_1b:         [0,    1.6, 0.0],
  ruang_direktur:   [0,    1.6, 0.0],
  ruang_dosen:      [0,    1.6, 0.0],
  stairs_l1_to_l2:  [0,    1.6, 3.0],   // near bottom of stairs
  koridor_l2:       [0,    4.8, 0.0],
  kelas_2a:         [0,    4.8, 0.0],
  kelas_2b:         [0,    4.8, 0.0],
  kelas_2c:         [0,    4.8, 0.0],
  entrance:         [0,    1.6, 0.0]
};

// ─── DOOR TRANSITION SPAWN POINTS ─────────────────────────────────────────────
// Exact interior landing coordinates used when entering a specific door.
// Format: DOOR_TRANSITION_SPAWNS[fromRoom][toRoom] = [x, y, z]
// The spawn should be 0.8–1.5m inside the destination room's doorway.
//
// Door positions per room (actual mesh coords):
//   lobby_l1 doors:
//     → kelas_1a      : position=[-7.9, 0, -3]   player enters kelas_1a from east wall
//     → kelas_1b      : position=[+7.9, 0, -3]   player enters kelas_1b from west wall
//     → ruang_direktur: position=[-7.9, 0,  3]   player enters ruang_direktur from east wall
//     → ruang_dosen   : position=[+7.9, 0,  3]   player enters ruang_dosen from west wall
//     → stairs        : position=[0,    0, -7.9]  player enters stairs from south wall
//
//   kelas_1a door  : position=[5.9, 0, 3] → back to lobby from west wall
//   kelas_1b door  : position=[-5.9, 0, 3] → back to lobby from east wall  (inferred)
//   ruang_direktur : position=[5.9, 0, 2] → back to lobby from west wall
//   ruang_dosen    : position=[-6.9, 0, 2] → back to lobby from east wall
//
//   stairs_l1_to_l2:
//     → lobby_l1     : position=[0, 0,  5.9]  (south door)
//     → koridor_l2   : position=[0, 3.2, -5.9] (north door, elevated)
//
//   koridor_l2 doors:
//     → kelas_2a     : position=[-7.9, 0, -4]
//     → kelas_2b     : position=[+7.9, 0, -4]
//     → kelas_2c     : position=[-7.9, 0,  4]
//     → stairs       : position=[0,    0,  7.9]
//
//   kelas_2a/2b/2c door: position=[0, 0, 5.9] → back to koridor_l2
export const DOOR_TRANSITION_SPAWNS: Record<string, Record<string, [number, number, number]>> = {
  // ── From lobby → side rooms ──────────────────────────────────────────────
  lobby_l1: {
    kelas_1a:       [4.5,  1.6,  3.0],  // enter kelas_1a east side, well inside 12×12
    kelas_1b:       [-4.5, 1.6,  3.0],  // enter kelas_1b west side
    ruang_direktur: [4.5,  1.6,  2.0],  // enter ruang_direktur (12×10) east side
    ruang_dosen:    [-5.0, 1.6,  2.0],  // enter ruang_dosen (14×10) west side
    stairs_l1_to_l2:[0,    1.6,  4.0],  // enter stairs near bottom (8×12, halfD=6)
  },
  // ── Back from side rooms → lobby ─────────────────────────────────────────
  kelas_1a: {
    lobby_l1:       [-6.0, 1.6, -3.0],  // enter lobby from west side (16×16, halfW=8)
  },
  kelas_1b: {
    lobby_l1:       [6.0,  1.6, -3.0],  // enter lobby from east side
  },
  ruang_direktur: {
    lobby_l1:       [-6.0, 1.6,  3.0],  // enter lobby from west side
  },
  ruang_dosen: {
    lobby_l1:       [6.0,  1.6,  3.0],  // enter lobby from east side
  },
  // ── Stairs transitions ────────────────────────────────────────────────────
  stairs_l1_to_l2: {
    lobby_l1:       [0,    1.6, -5.0],  // enter lobby from north (just inside south lobby wall)
    koridor_l2:     [0,    4.8,  5.0],  // enter koridor_l2 from south (16×16, halfD=8)
  },
  // ── From koridor → upper rooms ────────────────────────────────────────────
  koridor_l2: {
    stairs_l1_to_l2:[0,    4.8, -4.0],  // enter stairs top from north (8×12, halfD=6)
    kelas_2a:       [0,    4.8,  4.0],  // enter kelas_2a from south door (12×12, halfD=6)
    kelas_2b:       [0,    4.8,  4.0],  // enter kelas_2b from south door
    kelas_2c:       [0,    4.8,  4.0],  // enter kelas_2c from south door
  },
  // ── Back from upper rooms → koridor ──────────────────────────────────────
  kelas_2a: {
    koridor_l2:     [0,    4.8, -6.0],  // enter koridor_l2 from north (halfD=8, safe=-6)
  },
  kelas_2b: {
    koridor_l2:     [0,    4.8, -6.0],
  },
  kelas_2c: {
    koridor_l2:     [0,    4.8, -6.0],
  },
};