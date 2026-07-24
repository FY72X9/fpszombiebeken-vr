import { ReactNode } from 'react';

interface RoomLayoutProps {
  width?: number;
  depth?: number;
  height?: number;
  floorColor?: string;
  wallColor?: string;
  accentColor?: string;
  lightColor?: string;
  children?: ReactNode;
}

export function RoomLayout({
  width = 14,
  depth = 14,
  height = 3.4,
  floorColor = '#e2e8f0',
  wallColor = '#f1f5f9',
  accentColor = '#334155',
  lightColor = '#fffde7',
  children
}: RoomLayoutProps) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const doorW = 2.4;
  const wallT = 0.22;
  const dado = height * 0.32; // dado rail height (~1.1m in 3.4m room)

  return (
    <group>
      {/* ── Floor — main tile base ── */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Grout grid overlay (thin dark strips, elevated at Y=0.002 to eliminate Z-fighting flicker) */}
      {Array.from({ length: Math.floor(width / 1.5) }).map((_, i) => (
        <mesh key={`gx${i}`} position={[-halfW + 1.5 + i * 1.5, 0.002, 0]}>
          <boxGeometry args={[0.03, 0.001, depth]} />
          <meshBasicMaterial color="#94a3b8" polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(depth / 1.5) }).map((_, i) => (
        <mesh key={`gz${i}`} position={[0, 0.002, -halfD + 1.5 + i * 1.5]}>
          <boxGeometry args={[width, 0.001, 0.03]} />
          <meshBasicMaterial color="#94a3b8" polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
      ))}

      {/* ── Ceiling ── */}
      <mesh position={[0, height + 0.04, 0]}>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>

      {/* ── Fluorescent ceiling light panels ── */}
      {[-width * 0.2, width * 0.2].map((x, i) => (
        <group key={`light_${i}`} position={[x, height - 0.01, 0]}>
          <mesh>
            <boxGeometry args={[1.4, 0.04, 3.5]} />
            <meshStandardMaterial color="#fffde7" emissive={lightColor} emissiveIntensity={1.2} roughness={1} />
          </mesh>
          <pointLight position={[0, -0.5, 0]} intensity={1.6} color={lightColor} distance={8} decay={2} castShadow />
        </group>
      ))}

      {/* ── Ambient fill ── */}
      <ambientLight intensity={0.35} />

      {/* ── Walls ── */}
      {/* North wall with doorway cutout */}
      <group>
        <mesh position={[-(halfW - (halfW - doorW / 2) / 2), dado / 2, -halfD]}>
          <boxGeometry args={[halfW - doorW / 2, dado, wallT]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[(halfW - (halfW - doorW / 2) / 2), dado / 2, -halfD]}>
          <boxGeometry args={[halfW - doorW / 2, dado, wallT]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[-(halfW - (halfW - doorW / 2) / 2), dado + (height - dado) / 2, -halfD]}>
          <boxGeometry args={[halfW - doorW / 2, height - dado, wallT]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[(halfW - (halfW - doorW / 2) / 2), dado + (height - dado) / 2, -halfD]}>
          <boxGeometry args={[halfW - doorW / 2, height - dado, wallT]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, dado, -halfD]}>
          <boxGeometry args={[width, 0.06, wallT + 0.01]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.06, -halfD]}>
          <boxGeometry args={[width, 0.12, wallT + 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* South wall with doorway cutout */}
      <group>
        <mesh position={[-(halfW - (halfW - doorW / 2) / 2), dado / 2, halfD]}>
          <boxGeometry args={[halfW - doorW / 2, dado, wallT]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[(halfW - (halfW - doorW / 2) / 2), dado / 2, halfD]}>
          <boxGeometry args={[halfW - doorW / 2, dado, wallT]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[-(halfW - (halfW - doorW / 2) / 2), dado + (height - dado) / 2, halfD]}>
          <boxGeometry args={[halfW - doorW / 2, height - dado, wallT]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[(halfW - (halfW - doorW / 2) / 2), dado + (height - dado) / 2, halfD]}>
          <boxGeometry args={[halfW - doorW / 2, height - dado, wallT]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, dado, halfD]}>
          <boxGeometry args={[width, 0.06, wallT + 0.01]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.06, halfD]}>
          <boxGeometry args={[width, 0.12, wallT + 0.01]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* West wall with doorway cutout */}
      <group>
        <mesh position={[-halfW, dado / 2, -(halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[-halfW, dado / 2, (halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[-halfW, dado + (height - dado) / 2, -(halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, height - dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[-halfW, dado + (height - dado) / 2, (halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, height - dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      </group>

      {/* East wall with doorway cutout */}
      <group>
        <mesh position={[halfW, dado / 2, -(halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[halfW, dado / 2, (halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={accentColor} roughness={0.8} />
        </mesh>
        <mesh position={[halfW, dado + (height - dado) / 2, -(halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, height - dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
        <mesh position={[halfW, dado + (height - dado) / 2, (halfD - (halfD - doorW / 2) / 2)]}>
          <boxGeometry args={[wallT, height - dado, halfD - doorW / 2]} />
          <meshStandardMaterial color={wallColor} roughness={0.7} />
        </mesh>
      </group>

      {children}
    </group>
  );
}
