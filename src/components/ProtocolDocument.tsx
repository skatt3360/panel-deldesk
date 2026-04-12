import React from 'react';
import { HandoverProtocol, Person, Equipment } from '../types';
import { EQUIPMENT_TYPE_LABELS } from '../data/equipmentCatalog';

interface ProtocolDocumentProps {
  protocol: HandoverProtocol;
  person: Person;
  equipment: Equipment[];
  people: Person[];
}

const fmt = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ProtocolDocument: React.FC<ProtocolDocumentProps> = ({ protocol, person, equipment, people }) => {
  const supervisor = people.find((p) => p.id === (protocol.supervisorId ?? person.supervisorId));

  return (
    <div style={{
      fontFamily: '"Arial", "Helvetica Neue", sans-serif',
      background: '#fff',
      color: '#111',
      padding: '32px 40px',
      maxWidth: 794, // A4-ish
      margin: '0 auto',
      fontSize: 13,
      lineHeight: 1.6,
    }}>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #1a1a1a', paddingBottom: 18, marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          {/* CDV logo SVG — dark variant for white background */}
          <svg width="70" height="40" viewBox="0 0 1256 713" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Collegium Da Vinci" style={{ display: 'block' }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M712.251 326.659V386.628L509.445 505.891L509.106 417.45L612.875 359.873V353.112L509.333 295.476L509.445 206.174L712.251 326.659ZM910.086 488.999H853.224L712.95 223.161L798.877 223.072L879.092 381.154L884.218 381.153L964.434 223.07L1050.36 223.159L910.086 488.999ZM206.678 386.807V326.838L409.483 206.348L409.596 295.656L306.053 353.291V360.052L409.822 417.63L409.483 506.07L206.678 386.807Z" fill="#1E252D" />
          </svg>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>Collegium Da Vinci · Dział IT</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Protokół nr</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#FF6900' }}>{protocol.id}</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1a1a1a' }}>
          Protokół Wydania Sprzętu Komputerowego
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          Data wydania: <strong>{fmt(protocol.issuedAt)}</strong>
          {protocol.indefinite
            ? <>&nbsp;·&nbsp; Okres użytkowania: <strong>bezterminowo</strong></>
            : protocol.expectedReturnDate
              ? <>&nbsp;·&nbsp; Zwrot do: <strong>{fmt(protocol.expectedReturnDate)}</strong></>
              : null}
        </div>
      </div>

      {/* Section: Wydający */}
      <Section title="Dane Wydającego">
        <Row label="Imię i nazwisko" value={protocol.issuedByName} />
        <Row label="Stanowisko" value="Administrator IT / Dział IT" />
        <Row label="Email" value={protocol.issuedBy} />
      </Section>

      {/* Section: Odbiorca */}
      <Section title="Dane Odbiorcy">
        <Row label="Imię i nazwisko" value={`${person.firstName} ${person.lastName}`} />
        <Row label="Stanowisko" value={person.position} />
        <Row label="Dział" value={person.department} />
        <Row label="Email" value={person.email} />
        {person.phone && <Row label="Telefon" value={person.phone} />}
        {person.room && <Row label="Sala / Pokój" value={person.room} />}
        {supervisor && <Row label="Przełożony" value={`${supervisor.firstName} ${supervisor.lastName}`} />}
      </Section>

      {/* Section: Sprzęt */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', borderBottom: '2px solid #1a1a1a', paddingBottom: 5, marginBottom: 10 }}>
          Wykaz Wydawanego Sprzętu
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['Lp.', 'Typ', 'Marka i model', 'Nr seryjny', 'Nr inwentarzowy', 'Uwagi'].map((h) => (
                <th key={h} style={{ padding: '7px 9px', textAlign: 'left', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #ddd', color: '#333' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq, i) => (
              <tr key={eq.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '7px 9px', border: '1px solid #ddd', color: '#555', fontWeight: 600 }}>{i + 1}.</td>
                <td style={{ padding: '7px 9px', border: '1px solid #ddd' }}>{EQUIPMENT_TYPE_LABELS[eq.type]}</td>
                <td style={{ padding: '7px 9px', border: '1px solid #ddd', fontWeight: 600 }}>{eq.brand} {eq.model}</td>
                <td style={{ padding: '7px 9px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: 11 }}>{eq.serialNumber || '—'}</td>
                <td style={{ padding: '7px 9px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: 11 }}>{eq.inventoryNumber || '—'}</td>
                <td style={{ padding: '7px 9px', border: '1px solid #ddd', color: '#666' }}>{eq.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', fontSize: 11, color: '#555', marginTop: 5, fontWeight: 600 }}>
          Łącznie pozycji: {equipment.length}
        </div>
      </div>

      {/* Warunki */}
      <div style={{ marginBottom: 24, padding: '14px 16px', background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>Warunki Wydania</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: '#333', fontSize: 12 }}>
          <li>Odbiorca zobowiązuje się do dbałości o powierzony sprzęt oraz do jego użytkowania zgodnie z przeznaczeniem i polityką bezpieczeństwa CDV.</li>
          <li>Wszelkie uszkodzenia, awarie lub utrata sprzętu muszą być niezwłocznie zgłaszane do Działu IT.</li>
          <li>W przypadku rozwiązania stosunku pracy lub zmiany stanowiska, sprzęt należy zwrócić do Działu IT w ciągu 3 dni roboczych.{protocol.indefinite ? ' Sprzęt wydany bezterminowo — obowiązuje do momentu formalnego zwrotu.' : ''}</li>
          <li>Odbiorca ponosi odpowiedzialność materialną za powierzone mienie zgodnie z obowiązującymi przepisami prawa.</li>
          <li>Instalowanie oprogramowania bez licencji lub niezgodnego z polityką CDV jest zabronione.</li>
        </ol>
        {protocol.notes && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#555' }}>
            <strong>Uwagi do protokołu:</strong> {protocol.notes}
          </div>
        )}
      </div>

      {/* Podpisy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <SignatureBox title="Wydał" name={protocol.issuedByName} date={fmt(protocol.issuedAt)} />
        <SignatureBox title="Odebrał" name={`${person.firstName} ${person.lastName}`} date={fmt(protocol.issuedAt)} />
      </div>

      {supervisor && (
        <div style={{ marginBottom: 24 }}>
          <SignatureBox title="Podpis Przełożonego" name={`${supervisor.firstName} ${supervisor.lastName}`} date="" />
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ddd', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#aaa' }}>
        <span>CDV — Collegium Da Vinci · Panel IT Helpdesk</span>
        <span>Wygenerowano: {fmt(new Date().toISOString())}</span>
        <span>Protokół: {protocol.id}</span>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', borderBottom: '2px solid #1a1a1a', paddingBottom: 5, marginBottom: 10 }}>{title}</div>
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '5px 0' }}>{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <>
    <div style={{ fontSize: 11, color: '#777', fontWeight: 600, paddingRight: 12, paddingTop: 2 }}>{label}:</div>
    <div style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{value || '—'}</div>
  </>
);

const SignatureBox: React.FC<{ title: string; name: string; date: string }> = ({ title, name, date }) => (
  <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: '14px 16px', minHeight: 100 }}>
    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: 10 }}>{title}</div>
    <div style={{ height: 40, borderBottom: '1px solid #ccc', marginBottom: 8 }} />
    <div style={{ fontSize: 11, color: '#555' }}>{name}</div>
    {date && <div style={{ fontSize: 10.5, color: '#aaa', marginTop: 3 }}>Data: {date}</div>}
  </div>
);

export default ProtocolDocument;

// ─── Print helpers ────────────────────────────────────────────────────────────
export function printProtocol(props: ProtocolDocumentProps) {
  const { renderToStaticMarkup } = require('react-dom/server');
  const html = renderToStaticMarkup(<ProtocolDocument {...props} />);
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Protokół ${props.protocol.id}</title><style>body{margin:0;padding:0;background:#fff;}@media print{body{margin:0;}}</style></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export function downloadProtocolHTML(props: ProtocolDocumentProps) {
  const { renderToStaticMarkup } = require('react-dom/server');
  const html = renderToStaticMarkup(<ProtocolDocument {...props} />);
  const full = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Protokół ${props.protocol.id}</title><style>body{margin:0;padding:0;background:#fff;}</style></head><body>${html}</body></html>`;
  const blob = new Blob([full], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `protokol-${props.protocol.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
