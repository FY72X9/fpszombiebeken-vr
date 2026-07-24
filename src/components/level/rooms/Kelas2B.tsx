import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard } from '../props/Furniture';
import { RoomLayout } from './RoomLayout';

export function Kelas2B() {
  return (
    <RoomLayout width={12} depth={12} floorColor="#d1d5db" wallColor="#f3f4f6">
      <Whiteboard position={[0, 0, -5.8]} />

      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      <Door position={[0, 0, 5.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}

export function Kelas2C() {
  return (
    <RoomLayout width={12} depth={12} floorColor="#bbf7d0" wallColor="#f0fdf4">
      <Whiteboard position={[0, 0, -5.8]} />

      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <CelMaterial color="#16a34a" rimColor="#4ade80" />
      </mesh>

      <Door position={[0, 0, 5.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </RoomLayout>
  );
}
