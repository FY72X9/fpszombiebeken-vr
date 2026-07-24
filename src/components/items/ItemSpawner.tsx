import { useGameStore } from '../../stores/GameStore';
import { CelMaterial } from '../../shaders/CelMaterial';

export function ItemSpawner() {
  const currentRoom = useGameStore((s) => s.currentRoom);
  const addInventoryItem = useGameStore((s) => s.addInventoryItem);
  const setDetectionMessage = useGameStore((s) => s.setDetectionMessage);

  const pickupItem = (type: any, name: string, count: number) => (e: any) => {
    e.stopPropagation();
    addInventoryItem(`${type}_${Date.now()}`, type, name, count);
    setDetectionMessage(`Mendapatkan: ${name} x${count}`);
    setTimeout(() => setDetectionMessage(null), 2500);
  };

  return (
    <group key={currentRoom}>
      {/* Kelas 2C Antidote Cache */}
      {currentRoom === 'kelas_2c' && (
        <group position={[0, 0.9, 0]} onClick={pickupItem('antidote', 'Antidot Syringe', 3)}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
            <CelMaterial color="#22c55e" rimColor="#86efac" />
          </mesh>
        </group>
      )}

      {/* Handgun & Ammo in Ruang Direktur */}
      {currentRoom === 'ruang_direktur' && (
        <group position={[-1, 0.8, -2]} onClick={pickupItem('handgun', 'Pistol 9mm', 1)}>
          <mesh>
            <boxGeometry args={[0.3, 0.15, 0.4]} />
            <CelMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Bandages in Lobby L1 */}
      {currentRoom === 'lobby_l1' && (
        <group position={[-1, 0.8, -4]} onClick={pickupItem('bandage', 'Bandage', 2)}>
          <mesh>
            <boxGeometry args={[0.2, 0.15, 0.2]} />
            <CelMaterial color="#f8fafc" />
          </mesh>
        </group>
      )}
    </group>
  );
}
