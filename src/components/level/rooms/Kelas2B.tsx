import { CelMaterial } from '../../../shaders/CelMaterial';
import { Door } from '../props/Door';
import { Desk, Chair, Whiteboard } from '../props/Furniture';

export function Kelas2B() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#d1d5db" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#9ca3af" />
      </mesh>

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2.8, 0]} intensity={0.6} color="#fef08a" />

      <Whiteboard position={[0, 0, -4.8]} />

      {[-2, 2].map((x) =>
        [-2, 0, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <Desk position={[0, 0, 0]} />
            <Chair position={[0, 0, -0.6]} />
          </group>
        ))
      )}

      <Door position={[0, 0, 4.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </group>
  );
}

export function Kelas2C() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <CelMaterial color="#bbf7d0" />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[0, 2.8, 0]} intensity={0.8} color="#86efac" />

      <Whiteboard position={[0, 0, -4.8]} />

      {/* Antidote Cache Box in center */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <CelMaterial color="#16a34a" rimColor="#4ade80" />
      </mesh>

      <Door position={[0, 0, 4.9]} rotationY={Math.PI} targetRoom="koridor_l2" label="Koridor Lt 2" />
    </group>
  );
}
