import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { PLAYER_CONFIG } from '../../constants/gameConfig';
import { emitNoise } from '../../systems/NoiseSystem';

export function PlayerController() {
  const { camera, gl } = useThree();
  const session = useXR((state) => state.session);
  const isPresenting = !!session;
  const controlsRef = useRef<any>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        useGameStore.getState().setPlayerSprint(true);
      }
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        useGameStore.getState().setPlayerCrouch(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        useGameStore.getState().setPlayerSprint(false);
      }
      if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        useGameStore.getState().setPlayerCrouch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing') return;

    if (isPresenting) {
      const c = camera;
      useGameStore.setState((s) => ({
        player: {
          ...s.player,
          position: [c.position.x, c.position.y, c.position.z],
          rotation: [c.rotation.x, c.rotation.y, c.rotation.z]
        }
      }));
    } else {
      const speed = state.player.isSprinting ? PLAYER_CONFIG.moveSpeed.sprint : PLAYER_CONFIG.moveSpeed.walk;
      const moveVector = new THREE.Vector3();

      if (keysPressed.current['KeyW']) moveVector.z -= 1;
      if (keysPressed.current['KeyS']) moveVector.z += 1;
      if (keysPressed.current['KeyA']) moveVector.x -= 1;
      if (keysPressed.current['KeyD']) moveVector.x += 1;

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize();
        moveVector.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

        camera.position.add(moveVector.multiplyScalar(speed * delta));

        if (state.player.isSprinting) {
          emitNoise({
            position: [camera.position.x, camera.position.y, camera.position.z],
            radius: 8,
            intensity: 3,
            type: 'footstep'
          });
        }
      }

      useGameStore.setState((s) => ({
        player: {
          ...s.player,
          position: [camera.position.x, camera.position.y, camera.position.z],
          rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
        }
      }));
    }
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      makeDefault={!isPresenting}
    />
  );
}