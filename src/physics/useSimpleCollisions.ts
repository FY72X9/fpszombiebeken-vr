import * as THREE from 'three';

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Room boundary colliders derived from actual room geometry (RoomLayout width/depth).
// Each room uses its half-extents minus a small player radius margin.
// Room sizes: lobby_l1=16×16, kelas=12×12, ruang_direktur=12×10, ruang_dosen=14×10,
//             stairs=8×12, koridor_l2=16×16, kelas_2x=12×12
export function getRoomBoundary(roomId: string): { halfX: number; halfZ: number } {
  switch (roomId) {
    case 'lobby_l1':
    case 'entrance':
      return { halfX: 7.6, halfZ: 7.6 };
    case 'kelas_1a':
    case 'kelas_1b':
    case 'kelas_2a':
    case 'kelas_2b':
    case 'kelas_2c':
      return { halfX: 5.6, halfZ: 5.6 };
    case 'ruang_direktur':
      return { halfX: 5.6, halfZ: 4.6 };
    case 'ruang_dosen':
      return { halfX: 6.6, halfZ: 4.6 };
    case 'stairs_l1_to_l2':
      return { halfX: 3.6, halfZ: 5.6 };
    case 'koridor_l2':
      return { halfX: 7.6, halfZ: 7.6 };
    default:
      return { halfX: 5.6, halfZ: 5.6 };
  }
}

export function getStairElevation(position: THREE.Vector3, roomId: string): number {
  if (roomId === 'stairs_l1_to_l2') {
    // Smooth step climbing from Y=0 at Z=+5.5 (bottom) to Y=3.2 at Z=-5.5 (top)
    const zBottom = 5.0;
    const zTop = -5.0;
    const progress = Math.max(0, Math.min(1, (zBottom - position.z) / (zBottom - zTop)));
    return progress * 3.2;
  }
  return 0;
}

export function resolvePlayerCollisions(
  position: THREE.Vector3,
  radius: number = 0.45,
  roomId: string = 'lobby_l1'
): THREE.Vector3 {
  const { halfX, halfZ } = getRoomBoundary(roomId);

  // Hard-clamp player inside room boundary walls
  position.x = Math.max(-halfX + radius, Math.min(halfX - radius, position.x));
  position.z = Math.max(-halfZ + radius, Math.min(halfZ - radius, position.z));

  // Apply stair climbing elevation
  const stairY = getStairElevation(position, roomId);
  if (stairY > 0) {
    // Lerp camera Y up to stair height + eye-level offset
    const targetY = stairY + 1.6;
    position.y += (targetY - position.y) * 0.15;
  }

  return position;
}
