import { RoomId } from '../types/game';

export const ROOM_GRAPH: Record<RoomId, { name: string; connections: RoomId[] }> = {
  lobby_l1: {
    name: 'Lobby Utama Lantai 1',
    connections: ['kelas_1a', 'kelas_1b', 'ruang_direktur', 'ruang_dosen', 'stairs_l1_to_l2', 'entrance']
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
// Three.js facing angles: 0 = North (-Z), Math.PI = South (+Z), Math.PI/2 = West (-X), -Math.PI/2 = East (+X)
export const ROOM_SPAWN_POINTS: Record<string, [number, number, number, number]> = {
  lobby_l1:         [0.0,  1.6,  2.0,  Math.PI],   // center lobby safe interior facing south
  kelas_1a:         [3.8,  1.6, -3.0,  Math.PI / 2],  // East door facing WEST into room
  kelas_1b:         [-3.8, 1.6, -3.0, -Math.PI / 2],  // West door facing EAST into room
  ruang_direktur:   [-3.8, 1.6,  3.0, -Math.PI / 2],  // West door facing EAST into room
  ruang_dosen:      [3.8,  1.6,  3.0,  Math.PI / 2],  // East door facing WEST into room
  stairs_l1_to_l2:  [0.0,  1.6,  3.8,  0],          // bottom of stairs facing NORTH up stairs
  koridor_l2:       [0.0,  1.6,  5.8,  0],          // South stairs door facing NORTH into koridor
  kelas_2a:         [3.8,  1.6, -3.0,  Math.PI / 2],  // East door facing WEST into room
  kelas_2b:         [-3.8, 1.6, -3.0, -Math.PI / 2],  // West door facing EAST into room
  kelas_2c:         [3.8,  1.6,  3.0,  Math.PI / 2],  // East door facing WEST into room
  entrance:         [0.0,  1.6,  5.8,  Math.PI]       // South gate facing SOUTH
};

// ─── GROUND-UP CALCULATED DOOR TRANSITION SPAWNS ─────────────────────────────────
// Format: [x, y, z, facingY]
// Every door transition sits inside the target room, facing away from the entry door towards room center.
// Three.js facing angles:
//   Math.PI / 2  = Face WEST (-X into room from East wall)
//   -Math.PI / 2 = Face EAST (+X into room from West wall)
//   Math.PI      = Face SOUTH (+Z into room from North wall)
//   0            = Face NORTH (-Z into room from South wall)
export const DOOR_TRANSITION_SPAWNS: Record<string, Record<string, [number, number, number, number]>> = {
  // ── From Lobby Lt 1 → Target Rooms ──
  lobby_l1: {
    kelas_1a:        [3.8,  1.6, -3.0,  Math.PI / 2],  // Lobby West door z=-3 -> Kelas 1A East door (x=3.8, face WEST into 1A)
    ruang_dosen:     [3.8,  1.6,  3.0,  Math.PI / 2],  // Lobby West door z=3  -> Dosen East door (x=3.8, face WEST into Dosen)
    kelas_1b:        [-3.8, 1.6, -3.0, -Math.PI / 2],  // Lobby East door z=-3 -> Kelas 1B West door (x=-3.8, face EAST into 1B)
    ruang_direktur:  [-3.8, 1.6,  3.0, -Math.PI / 2],  // Lobby East door z=3  -> Direktur West door (x=-3.8, face EAST into Direktur)
    stairs_l1_to_l2: [0.0,  1.6,  3.8,  0],            // Lobby North door z=-7.9 -> Stairs South bottom door (z=3.8, face NORTH up stairs)
    entrance:        [0.0,  1.6,  5.8,  Math.PI],      // Lobby South door z=7.9  -> Entrance gate (z=5.8, face SOUTH)
  },

  // ── Back from Floor 1 Rooms → Lobby Lt 1 ──
  kelas_1a: {
    lobby_l1:        [-5.8, 1.6, -3.0, -Math.PI / 2],  // Exiting 1A -> Lobby West door landing (x=-5.8, face EAST into Lobby)
  },
  kelas_1b: {
    lobby_l1:        [5.8,  1.6, -3.0,  Math.PI / 2],  // Exiting 1B -> Lobby East door landing (x=5.8, face WEST into Lobby)
  },
  ruang_dosen: {
    lobby_l1:        [-5.8, 1.6,  3.0, -Math.PI / 2],  // Exiting Dosen -> Lobby West door landing (x=-5.8, face EAST into Lobby)
  },
  ruang_direktur: {
    lobby_l1:        [5.8,  1.6,  3.0,  Math.PI / 2],  // Exiting Direktur -> Lobby East door landing (x=5.8, face WEST into Lobby)
  },
  entrance: {
    lobby_l1:        [0.0,  1.6,  5.8,  0],            // Exiting Entrance -> Lobby South door landing (z=5.8, face NORTH into Lobby)
  },

  // ── Stairs Floor 1 <-> Floor 2 ──
  stairs_l1_to_l2: {
    lobby_l1:        [0.0,  1.6, -5.8,  Math.PI],      // Stairs South door -> Lobby North door landing (z=-5.8, face SOUTH into Lobby)
    koridor_l2:      [0.0,  1.6,  5.8,  0],            // Stairs North door -> Koridor South door landing (z=5.8, face NORTH into Koridor)
  },

  // ── From Koridor Lt 2 → Upper Rooms & Stairs ──
  koridor_l2: {
    stairs_l1_to_l2: [0.0,  4.75, -3.8, Math.PI],      // Koridor South door -> Stairs North top door (z=-3.8, y=4.75, face SOUTH down stairs)
    kelas_2a:        [3.8,  1.6, -3.0,  Math.PI / 2],  // Koridor West door z=-3 -> Kelas 2A East door (x=3.8, face WEST into 2A)
    kelas_2b:        [-3.8, 1.6, -3.0, -Math.PI / 2],  // Koridor East door z=-3 -> Kelas 2B West door (x=-3.8, face EAST into 2B)
    kelas_2c:        [3.8,  1.6,  3.0,  Math.PI / 2],  // Koridor West door z=3  -> Kelas 2C East door (x=3.8, face WEST into 2C)
  },

  // ── Back from Upper Rooms → Koridor Lt 2 ──
  kelas_2a: {
    koridor_l2:      [-5.8, 1.6, -3.0, -Math.PI / 2],  // Exiting 2A (Nusa) -> Koridor West door landing (x=-5.8, face EAST into Koridor)
  },
  kelas_2b: {
    koridor_l2:      [5.8,  1.6, -3.0,  Math.PI / 2],  // Exiting 2B -> Koridor East door landing (x=5.8, face WEST into Koridor)
  },
  kelas_2c: {
    koridor_l2:      [-5.8, 1.6,  3.0, -Math.PI / 2],  // Exiting 2C -> Koridor West door landing (x=-5.8, face EAST into Koridor)
  },
};