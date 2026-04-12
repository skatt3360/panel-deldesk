import { create } from 'zustand';
import { ref, onValue, set, update, remove, get } from 'firebase/database';
import { db } from '../firebase';
import { Equipment } from '../types';

interface EquipmentState {
  equipment: Equipment[];
  initialized: boolean;
  addEquipment: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  assignEquipment: (id: string, personId: string) => Promise<void>;
  returnEquipment: (id: string) => Promise<void>;
}

async function nextEquipmentId(): Promise<string> {
  const snapshot = await get(ref(db, 'equipment'));
  const data = snapshot.val();
  if (!data) return 'EQ-001';
  const max = Object.keys(data).reduce((m, key) => {
    const n = parseInt(key.replace('EQ-', ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `EQ-${String(max + 1).padStart(3, '0')}`;
}

export const useEquipmentStore = create<EquipmentState>()((setState) => {
  onValue(ref(db, 'equipment'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const equipment = (Object.values(data) as Equipment[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setState({ equipment, initialized: true });
    } else {
      setState({ equipment: [], initialized: true });
    }
  });

  return {
    equipment: [],
    initialized: false,

    addEquipment: async (data) => {
      const id = await nextEquipmentId();
      const ts = new Date().toISOString();
      const item: Equipment = { ...data, id, createdAt: ts, updatedAt: ts };
      await set(ref(db, `equipment/${id}`), item);
      return id;
    },

    updateEquipment: async (id, data) => {
      const ts = new Date().toISOString();
      await update(ref(db, `equipment/${id}`), { ...data, updatedAt: ts });
    },

    deleteEquipment: async (id) => {
      await remove(ref(db, `equipment/${id}`));
    },

    assignEquipment: async (id, personId) => {
      const ts = new Date().toISOString();
      await update(ref(db, `equipment/${id}`), {
        status: 'assigned',
        assignedToId: personId,
        assignedAt: ts,
        updatedAt: ts,
      });
    },

    returnEquipment: async (id) => {
      const ts = new Date().toISOString();
      await update(ref(db, `equipment/${id}`), {
        status: 'available',
        assignedToId: null,
        assignedAt: null,
        updatedAt: ts,
      });
    },
  };
});
