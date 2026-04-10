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
  loginGoogle:          (forceConsent?: boolean) => Promise<void>;
  register:             (email: string, password: string) => Promise<void>;
  logout:               () => Promise<void>;
  clearError:           () => void;
  setGoogleAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()((setState) => {

  onAuthStateChanged(auth, (user) => {
    setState({
      user,
      role:        getUserRole(user?.email),
      loading:     false,
      initialized: true,
    });
  });

  const doGooglePopup = async (forceConsent: boolean) => {
    const provider = new GoogleAuthProvider();
    // Request Gmail read access
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.setCustomParameters({
      prompt: forceConsent ? 'consent' : 'select_account',
      // include_granted_scopes ensures previously granted scopes are still included
      include_granted_scopes: 'true',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken ?? null;
    setState({ googleAccessToken: token, googleLoading: false, error: null });
    return token;
  };

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

    loginGoogle: async (forceConsent = false) => {
      setState({ googleLoading: true, error: null });
      try {
        await doGooglePopup(forceConsent);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ googleLoading: false });
          return;
        }
        const msg =
          code === 'auth/popup-blocked'
            ? 'Popup zablokowany. Zezwól na popupy dla tej strony i spróbuj ponownie.'
            : code === 'auth/unauthorized-domain'
            ? 'Domena nie jest autoryzowana — dodaj ją w Firebase Console → Authentication → Authorized domains.'
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
