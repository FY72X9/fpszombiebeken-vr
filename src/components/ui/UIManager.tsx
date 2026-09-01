import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/GameStore';
import { ROOM_LABELS } from '../../constants/roomGraph';
import { MobileControls } from './MobileControls';
import { ModeSelector } from './ModeSelector';
import { DialogueManager } from './DialogueManager';
import { getActiveInjectionInfo, cancelInjection } from '../../systems/InjectionSystem';
import { getDamageFlashRatio } from '../../systems/DetectionSystem';

// ─── Storyline text ───────────────────────────────────────────────────────────
const STORY_LINES = [
  '📅 Kampus BINUS Bekasi, 2 hari lalu…',
  '',
  '🧬 Sebuah virus misterius bocor dari lab bioteknologi lantai 2.',
  'Dalam hitungan jam, mahasiswa dan dosen mulai berubah…',
  '',
  '🧟 Zombie mengambil alih koridor, kelas, hingga ruang direktur.',
  'Pintu-pintu dikunci. Sinyal ponsel terputus.',
  '',
  '💉 Kamu adalah BINA — mahasiswi bioteknologi semester 7.',
  'Satu-satunya orang yang punya formula antidot darurat.',
  '',
  '🎯 Misimu: temukan syringe antidot, selamatkan Nusa & para korban,',
  'dan sembuhkan Boss Gatot sebelum semua berakhir.',
  '',
  '⚠️  Bergeraklah diam-diam. Jangan sampai terdeteksi.',
];

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(lines: string[], speed = 30) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (charIdx < line.length) {
      timerRef.current = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else {
      timerRef.current = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, line]);
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, line === '' ? 80 : 400);
    }
    return () => clearTimeout(timerRef.current);
  }, [lineIdx, charIdx, lines, speed]);

  const currentPartial =
    lineIdx < lines.length ? lines[lineIdx].slice(0, charIdx) : '';

  return { displayedLines, currentPartial, done: lineIdx >= lines.length };
}

// ─── Control configs ───────────────────────────────────────────────────────────
const DESKTOP_CONTROLS = [
  { key: 'W A S D', desc: 'Bergerak' },
  { key: 'Mouse', desc: 'Arahkan pandangan' },
  { key: 'Shift', desc: 'Sprint / lari cepat' },
  { key: 'C', desc: 'Jongkok (crouch)' },
  { key: 'E', desc: 'Interaksi (buka pintu, ambil item)' },
  { key: 'Klik', desc: 'Suntik antidot ke zombie' },
  { key: 'Tahan Klik', desc: 'Suntik selama 2.5 detik' },
  { key: 'Esc', desc: 'Kursor bebas / pause' },
];

const MOBILE_CONTROLS = [
  { key: '🕹️ Joystick Kiri', desc: 'Bergerak' },
  { key: '👁️ Swipe Kanan', desc: 'Arahkan pandangan' },
  { key: '🏃 Sprint Button', desc: 'Sprint / lari cepat' },
  { key: '🦆 Crouch Button', desc: 'Jongkok' },
  { key: '🤝 Interact Button', desc: 'Interaksi / buka pintu' },
  { key: '💉 Inject Button', desc: 'Suntik antidot' },
];

const VR_CONTROLS = [
  { key: 'Thumbstick Kiri', desc: 'Bergerak / Smooth Locomotion' },
  { key: 'Thumbstick Kanan', desc: 'Rotasi Pandangan / Snap Turn' },
  { key: 'Right Trigger', desc: 'Suntik Antidot Syringe (Tahan 2.5s)' },
  { key: 'Tombol A / X', desc: 'Interaksi (Buka Pintu / Ambil Item)' },
  { key: 'Grip Controller', desc: 'Sprint / Lari Cepat' },
  { key: 'Tombol B / Y', desc: 'Toggle Jongkok (Crouch)' },
  { key: 'WebXR / AR Button', desc: 'Masuk Mode Immersive MetaQuest 2' },
];

