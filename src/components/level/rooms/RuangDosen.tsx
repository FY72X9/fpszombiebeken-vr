
import { Door } from '../props/Door';
import { Desk, Chair, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { SyringeRefillStation } from '../../items/SyringeRefillStation';
import { RoomLayout } from './RoomLayout';

export function RuangDosen() {
  return (
    <RoomLayout
      width={14}
      depth={10}
      height={3.4}
      floorColor="#9ca3af"
      wallColor="#e2e8f0"
      accentColor="#1e293b"
      lightColor="#f0f9ff"
    >
      {/* ── 3 Lecturer Desk Stations ── */}
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, 0, -1]}>
          <Desk position={[0, 0, 0]} />
          <Chair position={[0, 0, -0.6]} />
          {/* Monitor */}
          <mesh position={[0, 0.9, -0.15]}>
            <boxGeometry args={[0.5, 0.35, 0.04]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 0.73, -0.13]}>
            <boxGeometry args={[0.12, 0.04, 0.03]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        </group>
      ))}

      {/* ── Metal Filing Cabinets ── */}
      <group position={[-5.5, 1.2, 2]}>
        <mesh>
          <boxGeometry args={[0.8, 2.4, 2.0]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Cabinet drawer handles */}
        {[0.6, 0.0, -0.6].map((y, i) => (
          <mesh key={i} position={[0.41, y, 0]}>
            <boxGeometry args={[0.04, 0.05, 0.3]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        ))}
      </group>
      <group position={[5.5, 1.2, 2]}>
        <mesh>
          <boxGeometry args={[0.8, 2.4, 2.0]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
        </mesh>
        {[0.6, 0.0, -0.6].map((y, i) => (
          <mesh key={i} position={[-0.41, y, 0]}>
            <boxGeometry args={[0.04, 0.05, 0.3]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ── Notice Board (west wall) ── */}
      <group position={[-6.88, 2.0, -1]}>
        <mesh>
          <boxGeometry args={[0.04, 1.4, 2.5]} />
          <meshStandardMaterial color="#4ade80" roughness={0.9} />
        </mesh>
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.02, 1.45, 2.55]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Papers */}
        {[-0.6, 0.2].map((dz, i) => (
          <mesh key={i} position={[0.05, 0.1, dz]}>
            <boxGeometry args={[0.01, 0.5, 0.7]} />
            <meshStandardMaterial color="#fef9c3" />
          </mesh>
        ))}
      </group>

      {/* ── Window (east wall) ── */}
      <group position={[6.88, 1.8, 0]}>
        <mesh>
          <boxGeometry args={[0.05, 1.2, 2.0]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.5} emissive="#93c5fd" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.08, 0.08, 2.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, -0.62, 0]}><boxGeometry args={[0.08, 0.08, 2.05]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 0, 1.02]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#1e293b" /></mesh>
        <mesh position={[0, 0, -1.02]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#1e293b" /></mesh>
      </group>

      <ACUnit position={[0, 2.7, -4.7]} />

      {/* ── Syringe Refill Station ── */}
      <SyringeRefillStation position={[5.0, 0, -3.5]} />

      {/* ── Lecturer Zombie NPCs (Dosen Indi & Koh Willy) ── */}
      <Zombie id="zombie_dosen_indi" type="LECTURER" initialPosition={[-3, 0, -0.5]} room="ruang_dosen" nameLabel="Dosen Indi" />
      <Zombie id="zombie_dosen_willy" type="KOH_WILLY" initialPosition={[3, 0, -0.5]} room="ruang_dosen" nameLabel="Koh Willy" />

      {/* ── Exit Door (East Wall z=3) ── */}
      <Door position={[5.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
