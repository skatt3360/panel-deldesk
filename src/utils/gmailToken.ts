// Google Identity Services — OAuth2 token client
// Used to get a Gmail access token INDEPENDENTLY from Firebase Auth.
// Firebase caches OAuth tokens and doesn't re-request scopes — GIS bypasses that.

const CLIENT_ID = '384650483840-hlpnhaler84sk7crrmlf8uia906hv65u.apps.googleusercontent.com';
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

type TokenCallback = (token: string | null, error?: string) => void;

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken(opts?: { prompt?: string }): void };
        };
      };
    };
  }
}

type TokenClient = ReturnType<NonNullable<typeof window.google>['accounts']['oauth2']['initTokenClient']>;
let tokenClient: TokenClient | null = null;

/** Request a fresh Gmail access token via Google Identity Services popup. */
export function requestGmailToken(cb: TokenCallback, forceConsent = false): void {
  const doRequest = () => {
    if (!window.google?.accounts?.oauth2) {
      cb(null, 'Google Identity Services nie załadował się. Odśwież stronę i spróbuj ponownie.');
      return;
    }

    // Re-create client each time so we can change prompt
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: GMAIL_SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          // user_cancelled is not really an error
          if (resp.error === 'access_denied' || resp.error === 'user_cancelled') {
            cb(null);
          } else {
            cb(null, `Błąd OAuth: ${resp.error ?? 'nieznany'}`);
          }
        } else {
          cb(resp.access_token);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: forceConsent ? 'consent' : 'select_account' });
  };

  // GIS loads asynchronously — wait up to 5s
  if (window.google?.accounts?.oauth2) {
    doRequest();
  } else {
    let waited = 0;
    const interval = setInterval(() => {
      waited += 100;
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        doRequest();
      } else if (waited >= 5000) {
        clearInterval(interval);
        cb(null, 'Google Identity Services nie załadował się. Sprawdź połączenie i odśwież stronę.');
      }
    }, 100);
  }
}
