import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { XR, XRButton, createXRStore } from '@react-three/xr';
import App from './App';
import { UIManager } from './components/ui/UIManager';
import './styles/main.css';

export const xrStore = createXRStore({
  hand: { model: false },
  controller: { grabPointer: false }
});

function Root() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0f172a' }}>
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows={true}
        onCreated={(state) => {
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          state.gl.outputColorSpace = 'srgb';
          state.scene.background = null;
        }}
      >
        <XR store={xrStore}>
          <App />
        </XR>
      </Canvas>
      <UIManager />
      <XRButton store={xrStore} mode="immersive-vr" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);