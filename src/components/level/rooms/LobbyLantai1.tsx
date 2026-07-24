import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Sofa, ACUnit } from '../props/Furniture';
import { BuildingFacade } from '../BuildingFacade';
import { RoomLayout } from './RoomLayout';

export function LobbyLantai1() {
  return (
    <group position={[0, 0, 0]}>
      <BuildingFacade />

      <RoomLayout width={16} depth={16} floorColor="#e2e8f0" wallColor="#f1f5f9">
        {/* Info Desk */}
        <group position={[0, 0, -4]}>
          <Desk position={[0, 0, 0]} />
          <Chair position={[0, 0, -0.8]} rotation={[0, 0, 0]} />
        </group>

        {/* Sofas */}
        <Sofa position={[-5, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
        <Sofa position={[5, 0, -2]} rotation={[0, -Math.PI / 2, 0]} />

        <ACUnit position={[0, 2.8, -7.8]} />

        <mesh position={[0, 2.4, -7.8]}>
          <boxGeometry args={[5, 0.5, 0.05]} />
          <CelMaterial color="#1e3a8a" />
        </mesh>

        <Door position={[-7.9, 0, -3]} rotationY={Math.PI / 2} targetRoom="kelas_1a" label="Kelas 1A" />
        <Door position={[7.9, 0, -3]} rotationY={-Math.PI / 2} targetRoom="kelas_1b" label="Kelas 1B" />
        <Door position={[-7.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="ruang_direktur" label="Ruang Direktur" />
        <Door position={[7.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="ruang_dosen" label="Ruang Dosen" />
        <Door position={[0, 0, -7.9]} rotationY={0} targetRoom="stairs_l1_to_l2" label="Tangga Lt 2" />
      </RoomLayout>
    </group>
  );
}
