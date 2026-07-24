import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useGameStore } from '../../stores/GameStore';
import { PLAYER_CONFIG } from '../../constants/gameConfig';

export function PlayerController() {
  const { camera, gl } = useThree();
  const isPresenting = useXR((state) => state.isPresenting);
  const playerState = useGameStore();
  const controlsRef = useRef<any>(null);
  
 useEffect(() => {
    if (!isPresenting && controlsRef.current) {
      controlsRef.current.lock();
    }
  }, [isPresenting]);

  useFrame((state, delta) => {
    if (isPresenting) {
      // VR-controlled camera (managed by @react-three/xr)
      const c = state.camera;
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          position: [c.position.x, c.position.y, c.position.z] as [number, number, number],
          rotation: [c.rotation.x, c.rotation.y, c.rotation.z] as [number, number, number]
        }
      });
    } else {
      // Desktop controls handled via PointerLockControls
      const c = state.camera;
      useGameStore.setState({
        player: {
          ...useGameStore.getState().player,
          position: [c.position.x, c.position.y, c.position.z] as [number, number, number],
          rotation: [c.rotation.x, c.rotation.y, c.rotation.z] as [number, number, number]
        }
      });
    }
  });

  return (
    <>
      <PointerLockControls 
        ref={controlsRef} 
        args={[camera, gl.domElement]}
        makeDefault={!isPresenting}
      />
    </>
  );
}