import { CelMaterial } from '../../shaders/CelMaterial';

export function EnvironmentBackdrop() {
  return (
    <group position={[0, 0, 0]}>
      {/* Sky Dome */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[120, 32, 16]} />
        <meshBasicMaterial color="#38bdf8" side={2} />
      </mesh>

      {/* Exterior Sun / Horizon Light */}
      <directionalLight position={[30, 40, 20]} intensity={1.2} color="#fef08a" castShadow />
      <ambientLight intensity={0.5} color="#e0f2fe" />

      {/* Exterior Campus Grounds / Lawn */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[200, 0.2, 200]} />
        <CelMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Outdoor Trees & Vegetation around Campus */}
      {[-25, -15, 15, 25].map((x) =>
        [-25, 25].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 4]} />
              <CelMaterial color="#78350f" />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 5, 0]}>
              <coneGeometry args={[2.5, 5, 8]} />
              <CelMaterial color="#16a34a" />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}
