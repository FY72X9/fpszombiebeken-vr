import React from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { XRButton } from '@react-three/xr';
import { EffectComposer } from '@react-three/postprocessing';
import App from './App';
import { GameProvider } from './stores/GameStore';
import { XRProvider } from './components/xr/XRProvider';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        shadows={true}
        onCreated={(state) => {
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <XRProvider>
          <App />
        </XRProvider>
      </Canvas>
      <XRButton />
    </GameProvider>
  </React.StrictMode>
);