export type UserRole = 'owner' | 'admin' | 'user';

/** Hardcoded role assignments */
const ROLE_MAP: Record<string, UserRole> = {
  'skatt3360@gmail.com':         'owner',
  'szymon.karaszewski@cdv.pl':   'admin',
  'kacper.kubiak@cdv.pl':        'admin',
};

export function getUserRole(email: string | null | undefined): UserRole {
  if (!email) return 'user';
  return ROLE_MAP[email.toLowerCase()] ?? 'user';
}

export const isAdmin  = (email: string | null | undefined) => getUserRole(email) !== 'user';
export const isOwner  = (email: string | null | undefined) => getUserRole(email) === 'owner';

export const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Właściciel',
  admin: 'Administrator',
  user:  'Użytkownik',
};

export const ROLE_COLOR: Record<UserRole, string> = {
  owner: 'bg-cdv-gold/20 text-cdv-gold border-cdv-gold/30',
  admin: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  user:  'bg-white/8 text-white/40 border-white/10',
};
