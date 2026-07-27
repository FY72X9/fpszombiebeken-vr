import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR, XROrigin } from '@react-three/xr';
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
  const playerRigRef = useRef<THREE.Group>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const headbobTimer = useRef<number>(0);

  // Debouncing ref for VR buttons
  const vrBtnPressedRef = useRef(false);

  // Real-time VR position & facing yaw refs
  const vrPos = useRef(new THREE.Vector3(0, 1.6, 2.0));
  const vrYaw = useRef<number>(Math.PI);

  const currentRoom = useGameStore((s) => s.currentRoom);
  const phase = useGameStore((s) => s.phase);
  const lastRoomRef = useRef<string>(currentRoom);
  const lastPhaseRef = useRef<string>(phase);

  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const moveDirVec = useRef(new THREE.Vector3());
  const upVec = useRef(new THREE.Vector3(0, 1, 0));

  const hasSyncedRef = useRef(false);

  // Sync player position & facing on initial mount, room transition, or restarting game (phase -> menu/playing)
  useEffect(() => {
    const isRoomChanged = lastRoomRef.current !== currentRoom;
    const isPhaseChanged = phase !== lastPhaseRef.current && (phase === 'playing' || phase === 'menu');

    if (!hasSyncedRef.current || isRoomChanged || isPhaseChanged) {
      hasSyncedRef.current = true;
      lastRoomRef.current = currentRoom;
      lastPhaseRef.current = phase;

      const statePlayer = useGameStore.getState().player;
      const [px, py, pz] = statePlayer.position;
      const [, ry] = statePlayer.rotation;

      vrPos.current.set(px, 0, pz);
      vrYaw.current = ry;

      if (playerRigRef.current) {
        playerRigRef.current.position.set(px, 0, pz);
        playerRigRef.current.rotation.set(0, ry, 0);
      }

      camera.position.set(px, py, pz);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(0, ry, 0);
      camera.quaternion.setFromEuler(camera.rotation);
      camera.updateMatrixWorld(true);
    } else {
      lastPhaseRef.current = phase;
    }
  }, [currentRoom, phase, camera]);

  // WebXR Session Button Listeners (selectstart / squeezestart)
  useEffect(() => {
    if (!session) return;

    const handleVRInteraction = () => {
      triggerGlobalInteraction();
    };

    session.addEventListener('selectstart', handleVRInteraction);
    session.addEventListener('select', handleVRInteraction);
    session.addEventListener('squeezestart', handleVRInteraction);

    return () => {
      session.removeEventListener('selectstart', handleVRInteraction);
      session.removeEventListener('select', handleVRInteraction);
      session.removeEventListener('squeezestart', handleVRInteraction);
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
      // ── WebXR VR Controller Direct Locomotion & Interaction Handler ──
      for (const source of session.inputSources) {
        if (!source.gamepad) continue;
        const gp = source.gamepad;

        // Check both axis sets: [2,3] and [0,1] for maximum controller compatibility
        let stickX = 0;
        let stickY = 0;

        if (Math.abs(gp.axes[2] ?? 0) > 0.1 || Math.abs(gp.axes[3] ?? 0) > 0.1) {
          stickX = gp.axes[2];
          stickY = gp.axes[3];
        } else if (Math.abs(gp.axes[0] ?? 0) > 0.1 || Math.abs(gp.axes[1] ?? 0) > 0.1) {
          stickX = gp.axes[0];
          stickY = gp.axes[1];
        }

        if (source.handedness === 'left') {
          // Left Controller Joystick: Smooth Locomotion (Forward/Backward/Strafe)
          if (Math.abs(stickX) > 0.12 || Math.abs(stickY) > 0.12) {
            camera.getWorldDirection(forwardVec.current);
            forwardVec.current.y = 0;
            if (forwardVec.current.lengthSq() > 0.0001) forwardVec.current.normalize();

            rightVec.current.crossVectors(forwardVec.current, upVec.current).normalize();

            moveDirVec.current.set(0, 0, 0);
            moveDirVec.current.addScaledVector(forwardVec.current, -stickY);
            moveDirVec.current.addScaledVector(rightVec.current, stickX);

            if (moveDirVec.current.lengthSq() > 0.0001) {
              moveDirVec.current.normalize();
              const speed = state.player.isSprinting ? PLAYER_CONFIG.moveSpeed.sprint : PLAYER_CONFIG.moveSpeed.walk;
              vrPos.current.x += moveDirVec.current.x * speed * delta;
              vrPos.current.z += moveDirVec.current.z * speed * delta;

              resolvePlayerCollisions(vrPos.current, 0.45, state.currentRoom);
            }
          }
        } else if (source.handedness === 'right') {
          // Right Controller Joystick: Smooth Eye-View Rotation
          if (Math.abs(stickX) > 0.12) {
            const turnSpeed = 1.8 * delta;
            vrYaw.current -= stickX * turnSpeed;
          }
        }

        // VR Buttons: Trigger (0), Grip (1), Button A/X (4), Button B/Y (5)
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

      // Update Rig transform
      if (playerRigRef.current) {
        playerRigRef.current.position.set(vrPos.current.x, 0, vrPos.current.z);
        playerRigRef.current.rotation.set(0, vrYaw.current, 0);
      }

      // Update global Zustand state
      useGameStore.setState((s) => ({
        player: {
          ...s.player,
          position: [vrPos.current.x, 1.6, vrPos.current.z],
          rotation: [camera.rotation.x, vrYaw.current, camera.rotation.z]
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
    <group ref={playerRigRef}>
      <XROrigin position={[0, 0, 0]} />
      {!isPresenting && (
        <PointerLockControls
          ref={controlsRef}
          args={[camera, gl.domElement]}
          makeDefault
        />
      )}
    </group>
  );
}