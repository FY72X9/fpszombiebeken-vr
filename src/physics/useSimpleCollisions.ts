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
    // Smooth step climbing from Y=0 at Z=+5.0 (bottom) to Y=3.2 at Z=-5.0 (top)
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
