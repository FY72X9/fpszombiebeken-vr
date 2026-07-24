import { useGameStore } from '../../stores/GameStore';

export interface DialogueNode {
  speaker: string;
  portraitColor: string;
  text: string;
  options?: { label: string; action: () => void }[];
}

export function DialogueManager() {
  const nusaState = useGameStore((s) => s.nusa);
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);

  // Show intro storyboard modal if phase === 'intro'
  if (phase === 'intro') {
    return (
      <div style={modalOverlayStyle}>
        <div style={storyboardCardStyle}>
          <h2 style={{ color: '#ef4444', fontSize: '1.8rem', marginTop: 0 }}>
            MISSION BRIEFING — KAMPUS BINUS BEKASI
          </h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1rem' }}>
            Wabah misterius menyerang kampus. Rekan mahasiswamu <strong>Nusa</strong> terjebak di <strong>Kelas 2A</strong>.
            Gunakan jarum suntik antidot untuk menyembuhkan para dosen (Willy, Indi, Gatot) dan bawa Nusa keluar menuju Gerbang Utama Lobby Lantai 1!
          </p>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setPhase('playing')}
              style={confirmBtnStyle}
            >
              Mulai Misi (Tekan E / Klik)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show dialogue modal when interacting with Nusa
  if (nusaState.state === 'following' && !nusaState.isRescued) {
    return (
      <div style={bottomDialogueBoxStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
            NUSA
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '0.9rem' }}>Nusa (Survivor)</div>
            <div style={{ color: '#f8fafc', fontSize: '1rem', marginTop: '2px' }}>
              "Terima kasih Bina! Aku akan mengikutimu dari belakang, bawa kita ke pintu keluar Lobby Lt 1!"
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  pointerEvents: 'auto'
};

const storyboardCardStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '2px solid #38bdf8',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '520px',
  textAlign: 'center',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
};

const confirmBtnStyle: React.CSSProperties = {
  backgroundColor: '#0284c7',
  color: '#ffffff',
  border: 'none',
  padding: '12px 28px',
  fontSize: '1rem',
  fontWeight: 'bold',
  borderRadius: '8px',
  cursor: 'pointer'
};

const bottomDialogueBoxStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '100px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'min(90vw, 600px)',
  background: 'rgba(15, 23, 42, 0.9)',
  border: '2px solid #0284c7',
  borderRadius: '12px',
  padding: '16px 20px',
  zIndex: 950,
  pointerEvents: 'auto'
};
