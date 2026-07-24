import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { RoomLayout } from './RoomLayout';

export function Kelas1B() {
  return (
    <RoomLayout
      width={12}
      depth={12}
      height={3.4}
      floorColor="#dbeafe"
      wallColor="#eff6ff"
      accentColor="#1e3a8a"
      lightColor="#dbeafe"
    >
      <Whiteboard position={[0, 0, -5.8]} />
      {/* Projector screen */}
      <mesh position={[0, 2.8, -5.82]}>
        <boxGeometry args={[4.0, 1.2, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>

      <ACUnit position={[0, 2.7, -5.7]} />

      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Notice board east wall */}
      <group position={[5.82, 1.8, -1]}>
        <mesh>
          <boxGeometry args={[0.04, 1.2, 1.8]} />
          <meshStandardMaterial color="#2563eb" roughness={0.9} />
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.02, 1.25, 1.85]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Window west wall */}
      <group position={[-5.85, 1.8, 1]}>
        <mesh>
          <boxGeometry args={[0.05, 1.2, 1.6]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.5} emissive="#93c5fd" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.08, 0.08, 1.65]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, -0.62, 0]}><boxGeometry args={[0.08, 0.08, 1.65]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, 0, 0.82]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, 0, -0.82]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
      </group>

      {/* Class sign */}
      <mesh position={[-4.6, 2.8, 3]}>
        <boxGeometry args={[0.8, 0.3, 0.04]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.4} />
      </mesh>

      <Zombie id="zombie_student_1b" type="STUDENT" initialPosition={[-2, 0, 0]} room="kelas_1b" nameLabel="Zombie Student 2" />

      <Door position={[-5.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
