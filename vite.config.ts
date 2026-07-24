import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    react(),
    glsl()
  ],
  server: {
    host: true,
    port: 5173,
    https: false
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr']
  }
});