import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Search, X, Edit2, Trash2, Mail, Phone, Building2,
  ChevronDown, ChevronUp, User, Crown, MapPin, StickyNote,
  UserCheck,
} from 'lucide-react';
import { usePeopleStore } from '../store/peopleStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { Person, Department } from '../types';
import { CDV_ROOMS } from '../utils/helpers';
import { tk } from '../utils/theme';

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
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${color}30, ${color}18)`,
      border: `2px solid ${color}45`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800, color, flexShrink: 0,
      boxShadow: `0 4px 12px ${color}20`,
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
  isManager: boolean;
}

const emptyPersonForm = (): PersonFormData => ({
  firstName: '', lastName: '', email: '', phone: '',
  position: '', department: '', supervisorId: '', room: '', notes: '', isManager: false,
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

const inp: React.CSSProperties = {
  background: tk.inputBg,
  border: `1px solid ${tk.inputBorder}`,
  borderRadius: 10,
  padding: '9px 13px',
  color: tk.text,
  fontSize: 13,
  width: '100%',
  outline: 'none',
};
const lbl: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: tk.text4,
  marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em',
};

const PersonForm: React.FC<PersonFormProps> = ({ initial, departments, people, editId, onSave, onCancel, onAddDept }) => {
  const [form, setForm] = useState<PersonFormData>(initial ?? emptyPersonForm());
  const [newDept, setNewDept] = useState('');
  const [addingDept, setAddingDept] = useState(false);
  const [formError, setFormError] = useState('');

  const set_ = (k: keyof PersonFormData, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  // Only managers can be selected as supervisor
  const managerOptions = people.filter((p) => p.id !== editId && p.isManager);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Manager toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: form.isManager ? 'rgba(255,105,0,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.isManager ? 'rgba(255,105,0,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Crown size={15} style={{ color: form.isManager ? '#FF6900' : 'rgba(255,255,255,0.3)' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: form.isManager ? '#FF6900' : 'rgba(255,255,255,0.7)', margin: 0 }}>Kierownik działu</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Tylko kierownicy mogą być wybrani jako przełożeni</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => set_('isManager', !form.isManager)}
          style={{
            position: 'relative', width: 44, height: 24, borderRadius: 99, border: 'none',
            cursor: 'pointer', flexShrink: 0,
            background: form.isManager ? '#FF6900' : 'rgba(255,255,255,0.12)',
            transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: form.isManager ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

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
          {departments.length > 0 ? (
            <select value={form.department} onChange={(e) => set_('department', e.target.value)} style={{ ...inp, flex: 1 }}>
              <option value="">— wybierz dział —</option>
              {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          ) : (
            <input value={form.department} onChange={(e) => set_('department', e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Wpisz nazwę działu" />
          )}
          {!addingDept && (
            <button onClick={() => setAddingDept(true)} style={{ padding: '9px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#FF6900', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>
              + Nowy
            </button>
          )}
        </div>
        {addingDept && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={newDept} onChange={(e) => setNewDept(e.target.value)} style={{ ...inp, flex: 1 }} placeholder="Nazwa nowego działu" />
            <button
              onClick={async () => {
                if (!newDept.trim()) return;
                await onAddDept(newDept.trim());
                set_('department', newDept.trim());
                setNewDept(''); setAddingDept(false);
              }}
              style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#FF6900', color: '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
            >Dodaj</button>
            <button onClick={() => setAddingDept(false)} style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <div>
        <label style={lbl}>
          Przełożony
          {managerOptions.length === 0 && (
            <span style={{ color: 'rgba(255,165,0,0.7)', fontWeight: 500, marginLeft: 6, textTransform: 'none' }}>
              — brak zdefiniowanych kierowników
            </span>
          )}
        </label>
        <select value={form.supervisorId} onChange={(e) => set_('supervisorId', e.target.value)} style={inp} disabled={managerOptions.length === 0}>
          <option value="">— brak przełożonego —</option>
          {managerOptions.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.position}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Sala / Pokój</label>
          <input
            list="cdv-rooms-people"
            value={form.room}
            onChange={(e) => set_('room', e.target.value)}
            style={inp}
            placeholder="np. 204, Budynek A"
          />
          <datalist id="cdv-rooms-people">
            {CDV_ROOMS.map((r) => <option key={r} value={r} />)}
          </datalist>
        </div>
        <div />
      </div>

      <div>
        <label style={lbl}>Uwagi</label>
        <textarea value={form.notes} onChange={(e) => set_('notes', e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="Dodatkowe informacje..." />
      </div>

      {formError && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>
          {formError}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${tk.cardBorder}` }}>
        <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${tk.inputBorder}`, background: 'transparent', color: tk.text3, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          Anuluj
        </button>
        <button
          onClick={() => {
            setFormError('');
            const missing = [];
            if (!form.firstName.trim()) missing.push('Imię');
            if (!form.lastName.trim()) missing.push('Nazwisko');
            if (!form.email.trim()) missing.push('Email');
            if (!form.position.trim()) missing.push('Stanowisko');
            if (!form.department.trim()) missing.push('Dział');
            if (missing.length > 0) { setFormError(`Wypełnij wymagane pola: ${missing.join(', ')}`); return; }
            onSave(form);
          }}
          style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #FF6900, #E85D00)', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(255,105,0,0.3)' }}
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
    <div
      style={{
        background: tk.cardBg,
        border: `1px solid ${person.isManager ? 'rgba(255,105,0,0.2)' : tk.cardBorder}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = person.isManager ? 'rgba(255,105,0,0.4)' : 'rgba(255,255,255,0.16)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = person.isManager ? 'rgba(255,105,0,0.2)' : 'rgba(var(--c-border-rgb, 255,255,255), 0.08)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Color accent strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${color}cc, ${color}44)` }} />

      <div style={{ padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {/* Top row: avatar + name + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar person={person} size={46} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14.5, fontWeight: 800, color: tk.text, lineHeight: 1.2 }}>
                {person.firstName} {person.lastName}
              </span>
              {person.isManager && (
                <span title="Kierownik działu" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 6, background: 'rgba(255,105,0,0.2)', border: '1px solid rgba(255,105,0,0.35)', flexShrink: 0 }}>
                  <Crown size={10} style={{ color: '#FF6900' }} />
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: tk.text3, marginTop: 2, lineHeight: 1.3 }}>{person.position}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33` }}>
                {person.department}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={onEdit}
              style={{ padding: 7, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              <Edit2 size={12} />
            </button>
            {deleteConfirm ? (
              <div style={{ display: 'flex', gap: 3 }}>
                <button onClick={onDelete} style={{ padding: '5px 8px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 10.5, fontWeight: 700, cursor: 'pointer' }}>Usuń</button>
                <button onClick={() => setDeleteConfirm(false)} style={{ padding: '5px 7px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 10.5, cursor: 'pointer' }}>Nie</button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ padding: 7, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Contact & info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: `1px solid ${tk.cardBorder2}`, paddingTop: 10 }}>
          {person.email && (
            <a href={`mailto:${person.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tk.text3, textDecoration: 'none' }}>
              <Mail size={11} style={{ color: tk.text5, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.email}</span>
            </a>
          )}
          {person.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tk.text3 }}>
              <Phone size={11} style={{ color: tk.text5, flexShrink: 0 }} />{person.phone}
            </div>
          )}
          {person.room && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tk.text3 }}>
              <MapPin size={11} style={{ color: tk.text5, flexShrink: 0 }} />{person.room}
            </div>
          )}
          {supervisor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: tk.text4 }}>
              <UserCheck size={11} style={{ color: tk.text5, flexShrink: 0 }} />
              <span>Przełożony: <span style={{ color: tk.text2, fontWeight: 600 }}>{supervisor.firstName} {supervisor.lastName}</span></span>
            </div>
          )}
          {person.notes && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: tk.text4 }}>
              <StickyNote size={11} style={{ color: tk.text5, flexShrink: 0, marginTop: 1 }} />
              <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{person.notes}</span>
            </div>
          )}
        </div>

        {/* Equipment badge */}
        {equipmentCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: '#93c5fd', fontWeight: 600 }}>{equipmentCount} szt. przydzielonego sprzętu</span>
          </div>
        )}
      </div>
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

  return (
    <div style={{ background: tk.cardBg2, border: `1px solid ${tk.cardBorder}`, borderRadius: 16, overflow: 'hidden', marginTop: 24 }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', color: tk.text }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Building2 size={15} style={{ color: tk.text4 }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Zarządzanie działami ({departments.length})</span>
        </div>
        {expanded
          ? <ChevronUp size={15} style={{ color: tk.text4 }} />
          : <ChevronDown size={15} style={{ color: tk.text4 }} />}
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${tk.cardBorder2}` }}>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ ...inp, flex: 1 }}
              placeholder="Nazwa nowego działu"
              onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { addDepartment(newName.trim()); setNewName(''); } }}
            />
            <button
              onClick={() => { if (newName.trim()) { addDepartment(newName.trim()); setNewName(''); } }}
              style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#FF6900', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >+ Dodaj</button>
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
                    <button onClick={() => { setEditId(d.id); setEditName(d.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}><Edit2 size={10} /></button>
                    <button onClick={() => deleteDepartment(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}><X size={10} /></button>
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
  const [filterRole, setFilterRole] = useState<'all' | 'managers' | 'staff'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [saveError, setSaveError] = useState('');

  const equipmentCountFor = (personId: string) =>
    equipment.filter((e) => e.assignedToId === personId).length;

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (filterDept !== 'all' && p.department !== filterDept) return false;
      if (filterRole === 'managers' && !p.isManager) return false;
      if (filterRole === 'staff' && p.isManager) return false;
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
  }, [people, filterDept, filterRole, search]);

  const handleSave = async (form: PersonFormData) => {
    setSaveError('');
    const data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      position: form.position,
      department: form.department,
      isManager: form.isManager,
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.supervisorId ? { supervisorId: form.supervisorId } : {}),
      ...(form.room.trim() ? { room: form.room.trim() } : {}),
      ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
    };

    try {
      if (editPerson) {
        await updatePerson(editPerson.id, data);
      } else {
        await addPerson(data);
      }
      setShowForm(false);
      setEditPerson(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Błąd zapisu: ${msg}`);
    }
  };

  const usedDepts = useMemo(() => {
    const s = new Set(people.map((p) => p.department));
    return departments.filter((d) => s.has(d.name));
  }, [people, departments]);

  const managerCount = people.filter((p) => p.isManager).length;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Baza Pracowników</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>{people.length} pracowników</p>
            {managerCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#FF6900', background: 'rgba(255,105,0,0.1)', border: '1px solid rgba(255,105,0,0.2)', borderRadius: 20, padding: '2px 10px' }}>
                <Crown size={11} /> {managerCount} kierownik{managerCount > 1 ? 'ów' : 'a'}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditPerson(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6900, #E85D00)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,105,0,0.3)', flexShrink: 0 }}
        >
          <Plus size={15} /> Dodaj osobę
        </button>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Role filter */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([
            { value: 'all', label: 'Wszyscy' },
            { value: 'managers', label: 'Kierownicy', icon: <Crown size={11} /> },
            { value: 'staff', label: 'Pracownicy', icon: <User size={11} /> },
          ] as { value: 'all' | 'managers' | 'staff'; label: string; icon?: React.ReactNode }[]).map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setFilterRole(value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8, border: 'none',
                background: filterRole === value ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: filterRole === value ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Dept filter pills */}
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterDept('all')}
            style={{ padding: '6px 13px', borderRadius: 8, border: `1px solid ${filterDept === 'all' ? '#FF6900' : 'rgba(255,255,255,0.1)'}`, background: filterDept === 'all' ? 'rgba(255,105,0,0.12)' : 'transparent', color: filterDept === 'all' ? '#FF6900' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Wszystkie działy
          </button>
          {usedDepts.map((d) => {
            const cnt = people.filter((p) => p.department === d.name).length;
            const color = deptColor(d.name);
            return (
              <button
                key={d.id}
                onClick={() => setFilterDept(d.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${filterDept === d.name ? color : 'rgba(255,255,255,0.1)'}`, background: filterDept === d.name ? `${color}18` : 'transparent', color: filterDept === d.name ? color : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {d.name} <span style={{ opacity: 0.6 }}>({cnt})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj pracownika..."
            style={{ ...inp, paddingLeft: 32, paddingRight: search ? 30 : 12, paddingTop: 9, paddingBottom: 9 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editPerson) && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>
              {editPerson ? `Edytuj — ${editPerson.firstName} ${editPerson.lastName}` : 'Nowy pracownik'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditPerson(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
          {saveError && (
            <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, fontSize: 13, color: '#fca5a5' }}>
              {saveError}
            </div>
          )}
          <PersonForm
            initial={editPerson ? {
              firstName: editPerson.firstName, lastName: editPerson.lastName,
              email: editPerson.email, phone: editPerson.phone ?? '',
              position: editPerson.position, department: editPerson.department,
              supervisorId: editPerson.supervisorId ?? '', room: editPerson.room ?? '',
              notes: editPerson.notes ?? '', isManager: editPerson.isManager ?? false,
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
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <Users size={32} style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 12 }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Brak pracowników spełniających kryteria</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
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
