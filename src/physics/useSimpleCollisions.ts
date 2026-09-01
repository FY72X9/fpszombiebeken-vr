import * as THREE from 'three';

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Room boundary colliders derived from actual room geometry (RoomLayout width/depth).
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
    // Bottom landing at z >= 4.4 (Y = 0.0)
    // Step incline from z = 4.4 down to z = -2.7 (Y climbs 0.0 -> 3.15)
    // Top landing platform from z = -2.7 to z = -5.9 (Y = 3.15)
    if (position.z >= 4.4) {
      return 0;
    }
    if (position.z <= -2.7) {
      return 3.15;
    }
    const zBottom = 4.4;
    const zTop = -2.7;
    const progress = Math.max(0, Math.min(1, (zBottom - position.z) / (zBottom - zTop)));
    return progress * 3.15;
  }
  return 0;
}

export function resolvePlayerCollisions(
  position: THREE.Vector3,
  radius: number = 0.45,
  roomId: string = 'lobby_l1'
): THREE.Vector3 {
  const { halfX, halfZ } = getRoomBoundary(roomId);

  // Allow extra margin near door threshold cutouts (|x| < 1.5 or |z| < 1.5) so player can reach door triggers
  const nearXDoor = Math.abs(position.x) < 1.5;
  const nearZDoor = Math.abs(position.z) < 1.5;

  const minX = -halfX + radius;
  const maxX = halfX - radius;
  const minZ = nearXDoor ? -halfZ - 1.2 : -halfZ + radius;
  const maxZ = nearXDoor ? halfZ + 1.2 : halfZ - radius;

  const effectiveMinX = nearZDoor ? -halfX - 1.2 : minX;
  const effectiveMaxX = nearZDoor ? halfX + 1.2 : maxX;

  position.x = Math.max(effectiveMinX, Math.min(effectiveMaxX, position.x));
  position.z = Math.max(minZ, Math.min(maxZ, position.z));

  return position;
}
