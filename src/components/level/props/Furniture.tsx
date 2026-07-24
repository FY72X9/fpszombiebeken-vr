import { CelMaterial } from '../../../shaders/CelMaterial';

export function Desk({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Top */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.7]} />
        <CelMaterial color="#b45309" roughness={0.4} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.6, 0.35, -0.3]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <CelMaterial color="#374151" />
      </mesh>
      <mesh position={[0.6, 0.35, -0.3]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <CelMaterial color="#374151" />
      </mesh>
      <mesh position={[-0.6, 0.35, 0.3]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <CelMaterial color="#374151" />
      </mesh>
      <mesh position={[0.6, 0.35, 0.3]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <CelMaterial color="#374151" />
      </mesh>
    </group>
  );
}

export function Chair({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.45, 0.05, 0.45]} />
        <CelMaterial color="#3b82f6" />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.2]}>
        <boxGeometry args={[0.45, 0.4, 0.04]} />
        <CelMaterial color="#1d4ed8" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, 0.2, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <CelMaterial color="#9ca3af" metalness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.2, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <CelMaterial color="#9ca3af" metalness={0.7} />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <CelMaterial color="#9ca3af" metalness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.2, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <CelMaterial color="#9ca3af" metalness={0.7} />
      </mesh>
    </group>
  );
}

export function Whiteboard({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Board */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.8, 1.4, 0.04]} />
        <CelMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.84, 1.44, 0.02]} />
        <CelMaterial color="#64748b" metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Sofa({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Cushion */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.35, 0.8]} />
        <CelMaterial color="#dc2626" />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.75, -0.3]}>
        <boxGeometry args={[1.8, 0.5, 0.2]} />
        <CelMaterial color="#991b1b" />
      </mesh>
    </group>
  );
}
