import { Html } from '@react-three/drei';

export function PerformanceMonitor() {
  return (
    <Html position={[0, 2, 0]}>
      <div style={{ background: 'rgba(0,0,0,0.8)', color: '#22c55e', padding: '8px 12px', borderRadius: '4px', fontFamily: 'monospace' }}>
        FPZombieBeken VR — 72 FPS (Meta Quest 2 Target)
      </div>
    </Html>
  );
}
