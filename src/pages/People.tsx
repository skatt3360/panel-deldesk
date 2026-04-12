import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Search, X, Edit2, Trash2, Mail, Phone, Building2,
  ChevronDown, ChevronUp, User,
} from 'lucide-react';
import { usePeopleStore } from '../store/peopleStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { Person, Department } from '../types';

// ─── Dept color palette ───────────────────────────────────────────────────────
const DEPT_COLORS = [
  '#FF6900', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ec4899', '#06b6d4', '#6366f1', '#84cc16', '#f97316',
];
const deptColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ person: Person; size?: number }> = ({ person, size = 42 }) => {
  const color = deptColor(person.department);
  const initials = `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800, color, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

// ─── Person Form ─────────────────────────────────────────────────────────────
interface PersonFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  supervisorId: string;
  room: string;
  notes: string;
}

const emptyPersonForm = (): PersonFormData => ({
  firstName: '', lastName: '', email: '', phone: '',
  position: '', department: '', supervisorId: '', room: '', notes: '',
});

interface PersonFormProps {
  initial?: PersonFormData;
  departments: Department[];
  people: Person[];
  editId?: string;
  onSave: (data: PersonFormData) => void;
  onCancel: () => void;
  onAddDept: (name: string) => Promise<string>;
}

const PersonForm: React.FC<PersonFormProps> = ({ initial, departments, people, editId, onSave, onCancel, onAddDept }) => {
  const [form, setForm] = useState<PersonFormData>(initial ?? emptyPersonForm());
  const [newDept, setNewDept] = useState('');
  const [addingDept, setAddingDept] = useState(false);

  const set_ = (k: keyof PersonFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)',
    marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  const supervisorOptions = people.filter((p) => p.id !== editId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Imię *</label>
          <input value={form.firstName} onChange={(e) => set_('firstName', e.target.value)} style={inp} placeholder="Jan" />
        </div>
        <div>
          <label style={lbl}>Nazwisko *</label>
          <input value={form.lastName} onChange={(e) => set_('lastName', e.target.value)} style={inp} placeholder="Kowalski" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Email *</label>
          <input type="email" value={form.email} onChange={(e) => set_('email', e.target.value)} style={inp} placeholder="jan.kowalski@cdv.pl" />
        </div>
        <div>
          <label style={lbl}>Telefon</label>
          <input value={form.phone} onChange={(e) => set_('phone', e.target.value)} style={inp} placeholder="+48 123 456 789" />
        </div>
      </div>

      <div>
        <label style={lbl}>Stanowisko *</label>
        <input value={form.position} onChange={(e) => set_('position', e.target.value)} style={inp} placeholder="np. Starszy Specjalista IT" />
      </div>

      <div>
        <label style={lbl}>Dział *</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={form.department} onChange={(e) => set_('department', e.target.value)} style={{ ...inp, flex: 1 }}>
            <option value="">— wybierz dział —</option>
            {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          {!addingDept && (
            <button onClick={() => setAddingDept(true)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#FF6900', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>
              + Nowy
            </button>
          )}
        </div>
        {addingDept && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              style={{ ...inp, flex: 1 }}
              placeholder="Nazwa nowego działu"
            />
            <button
              onClick={async () => {
                if (!newDept.trim()) return;
                await onAddDept(newDept.trim());
                set_('department', newDept.trim());
                setNewDept('');
                setAddingDept(false);
              }}
              style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#FF6900', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
            >
              Dodaj
            </button>
            <button onClick={() => setAddingDept(false)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <div>
        <label style={lbl}>Przełożony</label>
        <select value={form.supervisorId} onChange={(e) => set_('supervisorId', e.target.value)} style={inp}>
          <option value="">— brak / nie dotyczy —</option>
          {supervisorOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.position}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Sala / Pokój</label>
          <input value={form.room} onChange={(e) => set_('room', e.target.value)} style={inp} placeholder="np. 204, Budynek A" />
        </div>
        <div style={{ /* spacer */ }} />
      </div>

      <div>
        <label style={lbl}>Uwagi</label>
        <textarea value={form.notes} onChange={(e) => set_('notes', e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="Dodatkowe informacje..." />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          Anuluj
        </button>
        <button
          onClick={() => {
            if (!form.firstName || !form.lastName || !form.email || !form.position || !form.department) {
              alert('Wypełnij wymagane pola.'); return;
            }
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

// ─── Person Card ──────────────────────────────────────────────────────────────
interface PersonCardProps {
  person: Person;
  people: Person[];
  equipmentCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, people, equipmentCount, onEdit, onDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const supervisor = people.find((p) => p.id === person.supervisorId);
  const color = deptColor(person.department);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: 18,
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar person={person} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
            {person.firstName} {person.lastName}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{person.position}</div>
          <span style={{ display: 'inline-block', marginTop: 5, padding: '2px 8px', borderRadius: 12, fontSize: 10.5, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33` }}>
            {person.department}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ padding: 6, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
            <Edit2 size={12} />
          </button>
          {deleteConfirm ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={onDelete} style={{ padding: '4px 8px', borderRadius: 7, border: 'none', background: '#ef4444', color: '#fff', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>Usuń</button>
              <button onClick={() => setDeleteConfirm(false)} style={{ padding: '4px 6px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 10.5, cursor: 'pointer' }}>Nie</button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} style={{ padding: 6, borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
        {person.email && (
          <a href={`mailto:${person.email}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            <Mail size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />{person.email}
          </a>
        )}
        {person.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            <Phone size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />{person.phone}
          </div>
        )}
        {person.room && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            <Building2 size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />{person.room}
          </div>
        )}
        {supervisor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            <User size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
            Przełożony: {supervisor.firstName} {supervisor.lastName}
          </div>
        )}
      </div>

      {equipmentCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>{equipmentCount} szt. przydzielonego sprzętu</span>
        </div>
      )}
    </div>
  );
};

// ─── Department Manager ───────────────────────────────────────────────────────
const DeptManager: React.FC = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = usePeopleStore();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expanded, setExpanded] = useState(false);

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 11px', color: '#fff', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginTop: 24 }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
      >
        <span style={{ fontSize: 13, fontWeight: 700 }}>Zarządzanie działami ({departments.length})</span>
        {expanded ? <ChevronUp size={15} style={{ color: 'rgba(255,255,255,0.4)' }} /> : <ChevronDown size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />}
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Nazwa nowego działu" onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { addDepartment(newName.trim()); setNewName(''); } }} />
            <button
              onClick={() => { if (newName.trim()) { addDepartment(newName.trim()); setNewName(''); } }}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#FF6900', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              + Dodaj
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {departments.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', background: `${deptColor(d.name)}12`, border: `1px solid ${deptColor(d.name)}30`, borderRadius: 20 }}>
                {editId === d.id ? (
                  <>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...inp, padding: '2px 8px', fontSize: 12, width: 120 }} />
                    <button onClick={() => { updateDepartment(d.id, { name: editName }); setEditId(null); }} style={{ padding: '2px 8px', borderRadius: 6, border: 'none', background: '#FF6900', color: '#fff', fontSize: 11, cursor: 'pointer' }}>OK</button>
                    <button onClick={() => setEditId(null)} style={{ padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer' }}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 600, color: deptColor(d.name) }}>{d.name}</span>
                    <button onClick={() => { setEditId(d.id); setEditName(d.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, lineHeight: 1 }}><Edit2 size={10} /></button>
                    <button onClick={() => deleteDepartment(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, lineHeight: 1 }}><X size={10} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PeoplePage: React.FC = () => {
  const { people, departments, addPerson, updatePerson, deletePerson, addDepartment } = usePeopleStore();
  const { equipment } = useEquipmentStore();

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);

  const equipmentCountFor = (personId: string) =>
    equipment.filter((e) => e.assignedToId === personId).length;

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (filterDept !== 'all' && p.department !== filterDept) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [people, filterDept, search]);

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
  };

  const handleSave = async (form: { firstName: string; lastName: string; email: string; phone: string; position: string; department: string; supervisorId: string; room: string; notes: string }) => {
    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      position: form.position,
      department: form.department,
      supervisorId: form.supervisorId || undefined,
      room: form.room || undefined,
      notes: form.notes || undefined,
    };
    if (editPerson) {
      await updatePerson(editPerson.id, data);
    } else {
      await addPerson(data);
    }
    setShowForm(false);
    setEditPerson(null);
  };

  const usedDepts = useMemo(() => {
    const s = new Set(people.map((p) => p.department));
    return departments.filter((d) => s.has(d.name));
  }, [people, departments]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Baza Pracowników</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>{people.length} pracowników</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditPerson(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#FF6900', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={15} /> Dodaj osobę
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterDept('all')}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: filterDept === 'all' ? '#FF6900' : 'rgba(255,255,255,0.1)', background: filterDept === 'all' ? 'rgba(255,105,0,0.12)' : 'transparent', color: filterDept === 'all' ? '#FF6900' : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Wszyscy ({people.length})
          </button>
          {usedDepts.map((d) => {
            const cnt = people.filter((p) => p.department === d.name).length;
            const color = deptColor(d.name);
            return (
              <button
                key={d.id}
                onClick={() => setFilterDept(d.name)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid', borderColor: filterDept === d.name ? color : 'rgba(255,255,255,0.1)', background: filterDept === d.name ? `${color}18` : 'transparent', color: filterDept === d.name ? color : 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                {d.name} ({cnt})
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj pracownika..." style={{ paddingLeft: 30, paddingRight: search ? 30 : 12, paddingTop: 8, paddingBottom: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 13, width: '100%', outline: 'none' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}><X size={13} /></button>}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editPerson) && (
        <div style={{ ...cardStyle, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>
              {editPerson ? `Edytuj — ${editPerson.firstName} ${editPerson.lastName}` : 'Nowy pracownik'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditPerson(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
          </div>
          <PersonForm
            initial={editPerson ? {
              firstName: editPerson.firstName,
              lastName: editPerson.lastName,
              email: editPerson.email,
              phone: editPerson.phone ?? '',
              position: editPerson.position,
              department: editPerson.department,
              supervisorId: editPerson.supervisorId ?? '',
              room: editPerson.room ?? '',
              notes: editPerson.notes ?? '',
            } : undefined}
            departments={departments}
            people={people}
            editId={editPerson?.id}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditPerson(null); }}
            onAddDept={addDepartment}
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ ...cardStyle, padding: 48, textAlign: 'center' }}>
          <Users size={32} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 12 }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Brak pracowników spełniających kryteria</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {filtered.map((p) => (
            <PersonCard
              key={p.id}
              person={p}
              people={people}
              equipmentCount={equipmentCountFor(p.id)}
              onEdit={() => { setEditPerson(p); setShowForm(false); }}
              onDelete={() => deletePerson(p.id)}
            />
          ))}
        </div>
      )}

      {/* Department Manager */}
      <DeptManager />
    </div>
  );
};

export default PeoplePage;
