import { useState } from 'react';
import { useGameStore } from '../../stores/GameStore';
import { ROOM_LABELS } from '../../constants/roomGraph';
import { MobileControls } from './MobileControls';
import { ModeSelector } from './ModeSelector';
import { DialogueManager } from './DialogueManager';

export function UIManager() {
  const [currentMode, setCurrentMode] = useState<'desktop' | 'mobile' | 'vr'>('desktop');
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const reset = useGameStore((s) => s.reset);
  const player = useGameStore((s) => s.player);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const detectionMsg = useGameStore((s) => s.lastDetectionMessage);
  const cure = useGameStore((s) => s.cure);
  const nusaState = useGameStore((s) => s.nusa);

  if (phase === 'menu') {
    return (
      <div className="ui-overlay-menu" style={overlayStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: '2.5rem', color: '#ef4444', margin: '0 0 10px 0' }}>FPZombieBeken VR</h1>
          <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
            Survival Stealth WebXR — Kampus BINUS Bekasi
          </p>
          <button
            onClick={() => {
              reset();
              setPhase('playing');
            }}
            style={btnStyle}
          >
            Mulai Permainan
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="ui-overlay-menu" style={overlayStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: '3rem', color: '#dc2626', margin: '0 0 10px 0' }}>GAME OVER</h1>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Bina gugur ditangkap zombie...</p>
          <button
            onClick={() => {
              reset();
              setPhase('playing');
            }}
            style={btnStyle}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'win') {
    return (
      <div className="ui-overlay-menu" style={overlayStyle}>
        <div style={{ ...cardStyle, borderColor: '#22c55e' }}>
          <h1 style={{ fontSize: '3rem', color: '#22c55e', margin: '0 0 10px 0' }}>MISSION SUCCESS!</h1>
          <p style={{ color: '#e2e8f0', marginBottom: '20px' }}>
            Nusa berhasil diselamatkan dan kampus BINUS Bekasi telah diamankan!
          </p>
          <button
            onClick={() => {
              reset();
              setPhase('menu');
            }}
            style={{ ...btnStyle, backgroundColor: '#16a34a' }}
          >
            Menu Utama
          </button>
        </div>
      </div>
    );
  }

  const roomTitle = ROOM_LABELS[currentRoom as keyof typeof ROOM_LABELS] || currentRoom;
  const threatColors = ['#22c55e', '#eab308', '#f97316', '#ef4444'];
  const threatText = ['Aman', 'Waspada', 'Kejar', 'Diserang'];

  const antidoteItem = player.inventory.find((i) => i.type === 'antidote');
  const syringeCount = antidoteItem ? antidoteItem.count : 0;
  const dosenCuredCount = (cure.indiCured ? 1 : 0) + (cure.gatotCured ? 1 : 0);

  return (
    <>
      {/* Top Right Mode Switcher Bar */}
      <ModeSelector currentMode={currentMode} onSelectMode={setCurrentMode} />

      {/* Dialogue Manager */}
      <DialogueManager />

      <div style={hudContainerStyle}>
        {/* Top Left Corner: Ultra-Compact Badge */}
        <div style={compactCornerBadgeStyle}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>
            📍 {roomTitle} <span style={{ color: threatColors[threatLevel] }}>({threatText[threatLevel]})</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.8rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>💉 Syringe: {syringeCount}</span>
            <span style={{ color: '#cbd5e1' }}>
              👥 Saved: Nusa [{nusaState.isRescued ? '✓' : '✗'}] | Willy [{cure.willyCured ? '✓' : '✗'}] | Dosen [{dosenCuredCount}/2]
            </span>
          </div>
        </div>

        {/* Subtitle / Toast Notification */}
        {detectionMsg && (
          <div style={toastStyle}>
            {detectionMsg}
          </div>
        )}

        {/* Bottom Left HUD: Compact Health & Stamina Bars */}
        <div style={compactBottomHudStyle}>
          <div style={{ flex: 1 }}>
            <div style={barLabelStyle}>HP {Math.round(player.health)}</div>
            <div style={barBgStyle}>
              <div style={{ ...barFillStyle, width: `${(player.health / player.maxHealth) * 100}%`, backgroundColor: '#ef4444' }} />
            </div>
          </div>

          <div style={{ flex: 1, marginLeft: '8px' }}>
            <div style={barLabelStyle}>STM {Math.round(player.stamina)}</div>
            <div style={barBgStyle}>
              <div style={{ ...barFillStyle, width: `${(player.stamina / player.maxStamina) * 100}%`, backgroundColor: '#3b82f6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* On-Screen Mobile Touch Joystick (Rendered ONLY in Mobile Mode) */}
      <MobileControls active={currentMode === 'mobile'} />
    </>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  pointerEvents: 'auto'
};

const cardStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '2px solid #334155',
  borderRadius: '16px',
  padding: '36px',
  textAlign: 'center',
  maxWidth: '440px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  pointerEvents: 'auto'
};

const btnStyle: React.CSSProperties = {
  background: '#dc2626',
  color: '#ffffff',
  border: 'none',
  padding: '14px 32px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  borderRadius: '8px',
  cursor: 'pointer',
  pointerEvents: 'auto'
};

const hudContainerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  padding: '16px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  fontFamily: 'system-ui, sans-serif',
  zIndex: 800
};

const compactCornerBadgeStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  borderRadius: '8px',
  padding: '6px 12px',
  maxWidth: '360px',
  pointerEvents: 'none'
};

const toastStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(220, 38, 38, 0.9)',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '20px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  pointerEvents: 'none'
};

const compactBottomHudStyle: React.CSSProperties = {
  display: 'flex',
  width: '200px',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '6px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  pointerEvents: 'none'
};

const barLabelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 'bold',
  color: '#cbd5e1',
  marginBottom: '2px'
};

const barBgStyle: React.CSSProperties = {
  width: '100%',
  height: '6px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden'
};

const barFillStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.2s ease'
};
