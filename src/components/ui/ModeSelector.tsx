import { xrStore } from '../xr/XRProvider';

interface ModeSelectorProps {
  currentMode: 'desktop' | 'mobile' | 'vr';
  onSelectMode: (mode: 'desktop' | 'mobile' | 'vr') => void;
}

export function ModeSelector({ currentMode, onSelectMode }: ModeSelectorProps) {
  const handleSelectMode = (mode: 'desktop' | 'mobile' | 'vr') => {
    onSelectMode(mode);
    if (mode === 'vr') {
      try {
        xrStore.enterVR();
      } catch {
        // VR fallback
      }
    }
  };

  return (
    <div style={modeSelectorStyle}>
      <button
        style={{
          ...modeBtnStyle,
          backgroundColor: currentMode === 'desktop' ? '#0284c7' : 'rgba(15, 23, 42, 0.7)'
        }}
        onClick={() => handleSelectMode('desktop')}
      >
        🖥️ Desktop (WASD)
      </button>

      <button
        style={{
          ...modeBtnStyle,
          backgroundColor: currentMode === 'mobile' ? '#0284c7' : 'rgba(15, 23, 42, 0.7)'
        }}
        onClick={() => handleSelectMode('mobile')}
      >
        📱 Mobile Touch
      </button>

      <button
        style={{
          ...modeBtnStyle,
          backgroundColor: currentMode === 'vr' ? '#dc2626' : 'rgba(15, 23, 42, 0.7)'
        }}
        onClick={() => handleSelectMode('vr')}
      >
        🥽 WebXR VR
      </button>
    </div>
  );
}

const modeSelectorStyle: React.CSSProperties = {
  position: 'fixed',
  top: '16px',
  right: '24px',
  display: 'flex',
  gap: '8px',
  zIndex: 900,
  pointerEvents: 'auto'
};

const modeBtnStyle: React.CSSProperties = {
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '6px 14px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  borderRadius: '20px',
  cursor: 'pointer',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease'
};
