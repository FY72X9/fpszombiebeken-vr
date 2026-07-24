import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Sofa, ACUnit } from '../props/Furniture';
import { Zombie } from '../../enemy/Zombie';
import { RoomLayout } from './RoomLayout';

export function RuangDirektur() {
  return (
    <RoomLayout width={12} depth={10} floorColor="#78350f" wallColor="#fef3c7">
      {/* Executive Desk & Chair */}
      <group position={[0, 0, -2]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, -0.7]} />
      </group>

      {/* Director Lounge Sofas */}
      <Sofa position={[-3, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
      <Sofa position={[3, 0, 1]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Bookshelf / Credenza */}
      <mesh position={[0, 1.4, -4.7]}>
        <boxGeometry args={[3.2, 2.6, 0.4]} />
        <CelMaterial color="#451a03" />
      </mesh>

      <ACUnit position={[0, 2.7, -4.7]} />

      {/* Director Nameplate */}
      <mesh position={[0, 2.0, -4.7]}>
        <boxGeometry args={[2.0, 0.4, 0.05]} />
        <CelMaterial color="#b45309" />
      </mesh>

      {/* Boss Willy Zombie Spawn */}
      <Zombie id="zombie_boss_willy" type="BOSS_WILLY" initialPosition={[0, 0, -1]} room="ruang_direktur" nameLabel="Boss Willy" />

      {/* Exit Door to Lobby */}
      <Door position={[5.9, 0, 2]} rotationY={-Math.PI / 2} targetRoom="lobby_l1" label="Lobby Lt 1" />
    </RoomLayout>
  );
}
