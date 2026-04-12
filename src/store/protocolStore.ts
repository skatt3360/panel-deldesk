import { create } from 'zustand';
import { ref, onValue, set, update, get } from 'firebase/database';
import { db } from '../firebase';
import { HandoverProtocol } from '../types';
import { useEquipmentStore } from './equipmentStore';

interface ProtocolState {
  protocols: HandoverProtocol[];
  initialized: boolean;
  addProtocol: (data: Omit<HandoverProtocol, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  returnProtocol: (id: string) => Promise<void>;
  cancelProtocol: (id: string) => Promise<void>;
}

async function nextProtocolId(): Promise<string> {
  const snapshot = await get(ref(db, 'protocols'));
  const data = snapshot.val();
  if (!data) return 'PROT-001';
  const max = Object.keys(data).reduce((m, key) => {
    const n = parseInt(key.replace('PROT-', ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `PROT-${String(max + 1).padStart(3, '0')}`;
}

export const useProtocolStore = create<ProtocolState>()((setState) => {
  onValue(ref(db, 'protocols'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const protocols = (Object.values(data) as HandoverProtocol[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setState({ protocols, initialized: true });
    } else {
      setState({ protocols: [], initialized: true });
    }
  });

  return {
    protocols: [],
    initialized: false,

    addProtocol: async (data) => {
      const id = await nextProtocolId();
      const ts = new Date().toISOString();
      const protocol: HandoverProtocol = { ...data, id, createdAt: ts, updatedAt: ts };
      await set(ref(db, `protocols/${id}`), protocol);

      // Mark each piece of equipment as assigned
      const { assignEquipment } = useEquipmentStore.getState();
      await Promise.all(
        data.equipmentIds.map((eqId) => assignEquipment(eqId, data.personId))
      );

      return id;
    },

    returnProtocol: async (id) => {
      const ts = new Date().toISOString();
      const snapshot = await get(ref(db, `protocols/${id}`));
      const protocol = snapshot.val() as HandoverProtocol | null;
      await update(ref(db, `protocols/${id}`), {
        status: 'returned',
        returnedAt: ts,
        updatedAt: ts,
      });
      if (protocol) {
        const { returnEquipment } = useEquipmentStore.getState();
        await Promise.all(protocol.equipmentIds.map((eqId) => returnEquipment(eqId)));
      }
    },

    cancelProtocol: async (id) => {
      const ts = new Date().toISOString();
      const snapshot = await get(ref(db, `protocols/${id}`));
      const protocol = snapshot.val() as HandoverProtocol | null;
      await update(ref(db, `protocols/${id}`), {
        status: 'cancelled',
        updatedAt: ts,
      });
      if (protocol) {
        const { returnEquipment } = useEquipmentStore.getState();
        await Promise.all(protocol.equipmentIds.map((eqId) => returnEquipment(eqId)));
      }
    },
  };
});
