import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { PLAYER_CONFIG } from '../../constants/gameConfig';
import { emitNoise } from '../../systems/NoiseSystem';
import { triggerGlobalInteraction } from '../interaction/InteractionSystem';
import { resolvePlayerCollisions, getStairElevation } from '../../physics/useSimpleCollisions';

export function PlayerController() {
  const { camera, gl } = useThree();
  const session = useXR((state) => state.session);
  const isPresenting = !!session;
  const controlsRef = useRef<any>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const headbobTimer = useRef<number>(0);

  // WebXR debouncing refs for controllers
  const vrTriggerPressedRef = useRef(false);
  const vrSnapRef = useRef(false);

  const currentRoom = useGameStore((s) => s.currentRoom);
  const lastRoomRef = useRef<string>(currentRoom);

  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const moveDirVec = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3(0, 1, 0));

  const hasSyncedRef = useRef(false);

  // Sync camera to store position AND facing on initial mount and on every room transition
  useEffect(() => {
    if (!hasSyncedRef.current || lastRoomRef.current !== currentRoom) {
      hasSyncedRef.current = true;
      lastRoomRef.current = currentRoom;
      const statePlayer = useGameStore.getState().player;
      const [px, py, pz] = statePlayer.position;
      const [, ry] = statePlayer.rotation;
      camera.position.set(px, py, pz);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(0, ry, 0);
    }
  }, [currentRoom, camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ControlLeft', 'ControlRight', 'KeyC', 'KeyE', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'Space'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
      }

      keysPressed.current[e.code] = true;

      if (e.code === 'KeyE') {
        triggerGlobalInteraction();
      }

      if (e.code === 'KeyC' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
        const isCrouching = useGameStore.getState().player.isCrouching;
        useGameStore.getState().setPlayerCrouch(!isCrouching);
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        useGameStore.getState().setPlayerSprint(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ControlLeft', 'ControlRight', 'KeyC', 'KeyE', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'Space'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
      }

      keysPressed.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        useGameStore.getState().setPlayerSprint(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, []);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing') return;

    if (isPresenting && session) {
      // ── WebXR Standard VR Controller Input Handler (MetaQuest / OpenXR) ──
      for (const source of session.inputSources) {
        if (!source.gamepad) continue;
        const gp = source.gamepad;

        if (source.handedness === 'left') {
          // Left Thumbstick Smooth Locomotion
          const stickX = gp.axes[2] ?? gp.axes[0] ?? 0;
          const stickZ = gp.axes[3] ?? gp.axes[1] ?? 0;

          if (Math.abs(stickX) > 0.15 || Math.abs(stickZ) > 0.15) {
            camera.getWorldDirection(forwardVec.current);
            forwardVec.current.y = 0;
            if (forwardVec.current.lengthSq() > 0.0001) forwardVec.current.normalize();

            rightVec.current.crossVectors(forwardVec.current, upVec.current).normalize();

            moveDirVec.current.set(0, 0, 0);
            moveDirVec.current.addScaledVector(forwardVec.current, -stickZ);
            moveDirVec.current.addScaledVector(rightVec.current, stickX);

            if (moveDirVec.current.lengthSq() > 0.0001) {
              moveDirVec.current.normalize();
              const speed = state.player.isSprinting ? PLAYER_CONFIG.moveSpeed.sprint : PLAYER_CONFIG.moveSpeed.walk;
              camera.position.x += moveDirVec.current.x * speed * delta;
              camera.position.z += moveDirVec.current.z * speed * delta;

              resolvePlayerCollisions(camera.position, 0.45, state.currentRoom);
            }
          }
        } else if (source.handedness === 'right') {
          // Right Thumbstick Snap Turn (45 degrees)
          const snapX = gp.axes[2] ?? gp.axes[0] ?? 0;
          if (Math.abs(snapX) > 0.6) {
            if (!vrSnapRef.current) {
              vrSnapRef.current = true;
              const angle = snapX > 0 ? -Math.PI / 4 : Math.PI / 4;
              camera.rotation.y += angle;
            }
          } else {
            vrSnapRef.current = false;
          }

          // Right Trigger (buttons[0]): Global Interaction (Doors / Syringe / Talk)
          if (gp.buttons[0] && gp.buttons[0].pressed) {
            if (!vrTriggerPressedRef.current) {
              vrTriggerPressedRef.current = true;
              triggerGlobalInteraction();
            }
          } else {
            vrTriggerPressedRef.current = false;
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
    } else {
      // ── Non-VR Desktop & Mobile Controls ──
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
      const stairY = getStairElevation(camera.position, state.currentRoom);
      const effectiveBaseHeight = baseHeight + stairY;

      const isMoving = moveX !== 0 || moveZ !== 0;

      if (isMoving) {
        const bobFreq = state.player.isSprinting ? 12 : 8;
        const bobAmp = state.player.isSprinting ? 0.05 : 0.025;
        headbobTimer.current += delta * bobFreq;

        const bobY = Math.sin(headbobTimer.current) * bobAmp;
        camera.position.y = effectiveBaseHeight + bobY;
      } else {
        headbobTimer.current = 0;
        camera.position.y += (effectiveBaseHeight - camera.position.y) * 0.15;
      }

      if (isMoving) {
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

          camera.position.x += moveDirVec.current.x * speed * delta;
          camera.position.z += moveDirVec.current.z * speed * delta;

          resolvePlayerCollisions(camera.position, 0.45, state.currentRoom);

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