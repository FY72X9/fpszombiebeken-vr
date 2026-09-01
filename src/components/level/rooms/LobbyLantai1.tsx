
import { Door } from '../props/Door';
import { EvacuationExitDoor } from '../props/EvacuationExitDoor';
import { BinusLogoSign } from '../props/BinusLogoSign';
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
        {/* ── BINUS Bekasi Reception Signage Plaque (North Wall) ── */}
        <BinusLogoSign
          position={[0, 2.6, -7.85]}
          height={1.35}
          showFrame={true}
          showTextBanner={true}
          title="BINUS UNIVERSITY"
          subtitle="School of Information Systems • Bekasi Campus"
          logoPath="/assets/logo/BU-SIS-YellowDot.png"
        />

        {/* ── BINUS School of Information System Plaque (West Wall) ── */}
        <BinusLogoSign
          position={[-7.85, 2.4, 0]}
          rotation={[0, Math.PI / 2, 0]}
          height={1.3}
          showFrame={true}
          showTextBanner={true}
          title="SCHOOL OF IS"
          subtitle="Empowering Society • BINUS Bekasi"
          logoPath="/assets/logo/BU-School-of-Information-System--Satuan.png"
        />

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

        {/* ── East Wall: Single Centered Window between Doors (z=0) ── */}
        <group position={[7.85, 1.8, 0]}>
          <mesh>
            <boxGeometry args={[0.05, 1.4, 2.0]} />
            <meshStandardMaterial color="#bfdbfe" transparent opacity={0.55} emissive="#93c5fd" emissiveIntensity={0.15} />
          </mesh>
          {/* Window frame */}
          <mesh position={[0, 0, 1.0]}>
            <boxGeometry args={[0.08, 1.45, 0.08]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0, -1.0]}>
            <boxGeometry args={[0.08, 1.45, 0.08]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.08, 0.08, 2.0]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, -0.72, 0]}>
            <boxGeometry args={[0.08, 0.08, 2.0]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>

        {/* ── South Wall: Campus Facade Windows Flanking Main Entrance ── */}
        {[-4.5, 4.5].map((x, i) => (
          <group key={`swin${i}`} position={[x, 1.8, 7.85]}>
            <mesh>
              <boxGeometry args={[2.2, 1.4, 0.05]} />
              <meshStandardMaterial color="#bfdbfe" transparent opacity={0.55} emissive="#93c5fd" emissiveIntensity={0.15} />
            </mesh>
            {/* Window frame */}
            <mesh position={[1.1, 0, 0]}>
              <boxGeometry args={[0.08, 1.45, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[-1.1, 0, 0]}>
              <boxGeometry args={[0.08, 1.45, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.72, 0]}>
              <boxGeometry args={[2.2, 0.08, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, -0.72, 0]}>
              <boxGeometry args={[2.2, 0.08, 0.08]} />
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
        <mesh position={[0, 0.005, 4.5]}>
          <boxGeometry args={[3.5, 0.01, 1.8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.95} />
        </mesh>


        {/* ── Doors ── */}
        <Door position={[-7.9, 0, -3]} rotationY={Math.PI / 2} targetRoom="kelas_1a" label="Kelas 1A" />
        <Door position={[7.9, 0, -3]} rotationY={-Math.PI / 2} targetRoom="kelas_1b" label="Kelas 1B" />
        <Door position={[-7.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="ruang_dosen" label="Ruang Dosen" />
        <Door position={[7.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="ruang_direktur" label="Ruang Direktur" />
        <Door position={[0, 0, -7.9]} rotationY={0} targetRoom="stairs_l1_to_l2" label="Tangga Lt 2" />

        {/* ── MAIN EVACUATION EXIT DOOR (South Wall) ── */}
        <EvacuationExitDoor position={[0, 0, 7.9]} rotationY={Math.PI} />
      </RoomLayout>
    </group>
  );
}
