import { ChangelogEntry } from '../types';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.4.0',
    date: '2026-04-10',
    changes: [
      { type: 'feat', text: 'Logowanie przez Google (OAuth)' },
      { type: 'feat', text: 'System linii wsparcia — auto-klasyfikacja L1/L2/L3' },
      { type: 'feat', text: 'Checklist zadań w zgłoszeniu (tylko admini)' },
      { type: 'feat', text: 'Zakładka Eventy — widok wydarzeń CDV' },
      { type: 'feat', text: 'Chat wewnętrzny — kanały, DM, grupy, reakcje, pliki' },
      { type: 'feat', text: 'Lista zmian (ten ekran)' },
      { type: 'improve', text: 'Kliknięcie logo CDV przenosi do Dashboardu' },
      { type: 'improve', text: 'System ról użytkowników (Właściciel / Admin / Użytkownik)' },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-04-09',
    changes: [
      { type: 'feat', text: 'Oficjalne logo CDV (symbol z identyfikacji wizualnej)' },
      { type: 'feat', text: 'Ciemne animowane tło — spójny dark theme w całej aplikacji' },
      { type: 'feat', text: 'Nowy typ zgłoszenia: "Wydarzenie"' },
      { type: 'improve', text: 'Kompletny redesign strony Zgłoszeń — tabsy statusów, ikonki kategorii' },
      { type: 'improve', text: 'Powiadomienia — oznaczanie jako przeczytane, zapis stanu lokalnie' },
      { type: 'fix', text: 'Naprawiono błąd po wyczyszczeniu licznika powiadomień' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-04-08',
    changes: [
      { type: 'feat', text: 'Usuwanie zgłoszeń z potwierdzeniem (2-krokowe)' },
      { type: 'feat', text: 'Zamknięte zgłoszenia wyszarzone, rozwiązane z zielonym podświetleniem' },
      { type: 'feat', text: 'Wyszukiwarka — live wyniki + synchronizacja z URL (?q=)' },
      { type: 'feat', text: 'Przeprojektowany Kalendarz — sidebar ze statystykami, własny toolbar' },
      { type: 'improve', text: 'Integracja Kalendarz ↔ Zgłoszenia (powiązane tickety)' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-04-07',
    changes: [
      { type: 'feat', text: 'Panel logowania i rejestracji' },
      { type: 'feat', text: 'Pełen redesign wizualny — glassmorphism, CDV branding' },
      { type: 'feat', text: 'Dashboard ze statystykami i wykresem SLA' },
      { type: 'fix', text: 'Pusta strona po deployu na Netlify (SPA routing)' },
      { type: 'fix', text: 'Wszystkie błędy TypeScript' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-04-05',
    changes: [
      { type: 'feat', text: 'Pierwsze uruchomienie panelu CDV IT Helpdesk' },
      { type: 'feat', text: 'Zarządzanie zgłoszeniami (CRUD) z Firebase Realtime Database' },
      { type: 'feat', text: 'Kalendarz wydarzeń IT' },
      { type: 'feat', text: 'Ustawienia organizacji i parametrów SLA' },
    ],
  },
];
