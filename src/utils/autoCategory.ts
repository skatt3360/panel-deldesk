import { SupportTier, TicketCategory } from '../types';

// ──────────────────────────────────────────────────────────────────
// SUPPORT TIERS (based on ŻUK / CDV helpdesk categorization)
// ──────────────────────────────────────────────────────────────────
//
// L1 — First line: hardware, printers, events/venues, basic access
// L2 — Second line: software installs, internet issues, licenses, OS
// L3 — Third line: dev, website, VERBIS, VDBO, ENOVA, servers/infra
// ──────────────────────────────────────────────────────────────────

const TIER_KEYWORDS: Record<SupportTier, string[]> = {
  1: [
    // hardware
    'komputer', 'monitor', 'klawiatura', 'mysz', 'drukarka', 'skaner',
    'projektor', 'ekran', 'hdmi', 'kabel', 'zasilacz', 'ładowarka', 'usb',
    'tablet', 'telefon', 'słuchawki', 'głośnik', 'usterka sprzętu',
    'nie działa komputer', 'beep', 'sygnał', 'nie uruchamia', 'czarny ekran',
    // network/basic
    'wifi', 'wi-fi', 'internet nie działa', 'brak internetu', 'sieć',
    'access point', 'router', 'kabel sieciowy', 'rj45',
    // events/venue
    'wydarzenie', 'event', 'sala', 'aula', 'konferencja', 'wykład',
    'prezentacja', 'rzutnik', 'nagłośnienie', 'mikrofon', 'kamera',
    'streaming', 'nagrana', 'transmisja',
    // printers specifically
    'paper jam', 'zacięcie', 'toner', 'atrament', 'druk', 'wydruk',
    // basic access
    'hasło reset', 'reset hasła', 'nie mogę się zalogować', 'zapomniałem hasła',
  ],
  2: [
    // software install
    'instalacja', 'zainstaluj', 'install', 'program', 'aplikacja',
    'oprogramowanie', 'licencja', 'klucz produktu', 'aktywacja',
    // OS / drivers
    'windows', 'system operacyjny', 'aktualizacja systemu', 'update',
    'sterownik', 'driver', 'błąd systemu', 'reinstalacja',
    // office/productivity
    'office', 'word', 'excel', 'powerpoint', 'teams', 'outlook',
    'onedrive', 'sharepoint', 'adobe', 'acrobat', 'pdf',
    // internet/browser
    'przeglądarka', 'chrome', 'firefox', 'edge', 'strona nie otwiera',
    'ssl', 'certyfikat', 'vpn', 'internet problemy', 'dns',
    // access management
    'konto', 'dostęp', 'uprawnienia', 'adres email', 'skrzynka',
    'usos', 'panel studenta', 'login', 'active directory', 'ad',
    // antivirus/security
    'wirus', 'antywirus', 'malware', 'złośliwe', 'kaspersky',
  ],
  3: [
    // specific CDV systems
    'verbis', 'vdbo', 'enova', 'dziekanat',
    // dev / website
    'strona www', 'website', 'web', 'kod', 'programowanie',
    'błąd na stronie', 'zmiana na stronie', 'frontend', 'backend',
    'api', 'endpoint', 'baza danych', 'database', 'sql', 'backup',
    // servers / infra
    'serwer', 'server', 'hosting', 'vm', 'wirtualna maszyna',
    'hypervisor', 'esxi', 'proxmox', 'docker', 'kubernetes',
    'deployment', 'deploy', 'produkcja', 'staging',
    // integrations
    'integracja', 'synchronizacja', 'import', 'export', 'migracja',
    'crm', 'erp', 'ldap', 'sso', 'oauth', 'saml',
    // security advanced
    'firewall', 'ids', 'ips', 'penetration', 'audit bezpieczeństwa',
  ],
};

/** Detect support tier from ticket title + description */
export function detectSupportTier(title: string, description: string): SupportTier {
  const text = `${title} ${description}`.toLowerCase();
  const scores: Record<SupportTier, number> = { 1: 0, 2: 0, 3: 0 };

  for (const [tier, keywords] of Object.entries(TIER_KEYWORDS) as [string, string[]][]) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[Number(tier) as SupportTier] += kw.split(' ').length; // longer = more specific
      }
    }
  }

  // L3 > L2 > L1 in case of tie (escalate to higher tier)
  if (scores[3] > 0) return 3;
  if (scores[2] > 0) return 2;
  return 1;
}

/** Suggest ticket category from text */
export function suggestCategory(title: string, description: string): TicketCategory {
  const text = `${title} ${description}`.toLowerCase();

  const categoryKeywords: Record<TicketCategory, string[]> = {
    Hardware:  ['komputer', 'monitor', 'drukarka', 'klawiatura', 'mysz', 'sprzęt', 'hardware', 'projektor', 'zasilacz', 'kabel', 'usb'],
    Software:  ['program', 'oprogramowanie', 'instalacja', 'windows', 'office', 'aplikacja', 'sterownik', 'software', 'licencja'],
    Network:   ['sieć', 'wifi', 'internet', 'serwer', 'router', 'access point', 'ethernet', 'vpn', 'dns'],
    Access:    ['dostęp', 'hasło', 'login', 'konto', 'usos', 'uprawnienia', 'autoryzacja', 'reset'],
    Event:     ['wydarzenie', 'event', 'konferencja', 'wykład', 'sala', 'nagłośnienie', 'transmisja', 'streaming'],
    Other:     [],
  };

  let bestCategory: TicketCategory = 'Other';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(categoryKeywords) as [TicketCategory, string[]][]) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestCategory = cat; }
  }

  return bestCategory;
}

// ──────────────────────────────────────────────────────────────────
// TIER DISPLAY HELPERS
// ──────────────────────────────────────────────────────────────────

export const TIER_LABEL: Record<SupportTier, string> = {
  1: 'L1 – Pierwsza linia',
  2: 'L2 – Druga linia',
  3: 'L3 – Trzecia linia',
};

export const TIER_SHORT: Record<SupportTier, string> = { 1: 'L1', 2: 'L2', 3: 'L3' };

export const TIER_COLOR: Record<SupportTier, string> = {
  1: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
  2: 'bg-blue-500/15 text-blue-300 border-blue-400/25',
  3: 'bg-purple-500/15 text-purple-300 border-purple-400/25',
};
