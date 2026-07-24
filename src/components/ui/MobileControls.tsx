import { useState, useRef } from 'react';
import { useGameStore } from '../../stores/GameStore';
import { triggerGlobalInteraction } from '../interaction/InteractionSystem';

export function MobileControls({ active }: { active: boolean }) {
  const updateInput = useGameStore((s) => s.updateInput);
  const setPlayerSprint = useGameStore((s) => s.setPlayerSprint);
  const setPlayerCrouch = useGameStore((s) => s.setPlayerCrouch);
  const isSprinting = useGameStore((s) => s.player.isSprinting);
  const isCrouching = useGameStore((s) => s.player.isCrouching);

  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!active) return null;

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x: clientX, y: clientY };
    setJoystickActive(true);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActive) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;
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
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    updateInput({ move: null });
  };

  return (
    <div style={mobileControlsContainerStyle}>
      <div
        style={joystickBaseStyle}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
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
  );
}

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
  zIndex: 900
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
