import { ReactNode, useEffect } from 'react';
import { XR, createXRStore } from '@react-three/xr';
import { useGameStore } from '../../stores/GameStore';

const xrStore = createXRStore({
  hand: { model: false },
  controller: { 
    grabPointer: false
  }
});

interface XRProviderProps {
  children: ReactNode;
}

export function XRProvider({ children }: XRProviderProps) {
  useEffect(() => {
    const unsub = xrStore.subscribe((state) => {
      useGameStore.setState((s) => ({
        player: { ...s.player, isInVR: !!state.session }
      }));
    });
    return () => { unsub(); };
  }, []);

  return <XR store={xrStore}>{children}</XR>;
}

export { xrStore };