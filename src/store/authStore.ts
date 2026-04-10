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

export interface AuthState {
  user: User | null;
  role: UserRole;
  googleAccessToken: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login:                (email: string, password: string) => Promise<void>;
  loginGoogle:          () => Promise<void>;
  register:             (email: string, password: string) => Promise<void>;
  logout:               () => Promise<void>;
  clearError:           () => void;
  setGoogleAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()((setState) => {
  // ── Process any pending redirect FIRST, then subscribe to auth state ──
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken ?? null;
        setState({ googleAccessToken: token });
      }
    })
    .catch((err: unknown) => {
      // Surface the error so we can debug if needed
      const code = (err as { code?: string })?.code ?? '';
      if (code && code !== 'auth/no-auth-event') {
        setState({ error: `Google login error: ${code}` });
      }
    })
    .finally(() => {
      // Subscribe AFTER redirect result is processed so user is already set
      onAuthStateChanged(auth, (user) => {
        setState({
          user,
          role: getUserRole(user?.email),
          loading: false,
          initialized: true,
        });
      });
    });

  return {
    user: null,
    role: 'user',
    googleAccessToken: null,
    loading: false,
    error: null,
    initialized: false,

    login: async (email, password) => {
      setState({ loading: true, error: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setState({ error: null, loading: false });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
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
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
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
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        // Try popup first (best UX)
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        setState({ error: null, loading: false, googleAccessToken: credential?.accessToken ?? null });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';

        if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
          // Fallback: full-page redirect
          try {
            await signInWithRedirect(auth, provider);
            // Page will reload; result handled by getRedirectResult() above
          } catch {
            setState({ error: 'Nie można otworzyć okna logowania Google.', loading: false });
          }
        } else if (code === 'auth/unauthorized-domain') {
          setState({
            error: 'Domena nie jest autoryzowana. Dodaj ją w Firebase Console → Authentication → Authorized domains.',
            loading: false,
          });
        } else if (code === 'auth/cancelled-popup-request') {
          setState({ loading: false, error: null }); // user just closed — no error
        } else {
          setState({
            error: `Błąd Google (${code || 'nieznany'}). Spróbuj ponownie.`,
            loading: false,
          });
        }
      }
    },

    logout: async () => {
      await signOut(auth);
      setState({ googleAccessToken: null });
    },

    clearError: () => setState({ error: null }),

    setGoogleAccessToken: (token) => setState({ googleAccessToken: token }),
  };
});
