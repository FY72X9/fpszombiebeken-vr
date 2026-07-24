import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard, ACUnit } from '../props/Furniture';
import { RoomLayout } from './RoomLayout';

export function Kelas2B() {
  return (
    <RoomLayout
      width={12}
      depth={12}
      height={3.4}
      floorColor="#d1d5db"
      wallColor="#f3f4f6"
      accentColor="#475569"
      lightColor="#f8fafc"
    >
      <Whiteboard position={[0, 0, -5.8]} />
      <ACUnit position={[0, 2.7, -5.7]} />

      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      {/* Class 2B Signboard */}
      <mesh position={[-5.0, 2.8, -3]}>
        <boxGeometry args={[1.2, 0.3, 0.04]} />
        <meshStandardMaterial color="#475569" emissive="#475569" emissiveIntensity={0.3} />
      </mesh>

      {/* Door to Koridor Lt 2 (West Wall z=-3) */}
      <Door position={[-5.9, 0, -3]} rotationY={Math.PI / 2} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}

export function Kelas2C() {
  return (
    <RoomLayout
      width={12}
      depth={12}
      height={3.4}
      floorColor="#bbf7d0"
      wallColor="#f0fdf4"
      accentColor="#166534"
      lightColor="#dcfce7"
    >
      <Whiteboard position={[0, 0, -5.8]} />
      <ACUnit position={[0, 2.7, -5.7]} />

      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <CelMaterial color="#16a34a" />
      </mesh>

      {/* Class 2C Signboard */}
      <mesh position={[5.0, 2.8, 3]}>
        <boxGeometry args={[1.2, 0.3, 0.04]} />
        <meshStandardMaterial color="#166534" emissive="#166534" emissiveIntensity={0.4} />
      </mesh>

      {/* Door to Koridor Lt 2 (East Wall z=3) */}
      <Door position={[5.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}
