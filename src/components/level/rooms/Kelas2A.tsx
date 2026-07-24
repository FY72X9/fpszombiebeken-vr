import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard, ACUnit } from '../props/Furniture';
import { NusaNPC } from '../../npc/NusaNPC';
import { RoomLayout } from './RoomLayout';

export function Kelas2A() {
  return (
    <RoomLayout
      width={12}
      depth={12}
      height={3.4}
      floorColor="#fef08a"
      wallColor="#fffbeb"
      accentColor="#b45309"
      lightColor="#fef9c3"
    >
      <Whiteboard position={[0, 0, -5.8]} />

      {/* Projector Screen */}
      <mesh position={[0, 2.8, -5.82]}>
        <boxGeometry args={[4.0, 1.2, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>

      <ACUnit position={[0, 2.7, -5.7]} />

      {/* Class Desks */}
      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Hiding spot barricade near Nusa */}
      <group position={[-2.5, 0, -2.2]}>
        <mesh position={[0, 0.4, 0]} rotation={[0, 0.3, 0.2]}>
          <boxGeometry args={[1.4, 0.8, 0.7]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
      </group>

      {/* Notice Board */}
      <group position={[5.82, 1.8, 1]}>
        <mesh>
          <boxGeometry args={[0.04, 1.2, 1.8]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.02, 1.25, 1.85]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Class 2A Signboard */}
      <mesh position={[0, 2.8, 5.8]}>
        <boxGeometry args={[1.2, 0.3, 0.04]} />
        <meshStandardMaterial color="#d97706" emissive="#d97706" emissiveIntensity={0.4} />
      </mesh>

      {/* Nusa NPC Hiding Spot */}
      <NusaNPC position={[-2, 0, -2]} />

      <Door position={[0, 0, 5.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}
