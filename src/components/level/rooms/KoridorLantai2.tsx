import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { RoomLayout } from './RoomLayout';

export function Stairs() {
  return (
    <RoomLayout
      width={8}
      depth={12}
      height={3.8}
      floorColor="#64748b"
      wallColor="#94a3b8"
      accentColor="#334155"
      lightColor="#f1f5f9"
    >
      {/* 3D Stair Steps */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <mesh key={i} position={[0, i * 0.35 + 0.175, 4 - i * 0.8]}>
          <boxGeometry args={[4, 0.35, 0.8]} />
          <CelMaterial color="#475569" />
        </mesh>
      ))}

      {/* Top Landing Floor Platform at y=3.15 connecting to North Door at z=-5.9 */}
      <mesh position={[0, 3.15, -4.3]}>
        <boxGeometry args={[6, 0.1, 3.2]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Handrails */}
      <mesh position={[-2, 1.8, 0]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 8]} />
        <CelMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[2, 1.8, 0]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 8]} />
        <CelMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>

      {/* Stair Landing Wall Sign */}
      <mesh position={[0, 3.2, -5.85]}>
        <boxGeometry args={[2.5, 0.4, 0.04]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>

      {/* South door to Lobby Lt 1 */}
      <Door position={[0, 0, 5.9]} rotationY={Math.PI} targetRoom="lobby_l1" label="Lobby Lt 1" />
      {/* North door to Koridor Lt 2 */}
      <Door position={[0, 3.2, -5.9]} rotationY={0} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}

export function KoridorLantai2() {
  return (
    <RoomLayout
      width={16}
      depth={16}
      height={3.6}
      floorColor="#cbd5e1"
      wallColor="#f8fafc"
      accentColor="#1e3a8a"
      lightColor="#e0f2fe"
    >
      {/* Corridor Wall Lockers (West Wall - Centered between doors at z=0) */}
      <group position={[-7.6, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 2.2, 2.0]} />
          <CelMaterial color="#1e3a8a" />
        </mesh>
        {[-0.6, 0.6].map((z, i) => (
          <mesh key={i} position={[0.22, 0, z]}>
            <boxGeometry args={[0.04, 0.2, 0.04]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Corridor Wall Lockers (East Wall - Centered between doors at z=0) */}
      <group position={[7.6, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 2.2, 2.0]} />
          <CelMaterial color="#1e3a8a" />
        </mesh>
        {[-0.6, 0.6].map((z, i) => (
          <mesh key={i} position={[-0.22, 0, z]}>
            <boxGeometry args={[0.04, 0.2, 0.04]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Emergency Exit Sign */}
      <mesh position={[0, 3.0, 7.8]}>
        <boxGeometry args={[1.5, 0.4, 0.05]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>

      {/* Doors to Upper Classrooms */}
      <Door position={[-7.9, 0, -3]} rotationY={Math.PI / 2} targetRoom="kelas_2a" label="Kelas 2A (Nusa)" />
      <Door position={[7.9, 0, -3]} rotationY={-Math.PI / 2} targetRoom="kelas_2b" label="Kelas 2B" />
      <Door position={[-7.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="kelas_2c" label="Kelas 2C" />
      <Door position={[0, 0, 7.9]} rotationY={Math.PI} targetRoom="stairs_l1_to_l2" label="Tangga Lt 1" />
    </RoomLayout>
  );
}
