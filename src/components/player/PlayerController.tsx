import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { PLAYER_CONFIG } from '../../constants/gameConfig';
import { emitNoise } from '../../systems/NoiseSystem';
import { triggerGlobalInteraction } from '../interaction/InteractionSystem';
import { resolvePlayerCollisions } from '../../physics/useSimpleCollisions';

export function PlayerController() {
  const { camera, gl } = useThree();
  const session = useXR((state) => state.session);
  const isPresenting = !!session;
  const controlsRef = useRef<any>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const headbobTimer = useRef<number>(0);

  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const moveDirVec = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'KeyE') {
        triggerGlobalInteraction();
      }

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
      const inputMove = state.input.move;
      let moveX = 0;
      let moveZ = 0;

      if (keysPressed.current['KeyW']) moveZ -= 1;
      if (keysPressed.current['KeyS']) moveZ += 1;
      if (keysPressed.current['KeyA']) moveX -= 1;
      if (keysPressed.current['KeyD']) moveX += 1;

      if (inputMove) {
        moveX += inputMove[0];
        moveZ += inputMove[2];
      }

      const speed = state.player.isSprinting ? PLAYER_CONFIG.moveSpeed.sprint : PLAYER_CONFIG.moveSpeed.walk;
      const baseHeight = state.player.isCrouching ? PLAYER_CONFIG.height.crouch : PLAYER_CONFIG.height.stand;

      const isMoving = moveX !== 0 || moveZ !== 0;

      // Realistic Camera Headbobbing
      if (isMoving) {
        const bobFreq = state.player.isSprinting ? 12 : 8;
        const bobAmp = state.player.isSprinting ? 0.05 : 0.025;
        headbobTimer.current += delta * bobFreq;

        const bobY = Math.sin(headbobTimer.current) * bobAmp;
        camera.position.y = baseHeight + bobY;
      } else {
        headbobTimer.current = 0;
        camera.position.y += (baseHeight - camera.position.y) * 0.1;
      }

      if (isMoving) {
        // Robust 100% Direction-Consistent WASD Locomotion using getWorldDirection()
        camera.getWorldDirection(forwardVec.current);
        forwardVec.current.y = 0;
        if (forwardVec.current.lengthSq() > 0.0001) {
          forwardVec.current.normalize();
        }

        rightVec.current.crossVectors(forwardVec.current, upVec.current).normalize();

        moveDirVec.current.set(0, 0, 0);
        moveDirVec.current.addScaledVector(forwardVec.current, -moveZ);
        moveDirVec.current.addScaledVector(rightVec.current, moveX);

        if (moveDirVec.current.lengthSq() > 0.0001) {
          moveDirVec.current.normalize();

          // Apply candidate position
          camera.position.x += moveDirVec.current.x * speed * delta;
          camera.position.z += moveDirVec.current.z * speed * delta;

          // AABB Physics Collision Resolution (Prevents clipping through walls & obstacles)
          resolvePlayerCollisions(camera.position, 0.4, state.currentRoom);

          if (state.player.isSprinting) {
            emitNoise({
              position: [camera.position.x, camera.position.y, camera.position.z],
              radius: 8,
              intensity: 3,
              type: 'footstep'
            });
          }
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