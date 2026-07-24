import { CelMaterial } from '../../../shaders/CelMaterial';

export function Desk({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Desk Top */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.7]} />
        <CelMaterial color="#b45309" roughness={0.4} />
      </mesh>
      {/* Metal Legs */}
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

      {/* Desktop Computer Monitor */}
      <group position={[0, 0.79, -0.1]}>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.55, 0.35, 0.04]} />
          <CelMaterial color="#0f172a" />
        </mesh>
        {/* Glowing Screen */}
        <mesh position={[0, 0.22, 0.022]}>
          <boxGeometry args={[0.5, 0.3, 0.01]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Stand */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.15, 0.1, 0.15]} />
          <CelMaterial color="#334155" />
        </mesh>
      </group>

      {/* Keyboard */}
      <mesh position={[0, 0.8, 0.15]}>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <CelMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

export function Chair({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.45, 0.05, 0.45]} />
        <CelMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 0.75, -0.2]}>
        <boxGeometry args={[0.45, 0.4, 0.04]} />
        <CelMaterial color="#1d4ed8" />
      </mesh>
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
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.8, 1.4, 0.04]} />
        <CelMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
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
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.35, 0.8]} />
        <CelMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0.75, -0.3]}>
        <boxGeometry args={[1.8, 0.5, 0.2]} />
        <CelMaterial color="#991b1b" />
      </mesh>
    </group>
  );
}

export function ACUnit({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.2, 0.35, 0.3]} />
        <CelMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, -0.12, 0.12]}>
        <boxGeometry args={[1.0, 0.04, 0.05]} />
        <CelMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}
