import { useGameStore } from '../../stores/GameStore';
import { ROOM_LABELS } from '../../constants/roomGraph';

export function UIManager() {
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
  const threatText = ['Aman (Calm)', 'Waspada (Alert)', 'Pengejaran (Chase)', 'Diserang (Attack)'];

  return (
    <div style={hudContainerStyle}>
      {/* Top Left: Room & Threat */}
      <div style={panelStyle}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc' }}>{roomTitle}</div>
        <div style={{ color: threatColors[threatLevel], fontWeight: '600', marginTop: '4px' }}>
          Status: {threatText[threatLevel]}
        </div>
      </div>

      {/* Top Right: Objectives & Cure status */}
      <div style={panelStyle}>
        <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Misi: Selamatkan Nusa dari Kelas 2A & Cure Dosen</div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
          Cured: Willy [{cure.willyCured ? '✓' : '✗'}] | Indi [{cure.indiCured ? '✓' : '✗'}] | Gatot [{cure.gatotCured ? '✓' : '✗'}]
        </div>
      </div>

      {/* Subtitle / Detection Notification Toast */}
      {detectionMsg && (
        <div style={toastStyle}>
          {detectionMsg}
        </div>
      )}

      {/* Bottom HUD: Health & Stamina */}
      <div style={bottomHudStyle}>
        <div style={{ flex: 1 }}>
          <div style={barLabelStyle}>HP: {Math.round(player.health)} / {player.maxHealth}</div>
          <div style={barBgStyle}>
            <div style={{ ...barFillStyle, width: `${(player.health / player.maxHealth) * 100}%`, backgroundColor: '#ef4444' }} />
          </div>
        </div>

        <div style={{ flex: 1, marginLeft: '16px' }}>
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
            <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{item.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>x{item.count}</div>
          </div>
        ))}
      </div>
    </div>
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
  zIndex: 9999
};

const cardStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '2px solid #334155',
  borderRadius: '16px',
  padding: '40px',
  textAlign: 'center',
  maxWidth: '480px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
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
  transition: 'transform 0.1s ease'
};

const hudContainerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  padding: '20px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  fontFamily: 'system-ui, sans-serif'
};

const panelStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '12px 18px',
  display: 'inline-block',
  marginRight: '12px'
};

const toastStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(220, 38, 38, 0.9)',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '30px',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
};

const bottomHudStyle: React.CSSProperties = {
  display: 'flex',
  width: '360px',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const barLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: '#cbd5e1',
  marginBottom: '4px'
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
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '8px',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '8px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const itemSlotStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  padding: '6px 12px',
  textAlign: 'center'
};
