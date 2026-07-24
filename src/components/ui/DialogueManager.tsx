import { useGameStore } from '../../stores/GameStore';

export function DialogueManager() {
  const nusaState = useGameStore((s) => s.nusa);

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
