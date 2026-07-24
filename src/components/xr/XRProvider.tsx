import { ReactNode, useEffect } from 'react';
import { XR, createXRStore } from '@react-three/xr';
import { useGameStore } from '../../stores/GameStore';

const xrStore = createXRStore({
  hand: { model: false },
  controller: { 
    grabPointer: false,
    rayPointer: { near: 0.1, far: 20 }
  }
});

interface XRProviderProps {
  children: ReactNode;
}

export function XRProvider({ children }: XRProviderProps) {
  const setVrFlag = useGameStore((s) => s.player.isInVR);
  const updateVRController = useGameStore((s) => s.updateVRController);

  useEffect(() => {
    const unsub = xrStore.subscribe((state, prev) => {
      useGameStore.setState((s) => ({
        player: { ...s.player, isInVR: state === 'visible' }
      }));
    });
    return () => { unsub(); };
  }, []);

  return <XR store={xrStore}>{children</XR>;
}

export { xrStore };