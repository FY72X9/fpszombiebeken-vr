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
              setPhase('intro');
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
  const threatText = ['Aman (Calm)', 'Waspada (Alert)', 'Pengejaran (Chase)', 'Diserang (Attack)'];

  return (
    <>
      {/* Top Right Mode Switcher Bar */}
      <ModeSelector currentMode={currentMode} onSelectMode={setCurrentMode} />

      {/* Storyline & Dialogue Manager */}
      <DialogueManager />

      <div style={hudContainerStyle}>
        {/* Top Left: Room & Threat */}
        <div style={panelStyle}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>{roomTitle}</div>
          <div style={{ color: threatColors[threatLevel], fontWeight: '600', marginTop: '2px', fontSize: '0.85rem' }}>
            Status: {threatText[threatLevel]}
          </div>
        </div>

        {/* Top Center: Objectives & Cure status */}
        <div style={panelStyle}>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Misi: Selamatkan Nusa dari Kelas 2A & Cure Dosen</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Cured: Willy [{cure.willyCured ? '✓' : '✗'}] | Indi [{cure.indiCured ? '✓' : '✗'}] | Gatot [{cure.gatotCured ? '✓' : '✗'}]
          </div>
        </div>

        {/* Subtitle / Toast Notification */}
        {detectionMsg && (
          <div style={toastStyle}>
            {detectionMsg}
          </div>
        )}

        {/* Bottom Left HUD: Health & Stamina */}
        <div style={bottomHudStyle}>
          <div style={{ flex: 1 }}>
            <div style={barLabelStyle}>HP: {Math.round(player.health)} / {player.maxHealth}</div>
            <div style={barBgStyle}>
              <div style={{ ...barFillStyle, width: `${(player.health / player.maxHealth) * 100}%`, backgroundColor: '#ef4444' }} />
            </div>
          </div>

          <div style={{ flex: 1, marginLeft: '12px' }}>
            <div style={barLabelStyle}>STAMINA: {Math.round(player.stamina)} / {player.maxStamina}</div>
            <div style={barBgStyle}>
              <div style={{ ...barFillStyle, width: `${(player.stamina / player.maxStamina) * 100}%`, backgroundColor: '#3b82f6' }} />
            </div>
          </div>
        </div>

        {/* Inventory Bar */}
        <div style={inventoryBarStyle}>
          {player.inventory.map((item, idx) => (
            <div
              key={item.id}
              style={{
                ...itemSlotStyle,
                borderColor: player.equippedSlot === idx ? '#38bdf8' : 'rgba(255,255,255,0.2)'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#e2e8f0' }}>{item.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>x{item.count}</div>
            </div>
          ))}
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
  padding: '60px 16px 16px 16px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  fontFamily: 'system-ui, sans-serif',
  zIndex: 800
};

const panelStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  padding: '8px 14px',
  display: 'inline-block',
  marginRight: '8px',
  pointerEvents: 'none'
};

const toastStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(220, 38, 38, 0.9)',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '1rem',
  pointerEvents: 'none'
};

const bottomHudStyle: React.CSSProperties = {
  display: 'flex',
  width: '320px',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  pointerEvents: 'none'
};

const barLabelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: '#cbd5e1',
  marginBottom: '2px'
};

const barBgStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  overflow: 'hidden'
};

const barFillStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.2s ease'
};

const inventoryBarStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '6px',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '6px 10px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  pointerEvents: 'none'
};

const itemSlotStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  padding: '4px 8px',
  textAlign: 'center'
};
