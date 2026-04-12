import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, X, Printer, Download } from 'lucide-react';
import { useProtocolStore } from '../store/protocolStore';
import { usePeopleStore } from '../store/peopleStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { HandoverProtocol, ProtocolStatus } from '../types';
import ProtocolDocument, { downloadProtocolHTML } from '../components/ProtocolDocument';
import { EQUIPMENT_TYPE_LABELS } from '../data/equipmentCatalog';

const STATUS_LABELS: Record<ProtocolStatus, string> = {
  active:    'Aktywny',
  returned:  'Zwrócony',
  cancelled: 'Anulowany',
};
const STATUS_COLORS: Record<ProtocolStatus, { bg: string; text: string; border: string }> = {
  active:    { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  returned:  { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  cancelled: { bg: 'rgba(107,114,128,0.1)', text: '#9ca3af', border: 'rgba(107,114,128,0.25)' },
};

const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString('pl-PL') : '—';

interface DetailModalProps {
  protocol: HandoverProtocol;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ protocol, onClose }) => {
  const { people } = usePeopleStore();
  const { equipment } = useEquipmentStore();
  const { returnProtocol, cancelProtocol } = useProtocolStore();

  const person = people.find((p) => p.id === protocol.personId);
  const eqs = equipment.filter((e) => protocol.equipmentIds.includes(e.id));
  const [showPrint, setShowPrint] = useState(false);

  if (!person) return null;

  const docProps = { protocol, person, equipment: eqs, people };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: 0 }}>{protocol.id}</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{person.firstName} {person.lastName} — {person.department}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {protocol.status === 'active' && (
              <>
                <button onClick={async () => { await returnProtocol(protocol.id); onClose(); }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Zwrot sprzętu
                </button>
                <button onClick={async () => { if (confirm('Anulować protokół?')) { await cancelProtocol(protocol.id); onClose(); } }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Anuluj
                </button>
              </>
            )}
            <button onClick={() => setShowPrint((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Printer size={13} /> Podgląd / Druk
            </button>
            <button onClick={() => downloadProtocolHTML(docProps)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Download size={13} /> HTML
            </button>
            <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {showPrint ? (
            <div style={{ padding: 24 }}>
              <ProtocolDocument {...docProps} />
            </div>
          ) : (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {[
                  { label: 'Status', value: STATUS_LABELS[protocol.status] },
                  { label: 'Wydał', value: protocol.issuedByName },
                  { label: 'Data wydania', value: fmt(protocol.issuedAt) },
                  { label: 'Oczekiwany zwrot', value: fmt(protocol.expectedReturnDate) },
                  { label: 'Data zwrotu', value: fmt(protocol.returnedAt) },
                ].map((d) => (
                  <div key={d.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Equipment list */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                  Sprzęt ({eqs.length} szt.)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {eqs.map((eq) => (
                    <div key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6900', minWidth: 60 }}>{eq.id}</span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', minWidth: 100 }}>{EQUIPMENT_TYPE_LABELS[eq.type]}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', flex: 1 }}>{eq.brand} {eq.model}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{eq.serialNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              {protocol.notes && (
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Uwagi</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{protocol.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProtocolsPage: React.FC = () => {
  const navigate = useNavigate();
  const { protocols } = useProtocolStore();
  const { people } = usePeopleStore();
  const { equipment } = useEquipmentStore();

  const [filterStatus, setFilterStatus] = useState<ProtocolStatus | 'all'>('all');
  const [detail, setDetail] = useState<HandoverProtocol | null>(null);

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return protocols;
    return protocols.filter((p) => p.status === filterStatus);
  }, [protocols, filterStatus]);

  const personName = (id: string) => {
    const p = people.find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  const eqPreview = (ids: string[]) => {
    const first = ids.slice(0, 2).map((id) => {
      const eq = equipment.find((e) => e.id === id);
      return eq ? `${eq.brand} ${eq.model}` : id;
    });
    return first.join(', ') + (ids.length > 2 ? ` +${ids.length - 2}` : '');
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {detail && <DetailModal protocol={detail} onClose={() => setDetail(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Protokoły Wydania</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>{protocols.length} protokołów</p>
        </div>
        <button
          onClick={() => navigate('/protocols/new')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#FF6900', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={15} /> Nowy protokół
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { value: 'all',       label: `Wszystkie (${protocols.length})` },
          { value: 'active',    label: `Aktywne (${protocols.filter((p) => p.status === 'active').length})` },
          { value: 'returned',  label: `Zwrócone (${protocols.filter((p) => p.status === 'returned').length})` },
          { value: 'cancelled', label: `Anulowane (${protocols.filter((p) => p.status === 'cancelled').length})` },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setFilterStatus(t.value)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid',
              borderColor: filterStatus === t.value ? '#FF6900' : 'rgba(255,255,255,0.1)',
              background: filterStatus === t.value ? 'rgba(255,105,0,0.12)' : 'transparent',
              color: filterStatus === t.value ? '#FF6900' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <FileText size={32} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 12 }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Brak protokołów</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['ID', 'Pracownik', 'Sprzęt', 'Wydał', 'Data wydania', 'Termin zwrotu', 'Status', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((prot) => {
                const c = STATUS_COLORS[prot.status];
                return (
                  <tr
                    key={prot.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setDetail(prot)}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#FF6900' }}>{prot.id}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#fff' }}>{personName(prot.personId)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{eqPreview(prot.equipmentIds)}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{prot.equipmentIds.length} szt.</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{prot.issuedByName}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{fmt(prot.issuedAt)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{fmt(prot.expectedReturnDate)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
                        {STATUS_LABELS[prot.status]}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <FileText size={13} style={{ color: 'rgba(255,255,255,0.25)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProtocolsPage;
