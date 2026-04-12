import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, User, Package, FileText,
  Eye, Search, X, CheckCircle, Plus,
} from 'lucide-react';
import { useProtocolStore } from '../store/protocolStore';
import { usePeopleStore } from '../store/peopleStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { useAuthStore } from '../store/authStore';
import { Person, Equipment } from '../types';
import { EQUIPMENT_TYPE_LABELS } from '../data/equipmentCatalog';
import ProtocolDocument from '../components/ProtocolDocument';

const STEPS = [
  { label: 'Pracownik', icon: <User size={14} /> },
  { label: 'Sprzęt',    icon: <Package size={14} /> },
  { label: 'Szczegóły', icon: <FileText size={14} /> },
  { label: 'Podgląd',   icon: <Eye size={14} /> },
];

// ─── Step 1: Select person ────────────────────────────────────────────────────
const Step1: React.FC<{
  selectedPerson: Person | null;
  onSelect: (p: Person) => void;
}> = ({ selectedPerson, onSelect }) => {
  const { people, departments } = usePeopleStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newPerson, setNewPerson] = useState({
    firstName: '', lastName: '', email: '', position: '', department: '',
  });

  const results = useMemo(() => {
    if (!search.trim()) return people.slice(0, 12);
    const q = search.toLowerCase();
    return people.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.email} ${p.position} ${p.department}`.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [people, search]);

  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', width: '100%' };

  return (
    <div>
      {selectedPerson ? (
        <div style={{ marginBottom: 16, padding: 16, background: 'rgba(255,105,0,0.08)', border: '1px solid rgba(255,105,0,0.25)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} style={{ color: '#4ade80' }} />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{selectedPerson.firstName} {selectedPerson.lastName}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4, marginLeft: 24 }}>
                {selectedPerson.position} · {selectedPerson.department}
                {selectedPerson.email && ` · ${selectedPerson.email}`}
              </div>
            </div>
            <button onClick={() => onSelect(null as unknown as Person)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={14} /></button>
          </div>
        </div>
      ) : null}

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Wyszukaj pracownika..." style={{ ...inp, paddingLeft: 30 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
        {results.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: selectedPerson?.id === p.id ? 'rgba(255,105,0,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedPerson?.id === p.id ? 'rgba(255,105,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 10, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,105,0,0.15)', border: '1px solid rgba(255,105,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#FF6900', flexShrink: 0 }}>
              {p.firstName[0]}{p.lastName[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.firstName} {p.lastName}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.position} · {p.department}
              </div>
            </div>
            {selectedPerson?.id === p.id && <CheckCircle size={14} style={{ color: '#FF6900', flexShrink: 0 }} />}
          </button>
        ))}
        {results.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: 20 }}>Nie znaleziono pracownika</p>
        )}
      </div>

      {/* Quick-add new person */}
      <div style={{ marginTop: 14 }}>
        <button onClick={() => setShowAdd((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '8px 14px' }}>
          <Plus size={13} /> Dodaj nowego pracownika
        </button>
        {showAdd && (
          <div style={{ marginTop: 12, padding: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input value={newPerson.firstName} onChange={(e) => setNewPerson((f) => ({ ...f, firstName: e.target.value }))} placeholder="Imię *" style={inp} />
              <input value={newPerson.lastName} onChange={(e) => setNewPerson((f) => ({ ...f, lastName: e.target.value }))} placeholder="Nazwisko *" style={inp} />
            </div>
            <input value={newPerson.email} onChange={(e) => setNewPerson((f) => ({ ...f, email: e.target.value }))} placeholder="Email *" style={inp} />
            <input value={newPerson.position} onChange={(e) => setNewPerson((f) => ({ ...f, position: e.target.value }))} placeholder="Stanowisko *" style={inp} />
            <select value={newPerson.department} onChange={(e) => setNewPerson((f) => ({ ...f, department: e.target.value }))} style={inp}>
              <option value="">— Dział —</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <button
              onClick={async () => {
                if (!newPerson.firstName || !newPerson.lastName || !newPerson.email || !newPerson.position || !newPerson.department) {
                  alert('Wypełnij wymagane pola'); return;
                }
                const { addPerson: ap } = usePeopleStore.getState();
                const id = await ap({ firstName: newPerson.firstName, lastName: newPerson.lastName, email: newPerson.email, position: newPerson.position, department: newPerson.department });
                const created = usePeopleStore.getState().people.find((p) => p.id === id);
                if (created) onSelect(created);
                setShowAdd(false);
              }}
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#FF6900', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}
            >
              Dodaj i wybierz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Step 2: Select equipment ─────────────────────────────────────────────────
const Step2: React.FC<{
  selected: Equipment[];
  onToggle: (eq: Equipment) => void;
}> = ({ selected, onToggle }) => {
  const { equipment } = useEquipmentStore();
  const available = equipment.filter((e) => e.status === 'available');
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter((e) =>
      `${e.brand} ${e.model} ${e.id} ${e.serialNumber} ${e.inventoryNumber}`.toLowerCase().includes(q)
    );
  }, [available, search]);

  const isSelected = (id: string) => selected.some((e) => e.id === id);

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ marginBottom: 14, padding: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Wybrane ({selected.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selected.map((eq) => (
              <div key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20 }}>
                <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>{eq.id}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{eq.brand} {eq.model}</span>
                <button onClick={() => onToggle(eq)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, lineHeight: 1 }}><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtruj dostępny sprzęt..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px 8px 30px', color: '#fff', fontSize: 13, outline: 'none', width: '100%' }} />
      </div>

      {available.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: 20, textAlign: 'center' }}>Brak dostępnego sprzętu</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto' }}>
          {results.map((eq) => {
            const sel = isSelected(eq.id);
            return (
              <button
                key={eq.id}
                onClick={() => onToggle(eq)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: sel ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${sel ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: sel ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${sel ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {sel ? <CheckCircle size={14} style={{ color: '#60a5fa' }} /> : <Package size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6900' }}>{eq.id}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{EQUIPMENT_TYPE_LABELS[eq.type]}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 1 }}>{eq.brand} {eq.model}</div>
                  {(eq.serialNumber || eq.inventoryNumber) && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginTop: 1 }}>
                      {eq.serialNumber && `SN: ${eq.serialNumber}`}
                      {eq.serialNumber && eq.inventoryNumber && ' · '}
                      {eq.inventoryNumber && `INW: ${eq.inventoryNumber}`}
                    </div>
                  )}
                </div>
                {eq.location && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{eq.location}</span>}
              </button>
            );
          })}
          {results.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: 20, textAlign: 'center' }}>Brak wyników</p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Step 3: Details ──────────────────────────────────────────────────────────
interface DetailsData {
  issuedAt: string;
  expectedReturnDate: string;
  supervisorId: string;
  notes: string;
}

const Step3: React.FC<{
  data: DetailsData;
  onChange: (d: DetailsData) => void;
  person: Person | null;
  issuedByName: string;
}> = ({ data, onChange, person, issuedByName }) => {
  const { people } = usePeopleStore();
  const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', width: '100%' };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' };
  const set_ = (k: keyof DetailsData, v: string) => onChange({ ...data, [k]: v });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
        <label style={lbl}>Wydający (auto)</label>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{issuedByName}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={lbl}>Data wydania *</label>
          <input type="date" value={data.issuedAt} onChange={(e) => set_('issuedAt', e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Oczekiwany zwrot</label>
          <input type="date" value={data.expectedReturnDate} onChange={(e) => set_('expectedReturnDate', e.target.value)} style={inp} />
        </div>
      </div>

      <div>
        <label style={lbl}>Podpis przełożonego</label>
        <select value={data.supervisorId} onChange={(e) => set_('supervisorId', e.target.value)} style={inp}>
          <option value="">— brak —</option>
          {person?.supervisorId && (() => {
            const s = people.find((p) => p.id === person.supervisorId);
            return s ? <option value={s.id}>{s.firstName} {s.lastName} (przełożony pracownika)</option> : null;
          })()}
          {people.filter((p) => p.id !== person?.id && p.id !== person?.supervisorId).map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.position}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={lbl}>Uwagi do protokołu</label>
        <textarea value={data.notes} onChange={(e) => set_('notes', e.target.value)} style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Opcjonalne uwagi..." />
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const NewProtocol: React.FC = () => {
  const navigate = useNavigate();
  const { addProtocol } = useProtocolStore();
  const { people } = usePeopleStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedEq, setSelectedEq] = useState<Equipment[]>([]);
  const [details, setDetails] = useState<DetailsData>({
    issuedAt: new Date().toISOString().slice(0, 10),
    expectedReturnDate: '',
    supervisorId: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const issuedByName = user?.displayName ?? user?.email ?? 'Administrator IT';
  const issuedBy = user?.email ?? '';

  const handleToggleEq = (eq: Equipment) => {
    setSelectedEq((prev) =>
      prev.some((e) => e.id === eq.id) ? prev.filter((e) => e.id !== eq.id) : [...prev, eq]
    );
  };

  const canNext = useMemo(() => {
    if (step === 0) return !!selectedPerson;
    if (step === 1) return selectedEq.length > 0;
    if (step === 2) return !!details.issuedAt;
    return true;
  }, [step, selectedPerson, selectedEq, details]);

  const handleSave = async () => {
    if (!selectedPerson || selectedEq.length === 0) return;
    setSaving(true);
    try {
      await addProtocol({
        personId: selectedPerson.id,
        equipmentIds: selectedEq.map((e) => e.id),
        issuedBy,
        issuedByName,
        issuedAt: new Date(details.issuedAt).toISOString(),
        status: 'active',
        ...(details.expectedReturnDate ? { expectedReturnDate: new Date(details.expectedReturnDate).toISOString() } : {}),
        ...(details.notes.trim() ? { notes: details.notes.trim() } : {}),
        ...(details.supervisorId ? { supervisorId: details.supervisorId } : {}),
      });
      navigate('/protocols');
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const mockProtocol = {
    id: 'PROT-PREVIEW',
    personId: selectedPerson?.id ?? '',
    equipmentIds: selectedEq.map((e) => e.id),
    issuedBy,
    issuedByName,
    issuedAt: details.issuedAt ? new Date(details.issuedAt).toISOString() : new Date().toISOString(),
    expectedReturnDate: details.expectedReturnDate ? new Date(details.expectedReturnDate).toISOString() : undefined,
    status: 'active' as const,
    notes: details.notes || undefined,
    supervisorId: details.supervisorId || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 28,
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Nowy Protokół Wydania</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>Krok {step + 1} z {STEPS.length}</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => i < step && setStep(i)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 8px',
              background: i === step ? 'rgba(255,105,0,0.12)' : i < step ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderRight: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              border: 'none',
              color: i === step ? '#FF6900' : i < step ? '#4ade80' : 'rgba(255,255,255,0.3)',
              fontSize: 12, fontWeight: 600, cursor: i < step ? 'pointer' : 'default',
            }}
          >
            {i < step ? <CheckCircle size={13} /> : s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step content */}
      <div style={cardStyle}>
        {step === 0 && (
          <Step1 selectedPerson={selectedPerson} onSelect={setSelectedPerson} />
        )}
        {step === 1 && (
          <Step2 selected={selectedEq} onToggle={handleToggleEq} />
        )}
        {step === 2 && (
          <Step3 data={details} onChange={setDetails} person={selectedPerson} issuedByName={issuedByName} />
        )}
        {step === 3 && selectedPerson && (
          <div>
            <ProtocolDocument protocol={mockProtocol} person={selectedPerson} equipment={selectedEq} people={people} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          onClick={() => step === 0 ? navigate('/protocols') : setStep((s) => s - 1)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <ChevronLeft size={15} /> {step === 0 ? 'Anuluj' : 'Wstecz'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, border: 'none', background: canNext ? '#FF6900' : 'rgba(255,255,255,0.1)', color: canNext ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 700, cursor: canNext ? 'pointer' : 'not-allowed' }}
          >
            Dalej <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 24px', borderRadius: 10, border: 'none', background: saving ? 'rgba(255,255,255,0.1)' : '#FF6900', color: saving ? 'rgba(255,255,255,0.4)' : '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Zapisywanie…' : 'Zapisz protokół'}
          </button>
        )}
      </div>
    </div>
  );
};

export default NewProtocol;
