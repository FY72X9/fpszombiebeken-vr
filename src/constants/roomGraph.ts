import { RoomId } from '../types/game';

export const ROOM_GRAPH: Record<RoomId, { floor: 1 | 2; connections: RoomId[]; hasStairs?: boolean; spawnPoints?: Vector3Tuple[] }> = {
  entrance: {
    floor: 1,
    connections: ['lobby_l1'],
    spawnPoints: [[0, 0, 0]]
  },
  lobby_l1: {
    floor: 1,
    connections: ['entrance', 'kelas_1a', 'kelas_1b', 'ruang_direktur', 'ruang_dosen', 'stairs_l1_to_l2'],
    spawnPoints: [[0, 0, 0], [5, 0, 0], [-5, 0, 0]]
  },
  kelas_1a: {
    floor: 1,
    connections: ['lobby_l1'],
    spawnPoints: [[0, 0, 0], [3, 0, 2], [-3, 0, 2], [3, 0, -2], [-3, 0, -2]]
  },
  kelas_1b: {
    floor: 1,
    connections: ['lobby_l1'],
    spawnPoints: [[0, 0, 0], [3, 0, 2], [-3, 0, 2], [3, 0, -2], [-3, 0, -2]]
  },
  ruang_direktur: {
    floor: 1,
    connections: ['lobby_l1'],
    spawnPoints: [[0, 0, 0], [2, 0, 1], [-2, 0, 1]]
  },
  ruang_dosen: {
    floor: 1,
    connections: ['lobby_l1'],
    spawnPoints: [[0, 0, 0], [2, 0, 1], [-2, 0, 1], [0, 0, 3]]
  },
  stairs_l1_to_l2: {
    floor: 1,
    connections: ['lobby_l1', 'koridor_l2'],
    hasStairs: true,
    spawnPoints: []
  },
  koridor_l2: {
    floor: 2,
    connections: ['stairs_l1_to_l2', 'kelas_2a', 'kelas_2b', 'kelas_2c'],
    spawnPoints: [[0, 0, 0], [4, 0, 0], [-4, 0, 0]]
  },
  kelas_2a: {
    floor: 2,
    connections: ['koridor_l2'],
    spawnPoints: [[0, 0, 0], [2, 0, 1.5], [-2, 0, 1.5], [2, 0, -1.5], [-2, 0, -1.5]]
  },
  kelas_2b: {
    floor: 2,
    connections: ['koridor_l2'],
    spawnPoints: [[0, 0, 0], [2, 0, 1.5], [-2, 0, 1.5], [2, 0, -1.5], [-2, 0, -1.5]]
  },
  kelas_2c: {
    floor: 2,
    connections: ['koridor_l2'],
    spawnPoints: [[0, 0, 0], [2, 0, 1.5], [-2, 0, 1.5], [2, 0, -1.5], [-2, 0, -1.5]]
  }
};

export const ROOM_LABELS: Record<RoomId, string> = {
  entrance: 'Gerbang Masuk',
  lobby_l1: 'Lobby Lantai 1',
  kelas_1a: 'Kelas 1A',
  kelas_1b: 'Kelas 1B',
  ruang_direktur: 'Ruang Direktur',
  ruang_dosen: 'Ruang Dosen',
  stairs_l1_to_l2: 'Tangga ke Lantai 2',
  koridor_l2: 'Koridor Lantai 2',
  kelas_2a: 'Kelas 2A',
  kelas_2b: 'Kelas 2B',
  kelas_2c: 'Kelas 2C'
};

export const ROOM_CAMERA_DEFAULTS: Record<RoomId, [number, number, number]> = {
  entrance: [0, 1.6, 5],
  lobby_l1: [0, 1.6, 0],
  kelas_1a: [0, 1.6, 0],
  kelas_1b: [0, 1.6, 0],
  ruang_direktur: [0, 1.6, 0],
  ruang_dosen: [0, 1.6, 0],
  stairs_l1_to_l2: [0, 1.6, 0],
  koridor_l2: [0, 1.6, 0],
  kelas_2a: [0, 1.6, 0],
  kelas_2b: [0, 1.6, 0],
  kelas_2c: [0, 1.6, 0]
};

export function getConnectedRooms(roomId: RoomId): RoomId[] {
  return ROOM_GRAPH[roomId]?.connections || [];
}

export function getRoomFloor(roomId: RoomId): 1 | 2 {
  return ROOM_GRAPH[roomId]?.floor || 1;
}

export function findPath(start: RoomId, goal: RoomId): RoomId[] {
  if (start === goal) return [start];
  const visited = new Set<RoomId>();
  const queue: { node: RoomId; path: RoomId[] }[] = [{ node: start, path: [start] }];
  
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node === goal) return path;
    if (visited.has(node)) continue;
    visited.add(node);
    
    for (const conn of getConnectedRooms(node)) {
      if (!visited.has(conn)) {
        queue.push({ node: conn, path: [...path, conn] });
      }
    }
  }
  return [];
}

export type Vector3Tuple = [number, number, number];