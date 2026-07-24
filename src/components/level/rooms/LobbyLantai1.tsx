import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Sofa } from '../props/Furniture';

export function LobbyLantai1() {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[16, 0.1, 16]} />
        <CelMaterial color="#e2e8f0" roughness={0.2} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[16, 0.1, 16]} />
        <CelMaterial color="#94a3b8" />
      </mesh>

      {/* Walls */}
      {/* Back Wall */}
      <mesh position={[0, 1.75, -8]}>
        <boxGeometry args={[16, 3.5, 0.2]} />
        <CelMaterial color="#f1f5f9" />
      </mesh>
      {/* Front Wall (Entrance Gate) */}
      <mesh position={[-4, 1.75, 8]}>
        <boxGeometry args={[8, 3.5, 0.2]} />
        <CelMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[4, 1.75, 8]}>
        <boxGeometry args={[8, 3.5, 0.2]} />
        <CelMaterial color="#cbd5e1" />
      </mesh>

      {/* Ambient Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#fed7aa" />

      {/* Information Desk */}
      <group position={[0, 0, -4]}>
        <Desk position={[0, 0, 0]} />
        <Chair position={[0, 0, -0.8]} rotation={[0, 0, 0]} />
      </group>

      {/* Waiting Benches / Sofas */}
      <Sofa position={[-5, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
      <Sofa position={[5, 0, -2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Campus Banner Title */}
      <mesh position={[0, 2.8, -7.8]}>
        <boxGeometry args={[5, 0.8, 0.05]} />
        <CelMaterial color="#1e3a8a" />
      </mesh>

      {/* Doors connecting to other rooms */}
      <Door position={[-7.9, 0, -3]} rotationY={Math.PI / 2} targetRoom="kelas_1a" label="Kelas 1A" />
      <Door position={[7.9, 0, -3]} rotationY={-Math.PI / 2} targetRoom="kelas_1b" label="Kelas 1B" />
      <Door position={[-7.9, 0, 3]} rotationY={Math.PI / 2} targetRoom="ruang_direktur" label="Ruang Direktur" />
      <Door position={[7.9, 0, 3]} rotationY={-Math.PI / 2} targetRoom="ruang_dosen" label="Ruang Dosen" />
      <Door position={[0, 0, -7.9]} rotationY={0} targetRoom="stairs_l1_to_l2" label="Tangga Lt 2" />
    </group>
  );
}
