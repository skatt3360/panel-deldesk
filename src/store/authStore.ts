import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((setState) => {
  onAuthStateChanged(auth, (user) => {
    setState({ user, loading: false, initialized: true });
  });

  return {
    user: null,
    loading: false,
    error: null,
    initialized: false,

    login: async (email: string, password: string) => {
      setState({ loading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setState({ error: null, loading: false });
      } catch (err: any) {
        const code = err?.code ?? '';
        const msg =
          code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
            ? 'Nieprawidłowy email lub hasło.'
            : code === 'auth/too-many-requests'
            ? 'Za dużo nieudanych prób. Spróbuj ponownie później.'
            : code === 'auth/user-disabled'
            ? 'To konto zostało wyłączone.'
            : 'Błąd logowania. Sprawdź dane i spróbuj ponownie.';
        setState({ error: msg, loading: false });
      }
    },

    register: async (email: string, password: string) => {
      setState({ loading: true, error: null });
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setState({ error: null, loading: false });
      } catch (err: any) {
        const code = err?.code ?? '';
        const msg =
          code === 'auth/email-already-in-use'
            ? 'Ten adres email jest już zajęty.'
            : code === 'auth/weak-password'
            ? 'Hasło musi mieć co najmniej 6 znaków.'
            : code === 'auth/invalid-email'
            ? 'Nieprawidłowy format adresu email.'
            : 'Błąd rejestracji. Spróbuj ponownie.';
        setState({ error: msg, loading: false });
      }
    },

    logout: async () => {
      await signOut(auth);
    },

    clearError: () => setState({ error: null }),
  };
});
