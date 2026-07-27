import { useState, useRef } from 'react';
import { useGameStore } from '../../stores/GameStore';
import { triggerGlobalInteraction } from '../../systems/InteractionManager';

export function MobileControls({ active }: { active: boolean }) {
  const updateInput = useGameStore((s) => s.updateInput);
  const setPlayerSprint = useGameStore((s) => s.setPlayerSprint);
  const setPlayerCrouch = useGameStore((s) => s.setPlayerCrouch);
  const isSprinting = useGameStore((s) => s.player.isSprinting);
  const isCrouching = useGameStore((s) => s.player.isCrouching);

  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickActiveRef = useRef(false);
  const joystickStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const lookTouchLastRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lookActiveRef = useRef(false);

  if (!active) return null;

  // ── Left Virtual Joystick Movement ──
  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    joystickStartRef.current = { x: clientX, y: clientY };
    joystickActiveRef.current = true;
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActiveRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - joystickStartRef.current.x;
    const dy = clientY - joystickStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    const maxDist = 50;

    const clampedX = dist > 0 ? (dx / Math.max(dist, maxDist)) * Math.min(dist, maxDist) : 0;
    const clampedY = dist > 0 ? (dy / Math.max(dist, maxDist)) * Math.min(dist, maxDist) : 0;

    setJoystickPos({ x: clampedX, y: clampedY });

    const normX = clampedX / maxDist;
    const normZ = clampedY / maxDist;
    updateInput({ move: [normX, 0, normZ] });
  };

  const handleJoystickEnd = () => {
    joystickActiveRef.current = false;
    setJoystickPos({ x: 0, y: 0 });
    updateInput({ move: null });
  };

  // ── Right Touch Look 360 Camera Drag ──
  const handleLookStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lookTouchLastRef.current = { x: clientX, y: clientY };
    lookActiveRef.current = true;
  };

  const handleLookMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!lookActiveRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - lookTouchLastRef.current.x;
    const dy = clientY - lookTouchLastRef.current.y;
    lookTouchLastRef.current = { x: clientX, y: clientY };

    if (dx !== 0 || dy !== 0) {
      updateInput({ lookDelta: [dx, dy] });
    }
  };

  const handleLookEnd = () => {
    lookActiveRef.current = false;
    updateInput({ lookDelta: null });
  };

  return (
    <>
      {/* Right Side Touch Look Zone for 360 degree camera panning */}
      <div
        style={touchLookZoneStyle}
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
        onMouseDown={handleLookStart}
        onMouseMove={handleLookMove}
        onMouseUp={handleLookEnd}
      >
        <div style={touchLookHintStyle}>👁️ Swipe 360° View</div>
      </div>

      <div style={mobileControlsContainerStyle}>
        <div
          style={joystickBaseStyle}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          onMouseDown={handleJoystickStart}
          onMouseMove={handleJoystickMove}
          onMouseUp={handleJoystickEnd}
        >
          <div
            style={{
              ...joystickKnobStyle,
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
            }}
          />
        </div>

        <div style={actionButtonsGroupStyle}>
          <button
            style={{
              ...btnStyle,
              backgroundColor: '#0284c7'
            }}
            onClick={() => triggerGlobalInteraction()}
          >
            [E] INTERAKSI
          </button>

          <button
            style={{
              ...btnStyle,
              backgroundColor: isSprinting ? '#dc2626' : 'rgba(15, 23, 42, 0.8)'
            }}
            onClick={() => setPlayerSprint(!isSprinting)}
          >
            LARI
          </button>

          <button
            style={{
              ...btnStyle,
              backgroundColor: isCrouching ? '#3b82f6' : 'rgba(15, 23, 42, 0.8)'
            }}
            onClick={() => setPlayerCrouch(!isCrouching)}
          >
            JONGKOK
          </button>
        </div>
      </div>
    </>
  );
}

const touchLookZoneStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: '55vw',
  height: '100vh',
  zIndex: 850,
  pointerEvents: 'auto',
  touchAction: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const touchLookHintStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.25)',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
  pointerEvents: 'none',
  userSelect: 'none',
  textTransform: 'uppercase'
};

const mobileControlsContainerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '20px',
  left: '0',
  width: '100vw',
  padding: '0 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  pointerEvents: 'none',
  zIndex: 900,
  boxSizing: 'border-box'
};

const joystickBaseStyle: React.CSSProperties = {
  width: '120px',
  height: '120px',
  borderRadius: '60px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  touchAction: 'none'
};

const joystickKnobStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  borderRadius: '25px',
  background: '#38bdf8',
  boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)'
};

const actionButtonsGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  pointerEvents: 'auto'
};

const btnStyle: React.CSSProperties = {
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '10px 18px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  borderRadius: '30px',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)'
};
