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

/** Test if a token actually has Gmail scope by calling the API */
async function verifyGmailToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()((setState) => {

  onAuthStateChanged(auth, (user) => {
    setState({ user, role: getUserRole(user?.email), loading: false, initialized: true });
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

    // Step 1: Sign in with Google — identity only, no extra scopes
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

    // Step 2: Get Gmail access token via fresh signInWithPopup with Gmail scope
    // Key: prompt:'consent' forces Google to ALWAYS show the scope selection screen
    // and return a fresh token WITH the requested scope — no caching bypass issues.
    requestGmailAccess: async () => {
      setState({ gmailLoading: true, error: null });

      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      // 'consent' is the ONLY prompt type that guarantees scopes are shown + granted
      provider.setCustomParameters({
        prompt: 'consent',
        access_type: 'online',
        include_granted_scopes: 'true',
      });

      try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken ?? null;

        console.log('[Gmail] token obtained:', !!token, 'length:', token?.length);

        if (!token) {
          setState({ error: 'Google nie zwrócił tokenu dostępu. Spróbuj ponownie.', gmailLoading: false });
          return;
        }

        // Verify the token actually has Gmail scope before saving
        const valid = await verifyGmailToken(token);
        console.log('[Gmail] token valid for Gmail API:', valid);

        if (!valid) {
          setState({
            error: 'Token nie ma uprawnień do Gmail. Upewnij się że zaakceptowałeś dostęp do poczty w oknie Google.',
            gmailLoading: false,
          });
          return;
        }

        setState({ googleAccessToken: token, gmailLoading: false, error: null });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ gmailLoading: false }); return;
        }
        setState({
          error: code === 'auth/popup-blocked'
            ? 'Popup zablokowany — zezwól na popupy dla tej strony.'
            : `Błąd Gmail (${code || 'nieznany'}).`,
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
