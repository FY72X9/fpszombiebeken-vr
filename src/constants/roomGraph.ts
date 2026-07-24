import { RoomId } from '../types/game';

export const ROOM_GRAPH: Record<RoomId, { name: string; connections: RoomId[] }> = {
  lobby_l1: {
    name: 'Lobby Utama Lantai 1',
    connections: ['kelas_1a', 'kelas_1b', 'ruang_direktur', 'ruang_dosen', 'stairs_l1_to_l2']
  },
  kelas_1a: { name: 'Kelas 1A', connections: ['lobby_l1'] },
  kelas_1b: { name: 'Kelas 1B', connections: ['lobby_l1'] },
  ruang_direktur: { name: 'Ruang Direktur Kampus', connections: ['lobby_l1'] },
  ruang_dosen: { name: 'Ruang Dosen', connections: ['lobby_l1'] },
  stairs_l1_to_l2: { name: 'Tangga Lt 1 ke Lt 2', connections: ['lobby_l1', 'koridor_l2'] },
  koridor_l2: {
    name: 'Koridor Utama Lantai 2',
    connections: ['stairs_l1_to_l2', 'kelas_2a', 'kelas_2b', 'kelas_2c']
  },
  kelas_2a: { name: 'Kelas 2A (Nusa)', connections: ['koridor_l2'] },
  kelas_2b: { name: 'Kelas 2B', connections: ['koridor_l2'] },
  kelas_2c: { name: 'Kelas 2C', connections: ['koridor_l2'] },
  entrance: { name: 'Gerbang Utama Kampus', connections: ['lobby_l1'] }
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
// Fallback spawn [x, y, z, facingY] when no directional door transition is known.
// facingY: Three.js camera.rotation.y angle (radians). 0=face-north(-Z), Math.PI=face-south(+Z),
//           Math.PI/2=face-east(+X), -Math.PI/2=face-west(-X)
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number, number]> = {
  lobby_l1:         [0,    1.6,  2.0,  Math.PI],   // face south, toward lobby center
  kelas_1a:         [0,    1.6,  0.0,  0],          // face north toward whiteboard
  kelas_1b:         [0,    1.6,  0.0,  0],
  ruang_direktur:   [0,    1.6,  0.0,  0],
  ruang_dosen:      [0,    1.6,  0.0,  0],
  stairs_l1_to_l2:  [0,    1.6,  3.0,  0],
  koridor_l2:       [0,    4.8,  0.0,  0],
  kelas_2a:         [0,    4.8,  0.0,  0],
  kelas_2b:         [0,    4.8,  0.0,  0],
  kelas_2c:         [0,    4.8,  0.0,  0],
  entrance:         [0,    1.6,  0.0,  0]
};

// ─── DOOR TRANSITION SPAWNS ────────────────────────────────────────────────────
// [x, y, z, facingY] — exact interior landing coords + camera facing when entering room via door.
//
// Three.js camera facing:
//   facingY = 0          → face -Z (north, into room toward whiteboard/back wall)
//   facingY = Math.PI    → face +Z (south, "into room from north wall")
//   facingY = Math.PI/2  → face +X (east)
//   facingY = -Math.PI/2 → face -X (west)
export const DOOR_TRANSITION_SPAWNS: Record<string, Record<string, [number, number, number, number]>> = {
  // ── From lobby → side rooms ──
  lobby_l1: {
    // Lobby west wall doors (x=-7.9): player enters room from east, faces west into room
    kelas_1a:        [4.5,  1.6,  3.0,  -Math.PI / 2],
    ruang_direktur:  [4.5,  1.6,  2.0,  -Math.PI / 2],
    // Lobby east wall doors (x=+7.9): player enters room from west, faces east into room
    kelas_1b:        [-4.5, 1.6,  3.0,  Math.PI / 2],
    ruang_dosen:     [-5.0, 1.6,  2.0,  Math.PI / 2],
    // Lobby north wall door (z=-7.9): player enters stairs from south, faces north
    stairs_l1_to_l2: [0,    1.6,  4.0,  0],
  },
  // ── Back from side rooms → lobby ──
  kelas_1a: {
    // kelas_1a east wall door (x=+5.9): enters lobby from west, face east toward lobby center
    lobby_l1:        [-6.0, 1.6, -3.0,  Math.PI / 2],
  },
  kelas_1b: {
    // kelas_1b west wall door (x=-5.9): enters lobby from east, face west toward lobby center
    lobby_l1:        [6.0,  1.6, -3.0,  -Math.PI / 2],
  },
  ruang_direktur: {
    // east wall door (x=+5.9): enters lobby from west, face east
    lobby_l1:        [-6.0, 1.6,  3.0,  Math.PI / 2],
  },
  ruang_dosen: {
    // west wall door (x=-6.9): enters lobby from east, face west
    lobby_l1:        [6.0,  1.6,  3.0,  -Math.PI / 2],
  },
  // ── Stairs transitions ──
  stairs_l1_to_l2: {
    // South door back to lobby: spawn inside lobby north, face south toward lobby
    lobby_l1:        [0,    1.6, -5.0,  Math.PI],
    // North door to koridor: spawn inside koridor south, face north into koridor
    koridor_l2:      [0,    4.8,  5.0,  0],
  },
  // ── From koridor → upper rooms ──
  koridor_l2: {
    // South door back to stairs: face south toward stairs
    stairs_l1_to_l2: [0,    4.8, -4.0,  Math.PI],
    // Side doors to classrooms: spawn near south door of each kelas, face north into classroom
    kelas_2a:        [0,    4.8,  4.0,  0],
    kelas_2b:        [0,    4.8,  4.0,  0],
    kelas_2c:        [0,    4.8,  4.0,  0],
  },
  // ── Back from upper rooms → koridor ──
  kelas_2a: {
    koridor_l2:      [0,    4.8, -6.0,  Math.PI],
  },
  kelas_2b: {
    koridor_l2:      [0,    4.8, -6.0,  Math.PI],
  },
  kelas_2c: {
    koridor_l2:      [0,    4.8, -6.0,  Math.PI],
  },
};