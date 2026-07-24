
import { Door } from '../props/Door';
import { Desk, Chair, Sofa, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { RoomLayout } from './RoomLayout';

export function RuangDirektur() {
  return (
    <RoomLayout
      width={12}
      depth={10}
      height={3.4}
      floorColor="#78350f"
      wallColor="#fef3c7"
      accentColor="#451a03"
      lightColor="#fef08a"
    >
      {/* ── Premium wood panel accent behind director desk ── */}
      <group position={[0, 1.7, -4.88]}>
        {/* Main panel */}
        <mesh>
          <boxGeometry args={[8.0, 3.4, 0.1]} />
          <meshStandardMaterial color="#451a03" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Vertical panel dividers */}
        {[-3, -1, 1, 3].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.06]}>
            <boxGeometry args={[0.06, 3.4, 0.04]} />
            <meshStandardMaterial color="#78350f" roughness={0.2} metalness={0.3} />
          </mesh>
        ))}
        {/* Horizontal rail at dado height */}
        <mesh position={[0, -0.5, 0.06]}>
          <boxGeometry args={[8.1, 0.08, 0.04]} />
          <meshStandardMaterial color="#92400e" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Framed certificates */}
        {[-2.5, 0, 2.5].map((x, i) => (
          <group key={`cert${i}`} position={[x, 0.3, 0.08]}>
            <mesh>
              <boxGeometry args={[1.2, 0.9, 0.02]} />
              <meshStandardMaterial color="#fef3c7" />
            </mesh>
            <mesh position={[0, 0, 0.012]}>
              <boxGeometry args={[1.3, 1.0, 0.01]} />
              <meshStandardMaterial color="#7c3aed" roughness={0.2} metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Executive Desk & Chair ── */}
      <group position={[0, 0, -1.5]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, -0.7]} />
        {/* Desk lamp */}
        <group position={[0.8, 0.78, 0.1]}>
          <mesh rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0.1]}>
            <coneGeometry args={[0.15, 0.22, 12]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
          <pointLight position={[0, 0.25, 0.15]} intensity={0.6} color="#fef08a" distance={3} />
        </group>
      </group>

      {/* ── Lounge Sofas ── */}
      <Sofa position={[-3, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} />
      <Sofa position={[3, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── Floor Rug ── */}
      <mesh position={[0, -0.02, 0.5]}>
        <boxGeometry args={[5.0, 0.03, 3.5]} />
        <meshStandardMaterial color="#991b1b" roughness={0.95} />
      </mesh>
      {/* Rug border */}
      <mesh position={[0, -0.015, 0.5]}>
        <boxGeometry args={[5.3, 0.025, 3.8]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.95} />
      </mesh>

      <ACUnit position={[0, 2.7, -4.7]} />

      {/* ── Side Windows ── */}
      <group position={[-5.85, 1.8, 0]}>
        <mesh>
          <boxGeometry args={[0.05, 1.2, 2.0]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45} emissive="#93c5fd" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.08, 0.08, 2.05]} /><meshStandardMaterial color="#451a03" /></mesh>
        <mesh position={[0, -0.62, 0]}><boxGeometry args={[0.08, 0.08, 2.05]} /><meshStandardMaterial color="#451a03" /></mesh>
        <mesh position={[0, 0, 1.02]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#451a03" /></mesh>
        <mesh position={[0, 0, -1.02]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#451a03" /></mesh>
      </group>

      {/* ── Boss Willy Zombie ── */}
      <Zombie id="zombie_boss_willy" type="BOSS_WILLY" initialPosition={[0, 0, -1]} room="ruang_direktur" nameLabel="Boss Willy" />

      {/* ── Exit Door ── */}
      <Door position={[5.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
