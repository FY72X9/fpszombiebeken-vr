import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface CelMaterialProps {
  color?: string | THREE.Color;
  roughness?: number;
  metalness?: number;
  rimColor?: string | THREE.Color;
  rimPower?: number;
  wireframe?: boolean;
}

export function CelMaterial({
  color = '#4a7c59',
  roughness = 0.5,
  metalness = 0.1,
  rimColor = '#80c0ff',
  rimPower = 3.0,
  wireframe = false,
}: CelMaterialProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const customColor = useMemo(() => new THREE.Color(color), [color]);
  const customRimColor = useMemo(() => new THREE.Color(rimColor), [rimColor]);

  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uRimColor = { value: customRimColor };
    shader.uniforms.uRimPower = { value: rimPower };

    shader.fragmentShader = `
      uniform vec3 uRimColor;
      uniform float uRimPower;
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>
      
      // Calculate lighting intensity from main directional light
      #if NUM_DIR_LIGHTS > 0
        vec3 dirLightDir = normalize(directionalLights[0].direction);
        float intensity = max(dot(normalize(vNormal), dirLightDir), 0.0);
        
        // Quantize into 4 cel shading bands
        float cel = 0.15;
        if (intensity > 0.8) cel = 1.0;
        else if (intensity > 0.5) cel = 0.75;
        else if (intensity > 0.25) cel = 0.45;
        
        gl_FragColor.rgb *= vec3(cel);
      #endif
      
      // Calculate anime rim lighting
      vec3 viewDir = normalize(vViewPosition);
      float rim = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
      rim = pow(rim, uRimPower);
      gl_FragColor.rgb += uRimColor * rim * 0.4;
      `.trim()
    );
  };

  return (
    <meshStandardMaterial
      ref={matRef}
      color={customColor}
      roughness={roughness}
      metalness={metalness}
      wireframe={wireframe}
      onBeforeCompile={onBeforeCompile}
    />
  );
}
