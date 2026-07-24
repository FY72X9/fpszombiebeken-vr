
import { Door } from '../props/Door';
import { Desk, Chair, Sofa, ACUnit } from '../props/Furniture';
import { BuildingFacade } from '../BuildingFacade';
import { RoomLayout } from './RoomLayout';

export function LobbyLantai1() {
  return (
    <group position={[0, 0, 0]}>
      <BuildingFacade />

      <RoomLayout
        width={16}
        depth={16}
        height={3.6}
        floorColor="#e2e8f0"
        wallColor="#f1f5f9"
        accentColor="#1e3a5f"
        lightColor="#fffde7"
      >
        {/* ── BINUS Bekasi Signage Banner (North Wall) ── */}
        <group position={[0, 2.6, -7.8]}>
          {/* Dark backing panel */}
          <mesh>
            <boxGeometry args={[7, 0.8, 0.08]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Red accent stripe */}
          <mesh position={[0, 0.45, 0.04]}>
            <boxGeometry args={[7, 0.06, 0.02]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Emissive BINUS logotype panel */}
          <mesh position={[0, 0.02, 0.05]}>
            <boxGeometry args={[5, 0.5, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* ── Info Desk ── */}
        <group position={[0, 0, -3]}>
          <Desk position={[0, 0, 0]} />
          <Chair position={[0, 0, -0.8]} rotation={[0, 0, 0]} />
          {/* Desk nameplate */}
          <mesh position={[0, 0.82, 0.3]}>
            <boxGeometry args={[0.8, 0.12, 0.02]} />
            <meshStandardMaterial color="#1e40af" emissive="#1e40af" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* ── Sofas ── */}
        <Sofa position={[-4.5, 0, -1.5]} rotation={[0, Math.PI / 2, 0]} />
        <Sofa position={[4.5, 0, -1.5]} rotation={[0, -Math.PI / 2, 0]} />

        {/* ── Coffee Table between sofas ── */}
        <mesh position={[0, 0.3, -1.5]}>
          <boxGeometry args={[1.4, 0.06, 0.7]} />
          <meshStandardMaterial color="#44403c" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* ── AC Unit ── */}
        <ACUnit position={[0, 2.9, -7.8]} />

        {/* ── East Wall: Large Windows ── */}
        {[-3.5, 0, 3.5].map((z, i) => (
          <group key={`ewin${i}`} position={[7.85, 1.8, z]}>
            <mesh>
              <boxGeometry args={[0.05, 1.4, 1.8]} />
              <meshStandardMaterial color="#bfdbfe" transparent opacity={0.55} emissive="#93c5fd" emissiveIntensity={0.15} />
            </mesh>
            {/* Window frame */}
            <mesh position={[0, 0, 0.9]}>
              <boxGeometry args={[0.08, 1.45, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0, -0.9]}>
              <boxGeometry args={[0.08, 1.45, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[0.08, 0.08, 1.8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, -0.72, 0]}>
              <boxGeometry args={[0.08, 0.08, 1.8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
        ))}

        {/* ── West Wall: Bulletin Board ── */}
        <group position={[-7.7, 1.8, 0]}>
          <mesh>
            <boxGeometry args={[0.05, 1.6, 3.0]} />
            <meshStandardMaterial color="#4ade80" roughness={0.9} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.02, 1.65, 3.05]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        {/* ── Hanging Pendant Lights above desk ── */}
        {[-1.2, 0, 1.2].map((x, i) => (
          <group key={`pend${i}`} position={[x, 3.4, -3]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.18, 0.35, 12]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.2} />
            </mesh>
            <pointLight intensity={0.8} color="#fef08a" distance={4} decay={2} />
          </group>
        ))}

        {/* ── Floor Entrance Mat ── */}
        <mesh position={[0, -0.02, 4.5]}>
          <boxGeometry args={[3.5, 0.03, 1.8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.95} />
        </mesh>

        {/* ── Doors ── */}
        <Door position={[-7.9, 0, -3]} rotationY={Math.PI / 2} targetRoom="kelas_1a" label="Kelas 1A" />
        <Door position={[7.9, 0, -3]} rotationY={-Math.PI / 2} targetRoom="kelas_1b" label="Kelas 1B" />
        <Door position={[-7.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="ruang_direktur" label="Ruang Direktur" />
        <Door position={[7.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="ruang_dosen" label="Ruang Dosen" />
        <Door position={[0, 0, -7.9]} rotationY={0} targetRoom="stairs_l1_to_l2" label="Tangga Lt 2" />
      </RoomLayout>
    </group>
  );
}
