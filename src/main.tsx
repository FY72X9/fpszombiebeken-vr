import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { XRButton } from '@react-three/xr';
import App from './App';
import { XRProvider, xrStore } from './components/xr/XRProvider';
import './styles/main.css';

function Root() {
  return (
    <XRProvider>
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        shadows={true}
        onCreated={(state) => {
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          state.gl.outputColorSpace = 'srgb';
          state.gl.toneMapping = 0;
          state.scene.background = null;
        }}
      >
        <App />
      </Canvas>
      <XRButton store={xrStore} mode="immersive-vr" />
      <div className="ui-overlay" id="ui-overlay-root" />
    </XRProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);