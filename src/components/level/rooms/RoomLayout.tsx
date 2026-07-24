import { ReactNode } from 'react';
import { CelMaterial } from '../../../shaders/CelMaterial';

interface RoomLayoutProps {
  width?: number;
  depth?: number;
  height?: number;
  floorColor?: string;
  wallColor?: string;
  children?: ReactNode;
}

export function RoomLayout({
  width = 14,
  depth = 14,
  height = 3.4,
  floorColor = '#e2e8f0',
  wallColor = '#f1f5f9',
  children
}: RoomLayoutProps) {
  const halfW = width / 2;
  const halfD = depth / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* Tiled Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <CelMaterial color={floorColor} roughness={0.3} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <CelMaterial color="#94a3b8" />
      </mesh>

      {/* 4 Solid Surrounding Room Walls */}
      {/* North Wall */}
      <mesh position={[0, height / 2, -halfD]}>
        <boxGeometry args={[width, height, 0.2]} />
        <CelMaterial color={wallColor} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, height / 2, halfD]}>
        <boxGeometry args={[width, height, 0.2]} />
        <CelMaterial color={wallColor} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-halfW, height / 2, 0]}>
        <boxGeometry args={[0.2, height, depth]} />
        <CelMaterial color={wallColor} />
      </mesh>
      {/* East Wall */}
      <mesh position={[halfW, height / 2, 0]}>
        <boxGeometry args={[0.2, height, depth]} />
        <CelMaterial color={wallColor} />
      </mesh>

      {/* Ambient Lighting inside room */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, height - 0.5, 0]} intensity={0.7} color="#fef08a" />

      {children}
    </group>
  );
}
