import * as THREE from 'three';

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Bounding walls for rooms (Outer boundaries and inner obstacles)
export function getRoomWallColliders(_roomId: string): BoundingBox2D[] {
  // Base room outer walls bounds (14m x 14m approx)
  const halfSize = 7.2;
  const wallThickness = 0.4;

  const outerWalls: BoundingBox2D[] = [
    // North wall (Z = -halfSize)
    { minX: -halfSize, maxX: halfSize, minZ: -halfSize - wallThickness, maxZ: -halfSize },
    // South wall (Z = halfSize)
    { minX: -halfSize, maxX: halfSize, minZ: halfSize, maxZ: halfSize + wallThickness },
    // West wall (X = -halfSize)
    { minX: -halfSize - wallThickness, maxX: -halfSize, minZ: -halfSize, maxZ: halfSize },
    // East wall (X = halfSize)
    { minX: halfSize, maxX: halfSize + wallThickness, minZ: -halfSize, maxZ: halfSize },
  ];

  return outerWalls;
}

export function checkSphereAABBCollision(
  position: THREE.Vector3,
  radius: number,
  box: BoundingBox2D
): THREE.Vector3 {
  // Find closest point on box to sphere center
  const closestX = Math.max(box.minX, Math.min(position.x, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(position.z, box.maxZ));

  const distX = position.x - closestX;
  const distZ = position.z - closestZ;
  const distSq = distX * distX + distZ * distZ;

  if (distSq < radius * radius && distSq > 0.00001) {
    const dist = Math.sqrt(distSq);
    const overlap = radius - dist;
    const normX = distX / dist;
    const normZ = distZ / dist;

    // Push position out of collision box
    position.x += normX * overlap;
    position.z += normZ * overlap;
  }

  return position;
}

export function resolvePlayerCollisions(
  position: THREE.Vector3,
  radius: number = 0.4,
  roomId: string = 'lobby_l1'
): THREE.Vector3 {
  const colliders = getRoomWallColliders(roomId);
  for (const box of colliders) {
    checkSphereAABBCollision(position, radius, box);
  }
  return position;
}
