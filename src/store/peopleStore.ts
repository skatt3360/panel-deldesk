import { create } from 'zustand';
import { ref, onValue, set, update, remove, get } from 'firebase/database';
import { db } from '../firebase';
import { Person, Department } from '../types';

const DEFAULT_DEPARTMENTS = [
  'Informatyka', 'Administracja', 'Dydaktyka', 'HR', 'Finanse', 'Marketing', 'Zarząd',
];

interface PeopleState {
  people: Person[];
  departments: Department[];
  initialized: boolean;
  addPerson: (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePerson: (id: string, data: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  addDepartment: (name: string, headId?: string) => Promise<string>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

async function nextPersonId(): Promise<string> {
  const snapshot = await get(ref(db, 'people'));
  const data = snapshot.val();
  if (!data) return 'USR-001';
  const max = Object.keys(data).reduce((m, key) => {
    const n = parseInt(key.replace('USR-', ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `USR-${String(max + 1).padStart(3, '0')}`;
}

async function nextDeptId(): Promise<string> {
  const snapshot = await get(ref(db, 'departments'));
  const data = snapshot.val();
  if (!data) return 'DEPT-001';
  const max = Object.keys(data).reduce((m, key) => {
    const n = parseInt(key.replace('DEPT-', ''), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `DEPT-${String(max + 1).padStart(3, '0')}`;
}

let deptInitialized = false;
let peopleInitialized = false;
let checkInit: (() => void) | null = null;

export const usePeopleStore = create<PeopleState>()((setState) => {
  checkInit = () => {
    if (deptInitialized && peopleInitialized) {
      setState({ initialized: true });
    }
  };

  // Subscribe to departments
  onValue(ref(db, 'departments'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const departments = (Object.values(data) as Department[]).sort(
        (a, b) => a.name.localeCompare(b.name, 'pl')
      );
      setState({ departments });
      deptInitialized = true;
      checkInit?.();
    } else if (!deptInitialized) {
      // Seed default departments
      deptInitialized = true;
      const ts = new Date().toISOString();
      const depts: Record<string, Department> = {};
      DEFAULT_DEPARTMENTS.forEach((name, i) => {
        const id = `DEPT-${String(i + 1).padStart(3, '0')}`;
        depts[id] = { id, name, createdAt: ts };
      });
      // Attempt to seed; if it fails (permissions), still mark ready with fallback
      set(ref(db, 'departments'), depts).catch(() => {
        // Write failed (e.g. permissions) — build local fallback so UI isn't blocked
        const fallback: Department[] = DEFAULT_DEPARTMENTS.map((name, i) => ({
          id: `DEPT-${String(i + 1).padStart(3, '0')}`,
          name,
          createdAt: ts,
        }));
        setState({ departments: fallback });
        checkInit?.();
      });
    }
  });

  // Subscribe to people
  onValue(ref(db, 'people'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const people = (Object.values(data) as Person[]).sort(
        (a, b) => a.lastName.localeCompare(b.lastName, 'pl')
      );
      setState({ people });
    } else {
      setState({ people: [] });
    }
    peopleInitialized = true;
    checkInit?.();
  });

  return {
    people: [],
    departments: [],
    initialized: false,

    addPerson: async (data) => {
      const id = await nextPersonId();
      const ts = new Date().toISOString();
      const person: Person = { ...data, id, createdAt: ts, updatedAt: ts };
      await set(ref(db, `people/${id}`), person);
      return id;
    },

    updatePerson: async (id, data) => {
      const ts = new Date().toISOString();
      await update(ref(db, `people/${id}`), { ...data, updatedAt: ts });
    },

    deletePerson: async (id) => {
      await remove(ref(db, `people/${id}`));
    },

    addDepartment: async (name, headId) => {
      const id = await nextDeptId();
      const ts = new Date().toISOString();
      const dept: Department = { id, name, createdAt: ts, ...(headId ? { headId } : {}) };
      try {
        await set(ref(db, `departments/${id}`), dept);
      } catch {
        // Fallback: add locally so the UI works even with permission issues
        setState((s) => ({ departments: [...s.departments, dept].sort((a, b) => a.name.localeCompare(b.name, 'pl')) }));
      }
      return id;
    },

    updateDepartment: async (id, data) => {
      await update(ref(db, `departments/${id}`), data);
    },

    deleteDepartment: async (id) => {
      await remove(ref(db, `departments/${id}`));
    },
  };
});
