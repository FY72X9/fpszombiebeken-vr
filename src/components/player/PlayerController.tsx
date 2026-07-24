import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR, XROrigin, useXRControllerLocomotion } from '@react-three/xr';
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
  const xrOriginRef = useRef<THREE.Group>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const headbobTimer = useRef<number>(0);

  // WebXR debouncing refs for controller buttons
  const vrBtnPressedRef = useRef(false);

  const currentRoom = useGameStore((s) => s.currentRoom);
  const lastRoomRef = useRef<string>(currentRoom);

  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const moveDirVec = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3(0, 1, 0));

  const hasSyncedRef = useRef(false);

  // Official @react-three/xr v6 Built-in VR Locomotion Hook!
  // Uses Left Controller Joystick for Smooth Locomotion and Right Controller Joystick for 45° Snap Turning.
  useXRControllerLocomotion(
    xrOriginRef,
    { speed: 2.2 },
    { type: 'snap', degrees: 45 },
    'left'
  );

  // Sync player position & facing on initial mount and on every room transition
  useEffect(() => {
    if (!hasSyncedRef.current || lastRoomRef.current !== currentRoom) {
      hasSyncedRef.current = true;
      lastRoomRef.current = currentRoom;
      const statePlayer = useGameStore.getState().player;
      const [px, py, pz] = statePlayer.position;
      const [, ry] = statePlayer.rotation;

      if (xrOriginRef.current) {
        xrOriginRef.current.position.set(px, 0, pz);
        xrOriginRef.current.rotation.set(0, ry, 0);
      }

      camera.position.set(px, py, pz);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(0, ry, 0);
    }
  }, [currentRoom, camera]);

  // WebXR Session Button Listeners for A / B / X / Y / Trigger / Grip
  useEffect(() => {
    if (!session) return;

    const handleSelect = () => {
      triggerGlobalInteraction();
    };

    session.addEventListener('selectstart', handleSelect);
    session.addEventListener('select', handleSelect);

    return () => {
      session.removeEventListener('selectstart', handleSelect);
      session.removeEventListener('select', handleSelect);
    };
  }, [session]);

  // Desktop keyboard listeners
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
      // ── WebXR Controller Button Press Handler (A / B / X / Y / Trigger / Grip) ──
      for (const source of session.inputSources) {
        if (!source.gamepad) continue;
        const gp = source.gamepad;

        // Check buttons[0] (Trigger), buttons[1] (Grip), buttons[4] (A/X), buttons[5] (B/Y)
        const isBtnPressed = gp.buttons.some((b, idx) => [0, 1, 4, 5].includes(idx) && b && (b.pressed || b.value > 0.5));
        if (isBtnPressed) {
          if (!vrBtnPressedRef.current) {
            vrBtnPressedRef.current = true;
            triggerGlobalInteraction();
          }
        } else {
          vrBtnPressedRef.current = false;
        }
      }

      // Enforce room collision boundaries on XROrigin
      if (xrOriginRef.current) {
        resolvePlayerCollisions(xrOriginRef.current.position, 0.45, state.currentRoom);

        // Sync VR player position & orientation back to global Zustand store
        const originPos = xrOriginRef.current.position;
        const originRot = xrOriginRef.current.rotation;

        useGameStore.setState((s) => ({
          player: {
            ...s.player,
            position: [originPos.x, originPos.y + 1.6, originPos.z],
            rotation: [camera.rotation.x, originRot.y, camera.rotation.z]
          }
        }));
      }
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
    <>
      <XROrigin ref={xrOriginRef} position={[0, 0, 0]} />
      {!isPresenting && (
        <PointerLockControls
          ref={controlsRef}
          args={[camera, gl.domElement]}
          makeDefault
        />
      )}
    </>
  );
}