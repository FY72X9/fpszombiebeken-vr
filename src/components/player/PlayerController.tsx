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

// Helper function to extract 360-degree radial analog joystick values
function getJoystickInput(gp: Gamepad): { x: number; y: number; magnitude: number } {
  // WebXR standard gamepad specification:
  // axes[0]: primary stick X (-1 left, +1 right)
  // axes[1]: primary stick Y (-1 up, +1 down)
  // axes[2]: secondary stick / touchpad X
  // axes[3]: secondary stick / touchpad Y
  const x01 = gp.axes[0] ?? 0;
  const y01 = gp.axes[1] ?? 0;
  const mag01 = Math.hypot(x01, y01);

  const x23 = gp.axes[2] ?? 0;
  const y23 = gp.axes[3] ?? 0;
  const mag23 = Math.hypot(x23, y23);

  // Pick whichever pair has active intentional input (filter out capacitive / sensor noise below 0.08)
  let rawX = 0;
  let rawY = 0;
  let rawMag = 0;

  if (mag01 >= 0.08 && mag01 >= mag23) {
    rawX = x01;
    rawY = y01;
    rawMag = mag01;
  } else if (mag23 >= 0.08) {
    rawX = x23;
    rawY = y23;
    rawMag = mag23;
  }

  // Circular / Radial Deadzone (prevents axis pinching & square deadzone snap)
  const deadzone = 0.12;
  if (rawMag <= deadzone) {
    return { x: 0, y: 0, magnitude: 0 };
  }

  // Remap magnitude smoothly from [deadzone, 1.0] -> [0.0, 1.0]
  const remappedMag = Math.min(1.0, (rawMag - deadzone) / (1.0 - deadzone));
  // Smooth progressive response curve for refined micro-movements
  const smoothMag = Math.pow(remappedMag, 1.15);

  // Preserve continuous 360-degree angle
  const angle = Math.atan2(rawY, rawX);
  return {
    x: Math.cos(angle) * smoothMag,
    y: Math.sin(angle) * smoothMag,
    magnitude: smoothMag
  };
}

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
  const sprintBtnLockRef = useRef(false);
  const snapTurnLockRef = useRef(false);
  const [snapPulseTrigger, setSnapPulseTrigger] = useState(false);
  const vrMotionIntensityRef = useRef(0);
  const vrFootstepTimer = useRef(0);

  // Real-time VR position, facing yaw, and smoothed velocity refs
  const vrPos = useRef(new THREE.Vector3(0, 1.6, 2.0));
  const vrYaw = useRef<number>(Math.PI);
  const vrVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetVRVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetVRMoveDir = useRef(new THREE.Vector3(0, 0, 0));

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
      vrVelocity.current.set(0, 0, 0);
      targetVRVelocity.current.set(0, 0, 0);

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
      vrVelocity.current.set(0, 0, 0);
      targetVRVelocity.current.set(0, 0, 0);

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
      let targetVRSpeed = 0;
      targetVRMoveDir.current.set(0, 0, 0);

      // ── WebXR VR Controller Direct Locomotion & Interaction Handler ──
      for (const source of session.inputSources) {
        if (!source.gamepad) continue;
        const gp = source.gamepad;

        const stick = getJoystickInput(gp);

        if (source.handedness === 'left') {
          // Left Controller Joystick: Full 360 Omnidirectional Locomotion (Smooth & Analog)
          if (stick.magnitude > 0.01) {
            // Get Headset World Orientation projected onto horizontal XZ plane
            camera.getWorldDirection(forwardVec.current);
            forwardVec.current.y = 0;
            if (forwardVec.current.lengthSq() > 0.001) {
              forwardVec.current.normalize();
            } else {
              // Looking straight up or down: derive forward vector from camera yaw quaternion
              const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
              forwardVec.current.set(-Math.sin(euler.y), 0, -Math.cos(euler.y));
            }

            rightVec.current.crossVectors(forwardVec.current, upVec.current).normalize();

            // Calculate precise 360 movement vector:
            // In WebXR Gamepad standard: -Y is forward (stick up), +Y is backward (stick down)
            // +X is strafe right, -X is strafe left
            targetVRMoveDir.current.addScaledVector(forwardVec.current, -stick.y);
            targetVRMoveDir.current.addScaledVector(rightVec.current, stick.x);

            const baseMoveSpeed = state.accessibility.vrSpeedMode === 'comfort' ? 3.2 : PLAYER_CONFIG.moveSpeed.walk;
            const maxSpeed = state.player.isSprinting ? PLAYER_CONFIG.moveSpeed.sprint : baseMoveSpeed;

            targetVRSpeed = maxSpeed * stick.magnitude;
            isMovingInVR = true;
          }

          // Left Stick Click (Button Index 3) -> Toggle / Activate Sprint
          const stickClick = gp.buttons[3];
          if (stickClick && (stickClick.pressed || stickClick.value > 0.6)) {
            if (!sprintBtnLockRef.current) {
              sprintBtnLockRef.current = true;
              const isSprinting = useGameStore.getState().player.isSprinting;
              useGameStore.getState().setPlayerSprint(!isSprinting);
            }
          } else {
            sprintBtnLockRef.current = false;
          }
        } else if (source.handedness === 'right') {
          // Right Controller Joystick: Snap Turning (Comfort Default) or Smooth Turning
          const turnMode = state.accessibility.turnMode ?? 'snap';
          const snapAngleDeg = state.accessibility.snapTurnAngle || 45;
          const snapAngleRad = (snapAngleDeg * Math.PI) / 180;

          if (turnMode === 'snap') {
            if (Math.abs(stick.x) > 0.55) {
              if (!snapTurnLockRef.current) {
                snapTurnLockRef.current = true;
                const dir = stick.x > 0 ? -1 : 1;
                vrYaw.current += dir * snapAngleRad;
                setSnapPulseTrigger(true);
                setTimeout(() => setSnapPulseTrigger(false), 200);
              }
            } else if (Math.abs(stick.x) < 0.2) {
              snapTurnLockRef.current = false;
            }
          } else {
            // Smooth turning with progressive acceleration
            if (Math.abs(stick.x) > 0.08) {
              const turnSpeed = 2.2 * delta;
              vrYaw.current -= stick.x * turnSpeed;
              vrMotionIntensityRef.current = Math.min(1, Math.abs(stick.x) * 0.75);
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

      // Smooth Velocity Interpolation (Damping / Acceleration curve) for silky 360 movement
      if (isMovingInVR && targetVRMoveDir.current.lengthSq() > 0.0001) {
        targetVRVelocity.current.copy(targetVRMoveDir.current).normalize().multiplyScalar(targetVRSpeed);
      } else {
        targetVRVelocity.current.set(0, 0, 0);
      }

      // Snappy and responsive acceleration / deceleration lerp
      const accelFactor = targetVRVelocity.current.lengthSq() > 0 ? 15 : 18;
      vrVelocity.current.lerp(targetVRVelocity.current, Math.min(1, delta * accelFactor));

      // Apply displacement
      const currentSpeed = vrVelocity.current.length();
      if (currentSpeed > 0.005) {
        vrPos.current.x += vrVelocity.current.x * delta;
        vrPos.current.z += vrVelocity.current.z * delta;

        resolvePlayerCollisions(vrPos.current, 0.45, state.currentRoom);

        // Footstep audio / noise emit when moving fast
        if (state.player.isSprinting && currentSpeed > PLAYER_CONFIG.moveSpeed.walk + 0.5) {
          vrFootstepTimer.current += delta;
          if (vrFootstepTimer.current > 0.35) {
            vrFootstepTimer.current = 0;
            emitNoise({
              position: [vrPos.current.x, vrPos.current.y, vrPos.current.z],
              radius: 8,
              intensity: 3,
              type: 'footstep'
            });
          }
        }
      }

      // Calculate motion intensity for comfort vignette
      if (currentSpeed > 0.05) {
        vrMotionIntensityRef.current = THREE.MathUtils.lerp(
          vrMotionIntensityRef.current,
          Math.min(1, currentSpeed / 5.5),
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