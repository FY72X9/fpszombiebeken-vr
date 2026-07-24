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

// ─── ROOM SPAWN POINTS (Fallback Defaults) ───────────────────────────────────
// All individual rooms render at local floor Y = 0 (eye level Y = 1.6m).
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number, number]> = {
  lobby_l1:         [0,    1.6,  2.0,  Math.PI],   // center lobby facing south
  kelas_1a:         [0,    1.6,  0.0,  0],          // center facing north
  kelas_1b:         [0,    1.6,  0.0,  0],
  ruang_direktur:   [0,    1.6,  0.0,  0],
  ruang_dosen:      [0,    1.6,  0.0,  0],
  stairs_l1_to_l2:  [0,    1.6,  3.5,  0],          // bottom of stairs facing north
  koridor_l2:       [0,    1.6,  0.0,  0],          // center koridor floor 2
  kelas_2a:         [0,    1.6,  0.0,  0],
  kelas_2b:         [0,    1.6,  0.0,  0],
  kelas_2c:         [0,    1.6,  0.0,  0],
  entrance:         [0,    1.6,  0.0,  0]
};

// ─── EXACT DOOR TRANSITION SPAWNS ─────────────────────────────────────────────
// Format: [x, y, z, facingY]
// Note: Each room renders at local floor level Y=0, so standing eye height is Y=1.6.
// Top landing of stairs has floor level Y=3.2 (standing eye height Y=4.8).
export const DOOR_TRANSITION_SPAWNS: Record<string, Record<string, [number, number, number, number]>> = {
  // ── From Lobby Lt 1 → Side Rooms ──
  lobby_l1: {
    kelas_1a:        [4.2,  1.6, -3.0, -Math.PI / 2],  // Lobby West door (x=-7.9, z=-3) -> Kelas 1A East door landing (x=4.2, z=-3, face West)
    ruang_direktur:  [4.2,  1.6,  3.0, -Math.PI / 2],  // Lobby West door (x=-7.9, z=3)  -> Direktur East door landing (x=4.2, z=3, face West)
    kelas_1b:        [-4.2, 1.6, -3.0,  Math.PI / 2],  // Lobby East door (x=7.9, z=-3)  -> Kelas 1B West door landing (x=-4.2, z=-3, face East)
    ruang_dosen:     [-5.2, 1.6,  3.0,  Math.PI / 2],  // Lobby East door (x=7.9, z=3)   -> Dosen West door landing (x=-5.2, z=3, face East)
    stairs_l1_to_l2: [0,    1.6,  4.2,  0],            // Lobby North door (z=-7.9)      -> Stairs South door landing (z=4.2, face North)
  },

  // ── Back from Side Rooms → Lobby Lt 1 ──
  kelas_1a: {
    lobby_l1:        [-6.0, 1.6, -3.0,  Math.PI / 2],  // Kelas 1A East door -> Lobby West door landing (x=-6.0, z=-3, face East)
  },
  kelas_1b: {
    lobby_l1:        [6.0,  1.6, -3.0, -Math.PI / 2],  // Kelas 1B West door -> Lobby East door landing (x=6.0, z=-3, face West)
  },
  ruang_direktur: {
    lobby_l1:        [-6.0, 1.6,  3.0,  Math.PI / 2],  // Direktur East door -> Lobby West door landing (x=-6.0, z=3, face East)
  },
  ruang_dosen: {
    lobby_l1:        [6.0,  1.6,  3.0, -Math.PI / 2],  // Dosen West door    -> Lobby East door landing (x=6.0, z=3, face West)
  },

  // ── Stairs Floor 1 <-> Floor 2 ──
  stairs_l1_to_l2: {
    lobby_l1:        [0,    1.6, -6.0,  Math.PI],      // Stairs South door -> Lobby North door landing (z=-6.0, face South)
    koridor_l2:      [0,    1.6,  6.0,  0],            // Stairs North door -> Koridor South door landing (z=6.0, face North)
  },

  // ── From Koridor Lt 2 → Upper Rooms ──
  koridor_l2: {
    stairs_l1_to_l2: [0,    4.8, -4.2,  Math.PI],      // Koridor South door (z=7.9) -> Stairs top landing (z=-4.2, y=3.2+1.6=4.8, face South)
    kelas_2a:        [4.2,  1.6, -3.0, -Math.PI / 2],  // Koridor West door (x=-7.9, z=-3) -> Kelas 2A East door landing (x=4.2, z=-3, face West)
    kelas_2b:        [-4.2, 1.6, -3.0,  Math.PI / 2],  // Koridor East door (x=7.9, z=-3)  -> Kelas 2B West door landing (x=-4.2, z=-3, face East)
    kelas_2c:        [4.2,  1.6,  3.0, -Math.PI / 2],  // Koridor West door (x=-7.9, z=3)  -> Kelas 2C East door landing (x=4.2, z=3, face West)
  },

  // ── Back from Upper Rooms → Koridor Lt 2 ──
  kelas_2a: {
    koridor_l2:      [-6.0, 1.6, -3.0,  Math.PI / 2],  // Kelas 2A East door -> Koridor West door landing (x=-6.0, z=-3, face East)
  },
  kelas_2b: {
    koridor_l2:      [6.0,  1.6, -3.0, -Math.PI / 2],  // Kelas 2B West door -> Koridor East door landing (x=6.0, z=-3, face West)
  },
  kelas_2c: {
    koridor_l2:      [-6.0, 1.6,  3.0,  Math.PI / 2],  // Kelas 2C East door -> Koridor West door landing (x=-6.0, z=3, face East)
  },
};