import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';

export function Stairs() {
  return (
    <group position={[0, 0, 0]}>
      {/* Staircase Steps */}
      {[0, 1, 2, 3, 4, 5, 6].map((step) => (
        <mesh key={step} position={[0, step * 0.25, -step * 0.4]}>
          <boxGeometry args={[3, 0.25, 0.4]} />
          <CelMaterial color="#64748b" />
        </mesh>
      ))}

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.5, -1]} intensity={0.6} color="#fef08a" />

      <Door position={[0, 0, 2]} rotationY={0} targetRoom="lobby_l1" label="Lobby Lt 1" />
      <Door position={[0, 1.75, -2.8]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </group>
  );
}

export function KoridorLantai2() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[14, 0.1, 4]} />
        <CelMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[14, 0.1, 4]} />
        <CelMaterial color="#64748b" />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.8, 0]} intensity={0.5} color="#e0e7ff" />

      {/* Classroom Doors on 2nd Floor */}
      <Door position={[-4, 0, -1.9]} rotationY={0} targetRoom="kelas_2a" label="Kelas 2A (Target Nusa)" />
      <Door position={[0, 0, -1.9]} rotationY={0} targetRoom="kelas_2b" label="Kelas 2B" />
      <Door position={[4, 0, -1.9]} rotationY={0} targetRoom="kelas_2c" label="Kelas 2C (Cache)" />
      <Door position={[0, 0, 1.9]} rotationY={Math.PI} targetRoom="stairs_l1_to_l2" label="Tangga ke Lt 1" />
    </group>
  );
}
