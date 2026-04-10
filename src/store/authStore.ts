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
import { requestGmailToken } from '../utils/gmailToken';

export interface AuthState {
  user:                 User | null;
  role:                 UserRole;
  googleAccessToken:    string | null;   // Gmail API token (from GIS, NOT Firebase)
  loading:              boolean;
  googleLoading:        boolean;
  gmailLoading:         boolean;         // specifically for GIS token request
  error:                string | null;
  initialized:          boolean;
  login:                (email: string, password: string) => Promise<void>;
  loginGoogle:          () => Promise<void>;
  requestGmailAccess:   (forceConsent?: boolean) => void;
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

  return {
    user:              null,
    role:              'user',
    googleAccessToken: null,
    loading:           false,
    googleLoading:     false,
    gmailLoading:      false,
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

    // Step 1: Sign in with Google via Firebase (identity only, NO Gmail scope)
    loginGoogle: async () => {
      setState({ googleLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      // NO gmail scope here — Firebase caches tokens and breaks scope re-requests
      // Gmail token is requested separately via GIS (requestGmailAccess)
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will fire and set user/role
        setState({ googleLoading: false, error: null });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ googleLoading: false });
          return;
        }
        const msg =
          code === 'auth/popup-blocked'
            ? 'Popup zablokowany. Zezwól na popupy dla tej strony.'
            : code === 'auth/unauthorized-domain'
            ? 'Domena nie jest autoryzowana w Firebase Console.'
            : `Błąd Google (${code || 'nieznany'}).`;
        setState({ error: msg, googleLoading: false });
      }
    },

    // Step 2: Request Gmail access token via Google Identity Services
    // This is completely independent of Firebase — always gets a fresh token
    requestGmailAccess: (forceConsent = false) => {
      setState({ gmailLoading: true, error: null });
      requestGmailToken((token, error) => {
        if (token) {
          setState({ googleAccessToken: token, gmailLoading: false });
        } else if (error) {
          setState({ error, gmailLoading: false });
        } else {
          // user cancelled — no error
          setState({ gmailLoading: false });
        }
      }, forceConsent);
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

    logout: async () => {
      await signOut(auth);
      setState({ googleAccessToken: null });
    },

    clearError:           () => setState({ error: null }),
    setGoogleAccessToken: (token) => setState({ googleAccessToken: token }),
  };
});
