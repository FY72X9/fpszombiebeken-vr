import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { RoomLayout } from './RoomLayout';

export function Kelas1A() {
  return (
    <RoomLayout
      width={12}
      depth={12}
      height={3.4}
      floorColor="#d1fae5"
      wallColor="#f0fdf4"
      accentColor="#14532d"
      lightColor="#d1fae5"
    >
      {/* Whiteboard & projector screen at north wall */}
      <Whiteboard position={[0, 0, -5.8]} />
      {/* Projector screen above whiteboard */}
      <mesh position={[0, 2.8, -5.82]}>
        <boxGeometry args={[4.0, 1.2, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
      <mesh position={[0, 3.3, -5.82]}>
        <boxGeometry args={[0.06, 0.5, 0.04]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <ACUnit position={[0, 2.7, -5.7]} />

      {/* Class desks & chairs */}
      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Notice/Bulletin board on east wall */}
      <group position={[5.82, 1.8, 2]}>
        <mesh>
          <boxGeometry args={[0.04, 1.2, 1.8]} />
          <meshStandardMaterial color="#65a30d" roughness={0.9} />
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.02, 1.25, 1.85]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Paper notices */}
        {[-0.4, 0.3].map((dz, i) => (
          <mesh key={i} position={[0.04, 0.2 * (i - 0.5), dz]}>
            <boxGeometry args={[0.01, 0.35, 0.5]} />
            <meshStandardMaterial color="#fef9c3" />
          </mesh>
        ))}
      </group>

      {/* Window on west wall */}
      <group position={[-5.85, 1.8, -1]}>
        <mesh>
          <boxGeometry args={[0.05, 1.2, 1.6]} />
          <meshStandardMaterial color="#bfdbfe" transparent opacity={0.5} emissive="#93c5fd" emissiveIntensity={0.2} />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 0.62, 0]}><boxGeometry args={[0.08, 0.08, 1.65]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, -0.62, 0]}><boxGeometry args={[0.08, 0.08, 1.65]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, 0, 0.82]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, 0, -0.82]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
      </group>

      {/* Class number sign above door */}
      <mesh position={[5.0, 2.8, 3]}>
        <boxGeometry args={[0.8, 0.3, 0.04]} />
        <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.4} />
      </mesh>

      {/* Zombie in class */}
      <Zombie id="zombie_student_1a" type="STUDENT" initialPosition={[2, 0, 0]} room="kelas_1a" nameLabel="Zombie Student 1" />

      <Door position={[5.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
