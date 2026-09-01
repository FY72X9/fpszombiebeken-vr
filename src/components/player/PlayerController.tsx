import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useXR, XROrigin } from '@react-three/xr';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/GameStore';
import { PLAYER_CONFIG } from '../../constants/gameConfig';
import { emitNoise } from '../../systems/NoiseSystem';
import { triggerGlobalInteraction } from '../../systems/InteractionManager';
import { resolvePlayerCollisions, getStairElevation } from '../../physics/useSimpleCollisions';
import { ComfortVignette } from '../xr/ComfortVignette';

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
  const snapTurnLockRef = useRef(false);
  const [snapPulseTrigger, setSnapPulseTrigger] = useState(false);
  const vrMotionIntensityRef = useRef(0);

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

      const storeState = useGameStore.getState();
      const [px, py, pz] = storeState.player.position;
      const [, ry] = storeState.player.rotation;

      vrPos.current.set(px, py, pz);
      vrYaw.current = ry;

      const stairY = getStairElevation(vrPos.current, currentRoom);
      const heightOffset = storeState.accessibility.vrHeightOffset ?? 0.25;
      const totalRigY = stairY + heightOffset;

      if (playerRigRef.current) {
        playerRigRef.current.position.set(px, totalRigY, pz);
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

    // ── Check if room or phase changed inside frame loop to prevent race conditions ──
    const isRoomChanged = lastRoomRef.current !== state.currentRoom;
    const isPhaseChanged = state.phase !== lastPhaseRef.current && (state.phase === 'playing' || state.phase === 'menu');

    if (!hasSyncedRef.current || isRoomChanged || isPhaseChanged) {
      hasSyncedRef.current = true;
      lastRoomRef.current = state.currentRoom;
      lastPhaseRef.current = state.phase;

      const [px, py, pz] = state.player.position;
      const [, ry] = state.player.rotation;

      vrPos.current.set(px, py, pz);
      vrYaw.current = ry;

      const stairY = getStairElevation(vrPos.current, state.currentRoom);
      const heightOffset = state.accessibility.vrHeightOffset ?? 0.25;
      const totalRigY = stairY + heightOffset;

      if (playerRigRef.current) {
        playerRigRef.current.position.set(px, totalRigY, pz);
        playerRigRef.current.rotation.set(0, ry, 0);
      }

      camera.position.set(px, py, pz);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(0, ry, 0);
      camera.quaternion.setFromEuler(camera.rotation);
      camera.updateMatrixWorld(true);
      return;
    }

    if (isPresenting && session) {
      let isMovingInVR = false;
      let vrSpeed = 0;

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
          // Left Controller Joystick: Locomotion (Forward/Backward/Strafe)
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
              const baseMoveSpeed = state.accessibility.vrSpeedMode === 'comfort' ? 3.0 : PLAYER_CONFIG.moveSpeed.walk;
              const speed = state.player.isSprinting ? PLAYER_CONFIG.moveSpeed.sprint : baseMoveSpeed;
              vrSpeed = speed;
              isMovingInVR = true;

              vrPos.current.x += moveDirVec.current.x * speed * delta;
              vrPos.current.z += moveDirVec.current.z * speed * delta;

              resolvePlayerCollisions(vrPos.current, 0.45, state.currentRoom);
            }
          }
        } else if (source.handedness === 'right') {
          // Right Controller Joystick: Snap Turning (Comfort Default) or Smooth Turning
          const turnMode = state.accessibility.turnMode ?? 'snap';
          const snapAngleDeg = state.accessibility.snapTurnAngle || 45;
          const snapAngleRad = (snapAngleDeg * Math.PI) / 180;

          if (turnMode === 'snap') {
            if (Math.abs(stickX) > 0.55) {
              if (!snapTurnLockRef.current) {
                snapTurnLockRef.current = true;
                const dir = stickX > 0 ? -1 : 1;
                vrYaw.current += dir * snapAngleRad;
                setSnapPulseTrigger(true);
                setTimeout(() => setSnapPulseTrigger(false), 200);
              }
            } else if (Math.abs(stickX) < 0.2) {
              snapTurnLockRef.current = false;
            }
          } else {
            // Smooth turning
            if (Math.abs(stickX) > 0.12) {
              const turnSpeed = 1.8 * delta;
              vrYaw.current -= stickX * turnSpeed;
              vrMotionIntensityRef.current = Math.min(1, Math.abs(stickX) * 0.8);
            }
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

      // Calculate motion intensity for comfort vignette
      if (isMovingInVR) {
        vrMotionIntensityRef.current = THREE.MathUtils.lerp(
          vrMotionIntensityRef.current,
          Math.min(1, vrSpeed / 5.0),
          Math.min(1, delta * 10)
        );
      } else {
        vrMotionIntensityRef.current = THREE.MathUtils.lerp(
          vrMotionIntensityRef.current,
          0,
          Math.min(1, delta * 6)
        );
      }

      // Stair Elevation & Height Offset in VR
      const stairY = getStairElevation(vrPos.current, state.currentRoom);
      const heightOffset = state.accessibility.vrHeightOffset ?? 0.25;
      const totalRigY = stairY + heightOffset;

      // Update Rig transform
      if (playerRigRef.current) {
        playerRigRef.current.position.set(vrPos.current.x, totalRigY, vrPos.current.z);
        playerRigRef.current.rotation.set(0, vrYaw.current, 0);
      }

      // Update global Zustand state
      useGameStore.setState((s) => ({
        player: {
          ...s.player,
          position: [vrPos.current.x, totalRigY + 1.6, vrPos.current.z],
          rotation: [camera.rotation.x, vrYaw.current, camera.rotation.z]
        }
      }));
    } else {
      // ── Non-VR Desktop & Mobile Controls ──
      const inputLook = state.input.lookDelta;
      if (inputLook && (inputLook[0] !== 0 || inputLook[1] !== 0)) {
        const sensitivity = 0.0035;
        const [dx, dy] = inputLook;

        camera.rotation.order = 'YXZ';
        camera.rotation.y -= dx * sensitivity;
        const newPitch = camera.rotation.x - dy * sensitivity;
        camera.rotation.x = Math.max(-1.4, Math.min(1.4, newPitch));
        camera.rotation.z = 0;
        camera.quaternion.setFromEuler(camera.rotation);

        useGameStore.getState().updateInput({ lookDelta: null });
      }

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
        const bobFreq = state.player.isSprinting ? 8 : 5.5;
        const bobAmp = state.player.isSprinting ? 0.02 : 0.01;
        headbobTimer.current += delta * bobFreq;

        const targetY = effectiveBaseHeight + Math.sin(headbobTimer.current) * bobAmp;
        camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 12);
      } else {
        headbobTimer.current = 0;
        camera.position.y += (effectiveBaseHeight - camera.position.y) * Math.min(1, delta * 12);
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
      <ComfortVignette motionIntensity={vrMotionIntensityRef.current} snapPulse={snapPulseTrigger} />
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