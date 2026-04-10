import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';
import { getUserRole, UserRole } from '../utils/roles';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

// Store pending Gmail token request in sessionStorage so redirect flow can pick it up
const GMAIL_REDIRECT_KEY = 'cdv-gmail-redirect-pending';

export interface AuthState {
  user:                 User | null;
  role:                 UserRole;
  googleAccessToken:    string | null;
  loading:              boolean;
  googleLoading:        boolean;
  gmailLoading:         boolean;
  error:                string | null;
  initialized:          boolean;
  login:                (email: string, password: string) => Promise<void>;
  loginGoogle:          () => Promise<void>;
  requestGmailAccess:   () => Promise<void>;
  register:             (email: string, password: string) => Promise<void>;
  logout:               () => Promise<void>;
  clearError:           () => void;
  setGoogleAccessToken: (token: string | null) => void;
}

function makeGmailProvider() {
  const p = new GoogleAuthProvider();
  p.addScope(GMAIL_SCOPE);
  p.setCustomParameters({ prompt: 'consent', access_type: 'online', include_granted_scopes: 'true' });
  return p;
}

export const useAuthStore = create<AuthState>()((setState) => {

  onAuthStateChanged(auth, (user) => {
    setState({ user, role: getUserRole(user?.email), loading: false, initialized: true });
  });

  // On page load: check if we just came back from a Gmail redirect flow
  getRedirectResult(auth).then((result) => {
    if (!result) return;
    const wasPending = sessionStorage.getItem(GMAIL_REDIRECT_KEY);
    if (!wasPending) return;
    sessionStorage.removeItem(GMAIL_REDIRECT_KEY);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken ?? null;
    if (token) {
      console.log('[Gmail] Redirect token obtained, length:', token.length);
      setState({ googleAccessToken: token, gmailLoading: false });
    }
  }).catch(() => {});

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

    // Sign in with Google — identity only
    loginGoogle: async () => {
      setState({ googleLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
        setState({ googleLoading: false });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ googleLoading: false }); return;
        }
        setState({
          error: code === 'auth/popup-blocked' ? 'Popup zablokowany — zezwól na popupy dla tej strony.'
            : code === 'auth/unauthorized-domain' ? 'Domena nie jest autoryzowana w Firebase Console.'
            : `Błąd Google (${code}).`,
          googleLoading: false,
        });
      }
    },

    // Request Gmail token with Gmail scope
    // Tries popup first; if COOP still blocks it, falls back to redirect
    requestGmailAccess: async () => {
      setState({ gmailLoading: true, error: null });
      try {
        const result = await signInWithPopup(auth, makeGmailProvider());
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken ?? null;
        console.log('[Gmail] Popup token obtained:', !!token, 'length:', token?.length);
        if (token) {
          setState({ googleAccessToken: token, gmailLoading: false, error: null });
        } else {
          // Token missing — fall back to redirect
          console.warn('[Gmail] No token from popup, falling back to redirect');
          sessionStorage.setItem(GMAIL_REDIRECT_KEY, '1');
          await signInWithRedirect(auth, makeGmailProvider());
        }
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ gmailLoading: false }); return;
        }
        if (code === 'auth/popup-blocked') {
          // COOP is blocking — use redirect
          console.warn('[Gmail] Popup blocked by COOP, using redirect');
          sessionStorage.setItem(GMAIL_REDIRECT_KEY, '1');
          try {
            await signInWithRedirect(auth, makeGmailProvider());
          } catch {
            setState({ error: 'Nie można otworzyć okna Gmail. Odśwież stronę i spróbuj ponownie.', gmailLoading: false });
          }
          return;
        }
        setState({
          error: `Błąd Gmail (${code || 'nieznany'}).`,
          gmailLoading: false,
        });
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

    logout: async () => {
      await signOut(auth);
      setState({ googleAccessToken: null });
    },

    clearError:           () => setState({ error: null }),
    setGoogleAccessToken: (token) => setState({ googleAccessToken: token }),
  };
});