// ─── Main UIManager ────────────────────────────────────────────────────────────
export function UIManager() {
  const [currentMode, setCurrentMode] = useState<'desktop' | 'mobile' | 'vr'>('desktop');
  const [introTab, setIntroTab] = useState<'story' | 'controls' | 'comfort' | 'start'>('story');
  const [hasVR, setHasVR] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const reset = useGameStore((s) => s.reset);
  const accessibility = useGameStore((s) => s.accessibility);
  const updateAccessibility = useGameStore((s) => s.updateAccessibility);
  const player = useGameStore((s) => s.player);
  const currentRoom = useGameStore((s) => s.currentRoom);
  const threatLevel = useGameStore((s) => s.threatLevel);
  const detectionMsg = useGameStore((s) => s.lastDetectionMessage);
  const cure = useGameStore((s) => s.cure);
  const nusaState = useGameStore((s) => s.nusa);

  useEffect(() => {
    setIsTouchDevice(navigator.maxTouchPoints > 0);
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-vr').then((ok: boolean) => setHasVR(ok));
    }
  }, []);

  // ── MENU Phase ────────────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div style={overlayStyle}>
        {/* Background particles / glow */}
        <div style={glowBgStyle} />

        <div style={introPanelStyle}>
          {/* Header with BINUS Official Logos */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/assets/logo/BU-SIS-YellowDot.png"
                  alt="BINUS SIS Logo"
                  style={{ height: '50px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/assets/logo/BU-School-of-Information-System--Satuan.png"
                  alt="School of Information Systems"
                  style={{ height: '50px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', letterSpacing: '4px', color: '#f87171', marginBottom: '6px', textTransform: 'uppercase' }}>
              BINUS University Bekasi • WebXR Survival
            </div>
            <h1 style={titleStyle}>🧟 FPZombieBeken VR</h1>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
              Stealth · Antidot · Selamatkan Kampus
            </div>
          </div>

          {/* Tab bar */}
          <div style={tabBarStyle}>
            {([['story', '📖 Cerita'], ['controls', '🎮 Kontrol'], ['comfort', '⚙️ VR Comfort'], ['start', '🚀 Mulai']] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setIntroTab(tab)} style={introTab === tab ? tabActiveBtnStyle : tabBtnStyle}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={tabContentStyle}>
            {introTab === 'story' && <StoryTab />}
            {introTab === 'controls' && <ControlsTab isTouchDevice={isTouchDevice} hasVR={hasVR} />}
            {introTab === 'comfort' && <ComfortTab accessibility={accessibility} updateAccessibility={updateAccessibility} />}
            {introTab === 'start' && (
              <StartTab
                onStart={() => {
                  reset();
                  setPhase('playing');
                }}
                hasVR={hasVR}
                isTouchDevice={isTouchDevice}
              />
            )}
          </div>

          {/* Footer nav */}
          {introTab !== 'start' && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() =>
                  setIntroTab(introTab === 'story' ? 'controls' : introTab === 'controls' ? 'comfort' : 'start')
                }
                style={nextBtnStyle}
              >
                {introTab === 'story' ? 'Lihat Kontrol →' : introTab === 'controls' ? 'Pengaturan Comfort VR →' : 'Siap Bermain →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────────────────────────
  if (phase === 'gameover') {
    return (
      <div style={overlayStyle}>
        <div style={{ ...introPanelStyle, maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '8px' }}>💀</div>
          <h1 style={{ fontSize: '2.5rem', color: '#ef4444', margin: '0 0 12px 0' }}>GAME OVER</h1>
          <p style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>
            Bina tertangkap zombie dan tidak dapat melanjutkan misi.<br />
            Coba lagi dan bergerak lebih diam-diam!
          </p>
          <button onClick={() => { cancelInjection(); reset(); }} style={startBtnStyle}>
            🔄 Coba Lagi (Kembali ke Intro)
          </button>
          <button onClick={() => { cancelInjection(); reset(); }} style={{ ...tabBtnStyle, marginTop: '10px', width: '100%' }}>
            🏠 Menu Utama
          </button>
        </div>
      </div>
    );
  }

  // ── WIN ───────────────────────────────────────────────────────────────────────
  if (phase === 'win') {
    return (
      <div style={overlayStyle}>
        <div style={{ ...introPanelStyle, maxWidth: '460px', textAlign: 'center', borderColor: '#22c55e' }}>
          <div style={{ fontSize: '4rem', marginBottom: '8px' }}>🏆</div>
          <h1 style={{ fontSize: '2.5rem', color: '#22c55e', margin: '0 0 12px 0' }}>MISI BERHASIL!</h1>
          <p style={{ color: '#e2e8f0', marginBottom: '28px', lineHeight: 1.6 }}>
            Nusa berhasil diselamatkan! Kampus BINUS Bekasi telah diamankan.<br />
            Terima kasih telah menjadi pahlawan bioteknologi!
          </p>
          <button onClick={() => { cancelInjection(); reset(); setPhase('menu'); }} style={{ ...startBtnStyle, background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
            🏠 Menu Utama & Reset
          </button>
        </div>
      </div>
    );
  }

  // ── IN-GAME HUD ───────────────────────────────────────────────────────────────
  const roomTitle = ROOM_LABELS[currentRoom as keyof typeof ROOM_LABELS] || currentRoom;
  const threatColors = ['#22c55e', '#eab308', '#f97316', '#ef4444'];
  const threatText = ['🟢 Aman', '🟡 Waspada', '🟠 Dikejar', '🔴 Diserang'];
  const antidoteItem = player.inventory.find((i) => i.type === 'antidote');
  const syringeCount = antidoteItem ? antidoteItem.count : 0;
  const dosenCuredCount = (cure.indiCured ? 1 : 0) + (cure.willyCured ? 1 : 0);

  const activeInj = getActiveInjectionInfo();
  const flashRatio = getDamageFlashRatio();

  return (
    <>
      <ModeSelector currentMode={currentMode} onSelectMode={setCurrentMode} />
      <DialogueManager />

      {/* Red Blood Screen Damage Flash Overlay */}
      {flashRatio > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            boxShadow: `inset 0 0 120px ${Math.round(flashRatio * 160)}px rgba(239, 68, 68, ${flashRatio * 0.85})`,
            background: `rgba(239, 68, 68, ${flashRatio * 0.2})`,
            zIndex: 900,
            transition: 'opacity 0.1s ease-out'
          }}
        />
      )}

      <div style={hudContainerStyle}>
        {/* Top-Left: Status Badge */}
        <div style={compactCornerBadgeStyle}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>
            📍 {roomTitle}
          </div>
          <div style={{ fontSize: '0.75rem', color: threatColors[threatLevel], fontWeight: 600, marginTop: '1px' }}>
            {threatText[threatLevel]}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
            <span style={{ color: syringeCount === 0 ? '#f87171' : '#38bdf8', fontWeight: 700 }}>
              💉 {syringeCount} Antidot {syringeCount === 0 ? '⚠️' : ''}
            </span>
            <span style={{ color: nusaState.isRescued ? '#4ade80' : '#f87171' }}>
              👤 Nusa {nusaState.isRescued ? '✓' : '✗'}
            </span>
            <span style={{ color: cure.gatotCured ? '#4ade80' : '#f87171' }}>
              🎯 Gatot {cure.gatotCured ? '✓' : '✗'}
            </span>
            <span style={{ color: dosenCuredCount >= 2 ? '#4ade80' : '#fbbf24' }}>
              🏫 Dosen {dosenCuredCount}/2
            </span>
          </div>
        </div>

        {/* Center-top: Detection toast, Empty Antidote Banner, or Injection progress gauge */}
        {activeInj ? (
          <div style={injectionGaugeStyle}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💉 MENYUNTIK ANTIDOT: {activeInj.progressPercent}%
            </div>
            <div style={barBgStyle}>
              <div style={{ ...barFillStyle, width: `${activeInj.progressPercent}%`, backgroundColor: '#38bdf8' }} />
            </div>
          </div>
        ) : syringeCount === 0 ? (
          <div style={{ ...toastStyle, background: 'rgba(185, 28, 28, 0.9)', border: '1px solid #ef4444', color: '#ffffff' }}>
            ⚠️ Antidot Habis! Ambil di Refill Station Ruang Dosen (Lantai 1)
          </div>
        ) : detectionMsg ? (
          <div style={toastStyle}>{detectionMsg}</div>
        ) : null}

        {/* Bottom-Left: HP & Stamina */}
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

      <MobileControls active={currentMode === 'mobile'} />
    </>
  );
}

// ─── Story Tab ─────────────────────────────────────────────────────────────────
function StoryTab() {
  const { displayedLines, currentPartial, done } = useTypewriter(STORY_LINES, 25);
  return (
    <div style={{ minHeight: '220px', lineHeight: 1.8, fontSize: '0.92rem', color: '#e2e8f0' }}>
      {displayedLines.map((line, i) => (
        <div key={i} style={{ marginBottom: line === '' ? '6px' : '0' }}>{line}</div>
      ))}
      {!done && (
        <span style={{ color: '#f8fafc' }}>
          {currentPartial}
          <span style={{ animation: 'blink 0.7s infinite', opacity: 1 }}>█</span>
        </span>
      )}
      {done && (
        <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.15)', borderLeft: '3px solid #ef4444', borderRadius: '4px', fontSize: '0.85rem', color: '#fca5a5' }}>
          ⚠️ Waspada: Zombie bisa mendeteksi suara dan gerakan. Bergerak pelan saat crouch!
        </div>
      )}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Controls Tab ──────────────────────────────────────────────────────────────
function ControlsTab({ isTouchDevice, hasVR: _hasVR }: { isTouchDevice: boolean; hasVR: boolean }) {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile' | 'vr'>(
    isTouchDevice ? 'mobile' : 'desktop'
  );
  const controlMap = activeDevice === 'vr' ? VR_CONTROLS : activeDevice === 'mobile' ? MOBILE_CONTROLS : DESKTOP_CONTROLS;

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {(['desktop', 'mobile', 'vr'] as Array<'desktop' | 'mobile' | 'vr'>).map((d) => (
          <button key={d} onClick={() => setActiveDevice(d)} style={activeDevice === d ? tabActiveBtnStyle : { ...tabBtnStyle, fontSize: '0.75rem', padding: '5px 10px' }}>
            {d === 'desktop' ? '🖥️ Desktop' : d === 'mobile' ? '📱 Mobile' : '🥽 MetaQuest 2'}
          </button>
        ))}
      </div>
      {activeDevice === 'vr' && (
        <div style={{ padding: '8px 12px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', fontSize: '0.8rem', color: '#7dd3fc', marginBottom: '10px' }}>
          🥽 <strong>MetaQuest 2 WebXR / AR Guide:</strong> Hubungkan MetaQuest 2 via Oculus Browser, klik Enter VR di pojok bawah.
        </div>
      )}
      <div style={{ display: 'grid', gap: '6px' }}>
        {controlMap.map(({ key, desc }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.4)', whiteSpace: 'nowrap', minWidth: '95px', textAlign: 'center' }}>
              {key}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Comfort & Accessibility Tab ──────────────────────────────────────────────
function ComfortTab({
  accessibility,
  updateAccessibility
}: {
  accessibility: any;
  updateAccessibility: (s: any) => void;
}) {
  return (
    <div style={{ display: 'grid', gap: '12px', fontSize: '0.88rem', color: '#e2e8f0' }}>
      {/* Turn Mode */}
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontWeight: 700, color: '#c084fc', marginBottom: '4px' }}>🔄 Mode Putaran VR (Turn Mode)</div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
          Gunakan Snap Turn untuk mencegah rasa pusing / motion sickness di VR.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Snap 45° (Rekomendasi)', mode: 'snap', angle: 45 },
            { label: 'Snap 30°', mode: 'snap', angle: 30 },
            { label: 'Smooth Turn', mode: 'smooth', angle: 45 }
          ].map((opt, i) => {
            const isSelected = accessibility.turnMode === opt.mode && (opt.mode === 'smooth' || accessibility.snapTurnAngle === opt.angle);
            return (
              <button
                key={i}
                onClick={() => updateAccessibility({ turnMode: opt.mode, snapTurnAngle: opt.angle })}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #a855f7' : '1px solid #334155',
                  background: isSelected ? '#7c3aed' : '#1e293b',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comfort Vignette */}
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>🛡️ Comfort Vignette (Peredam Pusing Gerak)</div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
          Meredupkan tepi penglihatan secara dinamis saat berjalan/berputar untuk kenyamanan mata.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['high', 'medium', 'low', 'off'] as const).map((lvl) => {
            const isSelected = accessibility.comfortVignette === lvl;
            return (
              <button
                key={lvl}
                onClick={() => updateAccessibility({ comfortVignette: lvl })}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                  background: isSelected ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {lvl.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* VR Height Calibration */}
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ fontWeight: 700, color: '#fde047' }}>🧍 Kalibrasi Tinggi Pandangan VR (Anti-Jongkok)</div>
          <span style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 700 }}>
            +{Math.round((accessibility.vrHeightOffset ?? 0.25) * 100)} cm
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
          Menaikkan posisi mata pemain di VR agar sejajar dengan eye-level normal (~1.65m) dan tidak terasa jongkok.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => updateAccessibility({ vrHeightOffset: 0.45 })}
            style={{
              flex: 1,
              padding: '7px 8px',
              borderRadius: '6px',
              border: accessibility.vrHeightOffset === 0.45 ? '1px solid #eab308' : '1px solid #334155',
              background: accessibility.vrHeightOffset === 0.45 ? '#ca8a04' : '#1e293b',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🪑 Mode Duduk (+45cm)
          </button>
          <button
            onClick={() => updateAccessibility({ vrHeightOffset: 0.25 })}
            style={{
              flex: 1,
              padding: '7px 8px',
              borderRadius: '6px',
              border: accessibility.vrHeightOffset === 0.25 ? '1px solid #eab308' : '1px solid #334155',
              background: accessibility.vrHeightOffset === 0.25 ? '#ca8a04' : '#1e293b',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🧍 Berdiri (+25cm)
          </button>
          <button
            onClick={() => updateAccessibility({ vrHeightOffset: 0.0 })}
            style={{
              flex: 1,
              padding: '7px 8px',
              borderRadius: '6px',
              border: accessibility.vrHeightOffset === 0.0 ? '1px solid #eab308' : '1px solid #334155',
              background: accessibility.vrHeightOffset === 0.0 ? '#ca8a04' : '#1e293b',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset (0cm)
          </button>
        </div>
      </div>

      {/* VR HUD Placement Position */}
      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>📍 Posisi Panel VR HUD</div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
          Atur posisi melayang panel VR HUD agar nyaman dibaca dan tidak menghalangi pandangan.
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '📍 Bawah (Rekomendasi Nyaman)', val: 'bottom' },
            { label: '📍 Tengah (Eye-Level)', val: 'center' },
            { label: '📍 Atas', val: 'top' },
          ].map((p) => {
            const isSelected = (accessibility.hudPosition || 'bottom') === p.val;
            return (
              <button
                key={p.val}
                onClick={() => updateAccessibility({ hudPosition: p.val as any })}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                  background: isSelected ? '#0284c7' : '#1e293b',
                  color: '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Start Tab ─────────────────────────────────────────────────────────────────
function StartTab({ onStart, hasVR, isTouchDevice }: { onStart: () => void; hasVR: boolean; isTouchDevice: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Objective checklist */}
      <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>Objektif Misi</div>
        {[
          ['💉', 'Temukan Antidot Syringe di Lobby'],
          ['🧟', 'Sembuhkan zombie di setiap ruangan'],
          ['👤', 'Selamatkan Nusa di Kelas 2A'],
          ['🎯', 'Sembuhkan Boss Gatot di Ruang Direktur'],
          ['🏃', 'Bawa Nusa ke gerbang utama'],
        ].map(([icon, txt], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', fontSize: '0.87rem', color: '#e2e8f0' }}>
            <span>{icon}</span>
            <span>{txt}</span>
          </div>
        ))}
      </div>

      {/* Device hint */}
      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>
        {isTouchDevice ? '📱 Mode Mobile terdeteksi — gunakan virtual joystick' : '🖥️ Mode Desktop — klik layar untuk lock cursor & mulai bergerak'}
        {hasVR && ' | 🥽 VR headset terdeteksi'}
      </div>

      <button onClick={onStart} style={startBtnStyle}>
        ⚡ MULAI MISI
      </button>

      <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#475569' }}>
        Tekan <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px', border: '1px solid #334155' }}>E</kbd> untuk interaksi,{' '}
        <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px', border: '1px solid #334155' }}>C</kbd> untuk jongkok
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0,
  width: '100vw', height: '100vh',
  background: 'radial-gradient(ellipse at 50% 60%, rgba(30,58,138,0.35) 0%, rgba(2,6,23,0.98) 70%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, pointerEvents: 'auto',
};

const glowBgStyle: React.CSSProperties = {
  position: 'absolute', top: '30%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px', height: '400px',
  background: 'radial-gradient(ellipse, rgba(220,38,38,0.12), transparent 70%)',
  pointerEvents: 'none',
};

const introPanelStyle: React.CSSProperties = {
  position: 'relative',
  background: 'rgba(15, 23, 42, 0.92)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  borderRadius: '20px',
  padding: '32px 36px',
  maxWidth: '560px',
  width: '90vw',
  boxShadow: '0 0 60px rgba(220,38,38,0.15), 0 25px 50px rgba(0,0,0,0.6)',
  pointerEvents: 'auto',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.4rem',
  fontWeight: 900,
  background: 'linear-gradient(135deg, #ef4444, #f97316)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: '0',
  lineHeight: 1.1,
};

const tabBarStyle: React.CSSProperties = {
  display: 'flex', gap: '6px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  paddingBottom: '14px', marginBottom: '18px',
};

const tabBtnStyle: React.CSSProperties = {
  flex: 1, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px', color: '#94a3b8',
  padding: '8px 12px', fontSize: '0.82rem',
  fontWeight: 600, cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const tabActiveBtnStyle: React.CSSProperties = {
  ...tabBtnStyle,
  background: 'rgba(220,38,38,0.2)',
  borderColor: 'rgba(220,38,38,0.5)',
  color: '#fca5a5',
};

const tabContentStyle: React.CSSProperties = {
  minHeight: '240px',
  overflowY: 'auto',
  maxHeight: '340px',
  paddingRight: '4px',
};

const nextBtnStyle: React.CSSProperties = {
  background: 'rgba(99,102,241,0.15)',
  border: '1px solid rgba(99,102,241,0.4)',
  color: '#a5b4fc', padding: '10px 24px',
  borderRadius: '8px', cursor: 'pointer',
  fontSize: '0.9rem', fontWeight: 600,
};

const startBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
  color: '#ffffff', border: 'none',
  padding: '14px 40px', fontSize: '1.1rem',
  fontWeight: 800, borderRadius: '10px',
  cursor: 'pointer', letterSpacing: '1px',
  boxShadow: '0 0 20px rgba(220,38,38,0.4)',
  width: '100%',
};

const hudContainerStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0,
  width: '100vw', height: '100vh',
  pointerEvents: 'none', padding: '14px',
  boxSizing: 'border-box',
  display: 'flex', flexDirection: 'column',
  justifyContent: 'space-between',
  fontFamily: '"Inter", system-ui, sans-serif',
  zIndex: 800,
};

const compactCornerBadgeStyle: React.CSSProperties = {
  background: 'rgba(2, 6, 23, 0.82)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(56,189,248,0.25)',
  borderRadius: '10px', padding: '8px 12px',
  maxWidth: '310px', pointerEvents: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
};

const toastStyle: React.CSSProperties = {
  position: 'absolute', top: '13%',
  left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(220,38,38,0.92)',
  backdropFilter: 'blur(8px)',
  color: '#fff', padding: '8px 20px',
  borderRadius: '20px', fontWeight: 700,
  fontSize: '0.88rem', pointerEvents: 'none',
  boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
};

const injectionGaugeStyle: React.CSSProperties = {
  position: 'absolute', top: '12%',
  left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1.5px solid #38bdf8',
  color: '#fff', padding: '10px 24px',
  borderRadius: '12px', textAlign: 'center',
  minWidth: '240px', pointerEvents: 'none',
  boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
};

const compactBottomHudStyle: React.CSSProperties = {
  display: 'flex', width: '210px',
  background: 'rgba(2, 6, 23, 0.82)',
  backdropFilter: 'blur(10px)',
  padding: '7px 12px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.08)',
  pointerEvents: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
};

const barLabelStyle: React.CSSProperties = {
  fontSize: '0.62rem', fontWeight: 700,
  color: '#94a3b8', marginBottom: '3px',
};

const barBgStyle: React.CSSProperties = {
  width: '100%', height: '5px',
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: '3px', overflow: 'hidden',
};

const barFillStyle: React.CSSProperties = {
  height: '100%', transition: 'width 0.25s ease',
  borderRadius: '3px',
};
