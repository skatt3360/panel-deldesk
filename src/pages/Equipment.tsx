import React, { useState, useMemo } from 'react';
import {
  Monitor, Plus, Search, X, Edit2, Trash2, ChevronDown, ChevronUp,
  Laptop, Printer, Smartphone, Tablet, Headphones, Video,
  Server, Wifi, Zap, Package, HardDrive, Mouse, Keyboard,
  AlertCircle, CheckCircle,
} from 'lucide-react';
import { useEquipmentStore } from '../store/equipmentStore';
import { usePeopleStore } from '../store/peopleStore';
import {
  EQUIPMENT_TYPES, EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS, BRANDS_BY_TYPE, MODELS_BY_BRAND,
} from '../data/equipmentCatalog';
import { Equipment, EquipmentType, EquipmentStatus } from '../types';

// ─── Icon map ────────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, React.ReactNode> = {
  laptop:    <Laptop size={14} />,
  desktop:   <Monitor size={14} />,
  monitor:   <Monitor size={14} />,
  printer:   <Printer size={14} />,
  scanner:   <Package size={14} />,
  phone:     <Smartphone size={14} />,
  tablet:    <Tablet size={14} />,
  keyboard:  <Keyboard size={14} />,
  mouse:     <Mouse size={14} />,
  headset:   <Headphones size={14} />,
  projector: <Video size={14} />,
  camera:    <Video size={14} />,
  server:    <Server size={14} />,
  switch:    <Wifi size={14} />,
  router:    <Wifi size={14} />,
  ups:       <Zap size={14} />,
  dock:      <HardDrive size={14} />,
  cable:     <Package size={14} />,
  other:     <Package size={14} />,
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
  const c = EQUIPMENT_STATUS_COLORS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
      {EQUIPMENT_STATUS_LABELS[status]}
    </span>
  );
};

// ─── EquipmentForm ────────────────────────────────────────────────────────────
interface FormData {
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  inventoryNumber: string;
  status: EquipmentStatus;
  purchasedAt: string;
  warrantyUntil: string;
  location: string;
  notes: string;
}

const emptyForm = (): FormData => ({
  type: 'laptop',
  brand: '',
  model: '',
  serialNumber: '',
  inventoryNumber: '',
  status: 'available',
  purchasedAt: '',
  warrantyUntil: '',
  location: '',
  notes: '',
});

