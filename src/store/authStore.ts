import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
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
  googleLoading:        boolean;   // separate flag for redirect-in-progress
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

  // 1. Subscribe to auth state IMMEDIATELY — never wait for redirect result
  onAuthStateChanged(auth, (user) => {
    setState({
      user,
      role:        getUserRole(user?.email),
      loading:     false,
      initialized: true,
    });
  });

  // 2. Check for redirect result SEPARATELY (runs once on page load)
  //    If user came back from Google redirect, capture their access token
  getRedirectResult(auth)
    .then((result) => {
      if (!result) return;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token      = credential?.accessToken ?? null;
      setState({ googleAccessToken: token, googleLoading: false });
    })
    .catch((err: unknown) => {
      const code = (err as { code?: string })?.code ?? '';
      // Ignore harmless cases
      if (code === 'auth/no-auth-event' || code === 'auth/null-user') return;
      const msg =
        code === 'auth/unauthorized-domain'
          ? 'Domena nie jest autoryzowana w Firebase. Dodaj ją w Firebase Console → Authentication → Authorized domains.'
          : `Błąd logowania Google (${code}).`;
      setState({ error: msg, googleLoading: false });
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
            : code === 'auth/user-disabled'
            ? 'To konto zostało wyłączone.'
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
          : code === 'auth/invalid-email'        ? 'Nieprawidłowy format adresu email.'
          : `Błąd rejestracji (${code}).`;
        setState({ error: msg, loading: false });
      }
    },

    loginGoogle: async () => {
      // Always use full-page redirect — most reliable across Netlify, Safari, etc.
      // Popup can silently fail when domain isn't in Google Cloud Console allowlist.
      setState({ googleLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithRedirect(auth, provider);
        // ↑ This redirects away; code below never runs.
        // On return, getRedirectResult() above handles the token.
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        setState({
          googleLoading: false,
          error: `Nie można uruchomić logowania Google (${code || 'nieznany błąd'}).`,
        });
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
