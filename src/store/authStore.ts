import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  reauthenticateWithPopup,
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
  requestGmailAccess:   (forceConsent?: boolean) => Promise<void>;
  register:             (email: string, password: string) => Promise<void>;
  logout:               () => Promise<void>;
  clearError:           () => void;
  setGoogleAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()((setState, getState) => {

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

    // Firebase login — identity only, no Gmail scope
    loginGoogle: async () => {
      setState({ googleLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
        setState({ googleLoading: false, error: null });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ googleLoading: false });
          return;
        }
        setState({
          error: code === 'auth/popup-blocked'
            ? 'Popup zablokowany — zezwól na popupy dla tej strony.'
            : code === 'auth/unauthorized-domain'
            ? 'Domena nie jest autoryzowana w Firebase Console.'
            : `Błąd Google (${code}).`,
          googleLoading: false,
        });
      }
    },

    // Gmail token via reauthenticateWithPopup — forces fresh credential with Gmail scope
    // This bypasses Firebase token cache while staying on the same authorized domain
    requestGmailAccess: async (forceConsent = false) => {
      setState({ gmailLoading: true, error: null });
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.setCustomParameters({
        prompt: forceConsent ? 'consent' : 'select_account',
        access_type: 'online',
        include_granted_scopes: 'true',
      });

      try {
        const currentUser = getState().user ?? auth.currentUser;
        let result;

        if (currentUser) {
          // Reauthenticate = forces Google to show fresh consent with the new scope
          result = await reauthenticateWithPopup(currentUser, provider);
        } else {
          // Fallback: sign in fresh
          result = await signInWithPopup(auth, provider);
        }

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken ?? null;

        if (!token) {
          setState({ error: 'Nie udało się pobrać tokenu Gmail. Spróbuj ponownie.', gmailLoading: false });
          return;
        }

        setState({ googleAccessToken: token, gmailLoading: false, error: null });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          setState({ gmailLoading: false });
          return;
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
