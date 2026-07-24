import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair } from '../props/Furniture';
import { RoomLayout } from './RoomLayout';

export function RuangDosen() {
  return (
    <RoomLayout width={14} depth={10} floorColor="#9ca3af" wallColor="#e2e8f0">
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, 0, -1]}>
          <Desk position={[0, 0, 0]} />
          <Chair position={[0, 0, -0.6]} />
        </group>
      ))}

      <mesh position={[-5.5, 1.2, 2]}>
        <boxGeometry args={[0.8, 2.4, 2.0]} />
        <CelMaterial color="#475569" metalness={0.6} />
      </mesh>

      <Door position={[-6.9, 0, 2]} rotationY={Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
