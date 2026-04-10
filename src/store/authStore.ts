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

export interface AuthState {
  user:                 User | null;
  role:                 UserRole;
  googleAccessToken:    string | null;
  loading:              boolean;
  googleLoading:        boolean;
  error:                string | null;
  initialized:          boolean;
  login:                (email: string, password: string) => Promise<void>;
  loginGoogle:          () => Promise<void>;
  register:             (email: string, password: string) => Promise<void>;
  logout:               () => Promise<void>;
  clearError:           () => void;
  setGoogleAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()((setState) => {

  // Auth state listener — always active
  onAuthStateChanged(auth, (user) => {
    setState({
      user,
      role:        getUserRole(user?.email),
      loading:     false,
      initialized: true,
    });
  });

  return {
    user:              null,
    role:              'user',
    googleAccessToken: null,
    loading:           false,
    googleLoading:     false,
    error:             null,
    initialized:       false,

    login: async (email, password) => {
      setState({ loading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setState({ loading: false });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        const msg =
          code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
            ? 'Nieprawidłowy email lub hasło.'
            : code === 'auth/too-many-requests'
            ? 'Za dużo nieudanych prób. Spróbuj ponownie później.'
            : `Błąd logowania (${code}).`;
        setState({ error: msg, loading: false });
      }
    },

    register: async (email, password) => {
      setState({ loading: true, error: null });
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setState({ loading: false });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        const msg =
          code === 'auth/email-already-in-use' ? 'Ten adres email jest już zajęty.'
          : code === 'auth/weak-password'        ? 'Hasło musi mieć co najmniej 6 znaków.'
          : `Błąd rejestracji (${code}).`;
        setState({ error: msg, loading: false });
      }
    },

    loginGoogle: async () => {
      setState({ googleLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken ?? null;
        // onAuthStateChanged will fire automatically and set user/role
        setState({ googleAccessToken: token, googleLoading: false, error: null });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        // User just closed the popup — not an error
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ googleLoading: false });
          return;
        }
        const msg =
          code === 'auth/popup-blocked'
            ? 'Popup zablokowany przez przeglądarkę. Zezwól na popupy dla tej strony i spróbuj ponownie.'
            : code === 'auth/unauthorized-domain'
            ? 'Domena nie jest autoryzowana w Firebase. Dodaj ją w Firebase Console → Authentication → Authorized domains.'
            : `Błąd Google (${code || 'nieznany'}).`;
        setState({ error: msg, googleLoading: false });
      }
    },

    logout: async () => {
      await signOut(auth);
      setState({ googleAccessToken: null });
    },

    clearError:           () => setState({ error: null }),
    setGoogleAccessToken: (token) => setState({ googleAccessToken: token }),
  };
});