interface EquipmentFormProps {
  initial?: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  nextId: string;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ initial, onSave, onCancel, nextId }) => {
  const [form, setForm] = useState<FormData>(initial ?? emptyForm());

  const brands = BRANDS_BY_TYPE[form.type] ?? [];
  const models = form.brand ? (MODELS_BY_BRAND[form.brand] ?? []) : [];

  const set_ = (k: keyof FormData, v: string) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === 'type') { next.brand = ''; next.model = ''; }
      if (k === 'brand') { next.model = ''; }
      return next;
    });

  const inp = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  } as React.CSSProperties;

  const label = { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 4, display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.06em' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!initial && (
        <div style={{ padding: '8px 12px', background: 'rgba(255,105,0,0.08)', border: '1px solid rgba(255,105,0,0.2)', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Nowe ID: </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6900' }}>{nextId}</span>
        </div>
      )}

      {/* Type */}
      <div>
        <label style={label}>Typ sprzętu</label>
        <select value={form.type} onChange={(e) => set_('type', e.target.value as EquipmentType)} style={inp}>
          {EQUIPMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Brand + Model */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={label}>Marka</label>
          <select value={form.brand} onChange={(e) => set_('brand', e.target.value)} style={inp}>
            <option value="">— wybierz —</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Model</label>
          <select value={form.model} onChange={(e) => set_('model', e.target.value)} style={{ ...inp, opacity: !form.brand ? 0.5 : 1 }} disabled={!form.brand}>
            <option value="">— wybierz —</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Serial + Inventory */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={label}>Nr seryjny</label>
          <input value={form.serialNumber} onChange={(e) => set_('serialNumber', e.target.value)} style={inp} placeholder="SN12345678" />
        </div>
        <div>
          <label style={label}>Nr inwentarzowy</label>
          <input value={form.inventoryNumber} onChange={(e) => set_('inventoryNumber', e.target.value)} style={inp} placeholder="INV-001" />
        </div>
      </div>

      {/* Status */}
      <div>
        <label style={label}>Status</label>
        <select value={form.status} onChange={(e) => set_('status', e.target.value as EquipmentStatus)} style={inp}>
          {(Object.keys(EQUIPMENT_STATUS_LABELS) as EquipmentStatus[]).map((s) => (
            <option key={s} value={s}>{EQUIPMENT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={label}>Data zakupu</label>
          <input type="date" value={form.purchasedAt} onChange={(e) => set_('purchasedAt', e.target.value)} style={inp} />
        </div>
        <div>
          <label style={label}>Gwarancja do</label>
          <input type="date" value={form.warrantyUntil} onChange={(e) => set_('warrantyUntil', e.target.value)} style={inp} />
        </div>
      </div>

      {/* Location */}
      <div>
        <label style={label}>Lokalizacja / Sala</label>
        <input value={form.location} onChange={(e) => set_('location', e.target.value)} style={inp} placeholder="np. Sala 204, Budynek A" />
      </div>

      {/* Notes */}
      <div>
        <label style={label}>Uwagi</label>
        <textarea value={form.notes} onChange={(e) => set_('notes', e.target.value)} style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Dodatkowe informacje..." />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          Anuluj
        </button>
        <button
          onClick={() => {
            if (!form.brand || !form.model) { alert('Wybierz markę i model.'); return; }
            onSave(form);
          }}
          style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: '#FF6900', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
        >
          Zapisz
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EquipmentPage: React.FC = () => {
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useEquipmentStore();
  const { people } = usePeopleStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Equipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Next ID preview
  const nextId = useMemo(() => {
    if (equipment.length === 0) return 'EQ-001';
    const max = equipment.reduce((m, e) => {
      const n = parseInt(e.id.replace('EQ-', ''), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    return `EQ-${String(max + 1).padStart(3, '0')}`;
  }, [equipment]);

  // Stats
  const stats = useMemo(() => ({
    available: equipment.filter((e) => e.status === 'available').length,
    assigned:  equipment.filter((e) => e.status === 'assigned').length,
    service:   equipment.filter((e) => e.status === 'service').length,
    retired:   equipment.filter((e) => e.status === 'retired').length,
  }), [equipment]);

  // Types that have equipment
  const usedTypes = useMemo(() => {
    const s = new Set(equipment.map((e) => e.type));
    return EQUIPMENT_TYPES.filter((t) => s.has(t.value));
  }, [equipment]);

  // Filtered list
  const filtered = useMemo(() => {
    return equipment.filter((e) => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.id.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q) ||
          e.model.toLowerCase().includes(q) ||
          e.serialNumber.toLowerCase().includes(q) ||
          e.inventoryNumber.toLowerCase().includes(q) ||
          (e.location ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipment, filterType, search]);

  const personName = (id?: string) => {
    if (!id) return null;
    const p = people.find((p) => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  const handleAdd = async (form: FormData) => {
    await addEquipment({
      type: form.type,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      inventoryNumber: form.inventoryNumber,
      status: form.status,
      purchasedAt: form.purchasedAt || undefined,
      warrantyUntil: form.warrantyUntil || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
    });
    setShowForm(false);
  };

  const handleEdit = async (form: FormData) => {
    if (!editItem) return;
    await updateEquipment(editItem.id, {
      type: form.type,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      inventoryNumber: form.inventoryNumber,
      status: form.status,
      purchasedAt: form.purchasedAt || undefined,
      warrantyUntil: form.warrantyUntil || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
    });
    setEditItem(null);
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Sprzęt IT
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>
            {equipment.length} pozycji w inwentarzu
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditItem(null); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: '#FF6900', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Dodaj sprzęt
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {([
          { label: 'Dostępne',    count: stats.available, color: '#4ade80' },
          { label: 'Przydzielone', count: stats.assigned,  color: '#60a5fa' },
          { label: 'Serwis',      count: stats.service,   color: '#facc15' },
          { label: 'Wycofane',    count: stats.retired,   color: '#9ca3af' },
        ] as const).map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid',
              borderColor: filterType === 'all' ? '#FF6900' : 'rgba(255,255,255,0.1)',
              background: filterType === 'all' ? 'rgba(255,105,0,0.12)' : 'transparent',
              color: filterType === 'all' ? '#FF6900' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Wszystkie ({equipment.length})
          </button>
          {usedTypes.map((t) => {
            const cnt = equipment.filter((e) => e.type === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setFilterType(t.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 8, border: '1px solid',
                  borderColor: filterType === t.value ? '#FF6900' : 'rgba(255,255,255,0.1)',
                  background: filterType === t.value ? 'rgba(255,105,0,0.12)' : 'transparent',
                  color: filterType === t.value ? '#FF6900' : 'rgba(255,255,255,0.5)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {TYPE_ICONS[t.value]} {t.label} ({cnt})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj..."
            style={{
              paddingLeft: 30, paddingRight: search ? 30 : 12,
              paddingTop: 8, paddingBottom: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#fff', fontSize: 13, width: '100%', outline: 'none',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Slide-in form (add/edit) */}
      {(showForm || editItem) && (
        <div style={{ ...cardStyle, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>
              {editItem ? `Edytuj — ${editItem.id}` : 'Nowy sprzęt'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
          <EquipmentForm
            initial={editItem ? {
              type: editItem.type,
              brand: editItem.brand,
              model: editItem.model,
              serialNumber: editItem.serialNumber,
              inventoryNumber: editItem.inventoryNumber,
              status: editItem.status,
              purchasedAt: editItem.purchasedAt ?? '',
              warrantyUntil: editItem.warrantyUntil ?? '',
              location: editItem.location ?? '',
              notes: editItem.notes ?? '',
            } : undefined}
            onSave={editItem ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditItem(null); }}
            nextId={nextId}
          />
        </div>
      )}

      {/* Table */}
      <div style={cardStyle}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Package size={32} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 12 }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Brak sprzętu spełniającego kryteria</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['ID', 'Typ', 'Marka / Model', 'Nr Seryjny', 'Nr Inw.', 'Status', 'Przydzielony do', 'Akcje'].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <React.Fragment key={eq.id}>
                  <tr
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setExpandedId(expandedId === eq.id ? null : eq.id)}
                  >
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#FF6900', whiteSpace: 'nowrap' }}>{eq.id}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{TYPE_ICONS[eq.type]}</span>
                        {EQUIPMENT_TYPE_LABELS[eq.type]}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{eq.brand}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{eq.model}</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{eq.serialNumber || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{eq.inventoryNumber || '—'}</td>
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={eq.status} /></td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                      {personName(eq.assignedToId) ?? <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setEditItem(eq); setShowForm(false); }}
                          title="Edytuj"
                          style={{ padding: 6, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                        >
                          <Edit2 size={12} />
                        </button>
                        {deleteConfirm === eq.id ? (
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button onClick={async () => { await deleteEquipment(eq.id); setDeleteConfirm(null); }} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Usuń
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 8px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>
                              Nie
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(eq.id)}
                            title="Usuń"
                            style={{ padding: 6, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 2 }}>
                          {expandedId === eq.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded details row */}
                  {expandedId === eq.id && (
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td colSpan={8} style={{ padding: '16px 18px 20px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                          {[
                            { label: 'Typ', value: EQUIPMENT_TYPE_LABELS[eq.type] },
                            { label: 'Marka', value: eq.brand },
                            { label: 'Model', value: eq.model },
                            { label: 'Nr seryjny', value: eq.serialNumber || '—' },
                            { label: 'Nr inwentarzowy', value: eq.inventoryNumber || '—' },
                            { label: 'Lokalizacja', value: eq.location || '—' },
                            { label: 'Data zakupu', value: eq.purchasedAt ? new Date(eq.purchasedAt).toLocaleDateString('pl-PL') : '—' },
                            { label: 'Gwarancja do', value: eq.warrantyUntil ? new Date(eq.warrantyUntil).toLocaleDateString('pl-PL') : '—' },
                            { label: 'Przydzielony do', value: personName(eq.assignedToId) ?? '—' },
                            { label: 'Data przydzielenia', value: eq.assignedAt ? new Date(eq.assignedAt).toLocaleDateString('pl-PL') : '—' },
                            { label: 'Dodano', value: new Date(eq.createdAt).toLocaleDateString('pl-PL') },
                          ].map((d) => (
                            <div key={d.label}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{d.label}</div>
                              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{d.value}</div>
                            </div>
                          ))}
                          {eq.notes && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Uwagi</div>
                              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{eq.notes}</div>
                            </div>
                          )}
                          {eq.warrantyUntil && new Date(eq.warrantyUntil) < new Date() && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, gridColumn: '1 / -1' }}>
                              <AlertCircle size={13} style={{ color: '#f87171' }} />
                              <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Gwarancja wygasła</span>
                            </div>
                          )}
                          {eq.warrantyUntil && new Date(eq.warrantyUntil) >= new Date() && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, gridColumn: '1 / -1' }}>
                              <CheckCircle size={13} style={{ color: '#4ade80' }} />
                              <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>Gwarancja aktywna</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EquipmentPage;
