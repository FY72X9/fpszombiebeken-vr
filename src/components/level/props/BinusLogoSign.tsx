import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BinusLogoSignProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  height?: number; // Target height in meters (default 1.3)
  showFrame?: boolean;
  frameColor?: string;
  showTextBanner?: boolean;
  title?: string;
  subtitle?: string;
  logoPath?: string;
}

export function BinusLogoSign({
  position,
  rotation = [0, 0, 0],
  height = 1.3,
  showFrame = true,
  frameColor = '#0f172a',
  showTextBanner = false,
  title = 'BINUS UNIVERSITY',
  subtitle = 'School of Information Systems',
  logoPath = '/assets/logo/BU-SIS-YellowDot.png'
}: BinusLogoSignProps) {
  const texture = useTexture(logoPath);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Exact natural aspect ratio for A4 portrait logos: 1785 / 2526 ~= 0.7067
  const logoAspect = 0.7067;
  const logoHeight = height * 0.82;
  const logoWidth = logoHeight * logoAspect;

  const frameWidth = showTextBanner ? logoWidth + 2.8 : logoWidth + 0.35;
  const frameHeight = height;
  const logoXOffset = showTextBanner ? -(frameWidth / 2) + (logoWidth / 2) + 0.22 : 0;

  return (
    <group position={position} rotation={rotation}>
      {showFrame && (
        <>
          {/* Main Acrylic/Metallic Plaque Board */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[frameWidth, frameHeight, 0.04]} />
            <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.2} />
          </mesh>

          {/* White inner canvas card for maximum logo clarity & contrast */}
          <mesh position={[logoXOffset, 0, 0.022]}>
            <planeGeometry args={[logoWidth + 0.12, logoHeight + 0.12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Metallic Top & Bottom Frame Border Trim */}
          <mesh position={[0, frameHeight / 2, 0.024]}>
            <boxGeometry args={[frameWidth + 0.02, 0.025, 0.02]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -frameHeight / 2, 0.024]}>
            <boxGeometry args={[frameWidth + 0.02, 0.025, 0.02]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* 4 Chrome Standoff Corner Bolts */}
          {[
            [-frameWidth / 2 + 0.06, frameHeight / 2 - 0.06],
            [frameWidth / 2 - 0.06, frameHeight / 2 - 0.06],
            [-frameWidth / 2 + 0.06, -frameHeight / 2 + 0.06],
            [frameWidth / 2 - 0.06, -frameHeight / 2 + 0.06]
          ].map(([bx, by], i) => (
            <mesh key={i} position={[bx, by, 0.026]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </>
      )}

      {/* Proportional, High-Fidelity Logo Plane */}
      <mesh position={[logoXOffset, 0, 0.025]}>
        <planeGeometry args={[logoWidth, logoHeight]} />
        <meshStandardMaterial
          map={texture}
          transparent={true}
          roughness={0.2}
          metalness={0.05}
        />
      </mesh>

      {/* Optional Architectural Typography on Plaque */}
      {showTextBanner && (
        <group position={[logoXOffset + logoWidth / 2 + 0.25, 0, 0.026]}>
          <Text
            position={[0, 0.16, 0]}
            fontSize={0.22}
            color="#f8fafc"
            anchorX="left"
            anchorY="middle"
          >
            {title}
          </Text>
          <Text
            position={[0, -0.12, 0]}
            fontSize={0.13}
            color="#38bdf8"
            anchorX="left"
            anchorY="middle"
          >
            {subtitle}
          </Text>
        </group>
      )}
    </group>
  );
}
