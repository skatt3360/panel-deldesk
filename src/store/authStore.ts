import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { getUserRole, UserRole } from '../utils/roles';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login:       (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  register:    (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  clearError:  () => void;
}

export const useAuthStore = create<AuthState>()((setState) => {
  onAuthStateChanged(auth, (user) => {
    setState({ user, role: getUserRole(user?.email), loading: false, initialized: true });
  });

  return {
    user: null,
    role: 'user',
    loading: false,
    error: null,
    initialized: false,

    login: async (email, password) => {
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

    register: async (email, password) => {
      setState({ loading: true, error: null });
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setState({ error: null, loading: false });
      } catch (err: any) {
        const code = err?.code ?? '';
        const msg =
          code === 'auth/email-already-in-use' ? 'Ten adres email jest już zajęty.'
          : code === 'auth/weak-password'        ? 'Hasło musi mieć co najmniej 6 znaków.'
          : code === 'auth/invalid-email'        ? 'Nieprawidłowy format adresu email.'
          : 'Błąd rejestracji. Spróbuj ponownie.';
        setState({ error: msg, loading: false });
      }
    },

    loginGoogle: async () => {
      setState({ loading: true, error: null });
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        setState({ error: null, loading: false });
      } catch (err: any) {
        const code = err?.code ?? '';
        const msg = code === 'auth/popup-closed-by-user' ? 'Zamknięto okno logowania Google.'
          : code === 'auth/cancelled-popup-request' ? 'Anulowano logowanie Google.'
          : 'Błąd logowania przez Google. Spróbuj ponownie.';
        setState({ error: msg, loading: false });
      }
    },

    logout: async () => { await signOut(auth); },

    clearError: () => setState({ error: null }),
  };
});
