import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface BinusLogoSignProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, 1];
}

export function BinusLogoSign({ position, rotation = [0, 0, 0], scale = [2.4, 0.8, 1] }: BinusLogoSignProps) {
  const texture = useTexture('/assets/logo/BU-SIS-YellowDot.png');
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.1}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}
