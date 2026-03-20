import { useState, useEffect } from 'react'
import {
  ShieldUser, Plus, Search, Users, Clock,
  CheckCircle, X, Loader2, Pencil, Trash2,
  ChevronDown, Phone, MapPin, Hash, AlertTriangle
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

// ── Constants ─────────────────────────────────────────────────
const STATUS_OPTIONS = ['on_duty', 'off_duty', 'patrol', 'on_leave']

const STATUS_CFG = {
  on_duty:  { label: 'On Duty',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  off_duty: { label: 'Off Duty',  dot: 'bg-slate-400',   badge: 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10' },
  patrol:   { label: 'On Patrol', dot: 'bg-blue-400',    badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  on_leave: { label: 'On Leave',  dot: 'bg-amber-400',   badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
}

const EMPTY_FORM = {
  full_name:    '',
  phone:        '',
  badge_number: '',
  status:       'off_duty',
  site_id:      '',
  shift_start:  '',
  shift_end:    '',
}

// ── Helpers ───────────────────────────────────────────────────
function initials(name) {
  if (!name) return '?'
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
]

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.off_duty
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <Icon size={15} className="text-slate-400" strokeWidth={1.8} />
      </div>
      <p className="text-[30px] font-black tracking-tight text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-[11.5px] text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" />
  )
}

function Select({ value, onChange, children }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-colors">
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ── GuardModal ────────────────────────────────────────────────
function GuardModal({ guard, sites, onClose, onSaved }) {
  const isEdit = !!guard?.id
  const [form,   setForm]   = useState(() => isEdit ? {
    full_name:    guard.profile?.full_name ?? '',
    phone:        guard.profile?.phone ?? '',
    badge_number: guard.badge_number ?? '',
    status:       guard.status ?? 'off_duty',
    site_id:      guard.site_id ?? '',
    shift_start:  guard.shift_start ? guard.shift_start.slice(0,16) : '',
    shift_end:    guard.shift_end   ? guard.shift_end.slice(0,16)   : '',
  } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name.trim()) return showToast('Full name is required', 'error')
    setSaving(true)
    try {
      if (isEdit) {
        // Update profile
        const { error: pErr } = await supabase
          .from('profiles')
          .update({ full_name: form.full_name.trim(), phone: form.phone.trim() })
          .eq('id', guard.id)
        if (pErr) throw pErr

        // Update guard record
        const { error: gErr } = await supabase
          .from('guards')
          .update({
            badge_number: form.badge_number.trim() || null,
            status:       form.status,
            site_id:      form.site_id || null,
            shift_start:  form.shift_start || null,
            shift_end:    form.shift_end   || null,
          })
          .eq('id', guard.id)
        if (gErr) throw gErr
        showToast('Guard updated', 'success')

      } else {
        // 1. Create auth user via Supabase (invite by email is ideal but requires service role)
        // For now: create a profile + guard record directly
        // The profile needs a valid auth user id — so we use a placeholder approach:
        // We'll insert into profiles with a generated id, then create the guard
        // NOTE: In production, use Supabase admin invite flow
        const newId = crypto.randomUUID()

        const { error: pErr } = await supabase
          .from('profiles')
          .insert({
            id:        newId,
            full_name: form.full_name.trim(),
            phone:     form.phone.trim(),
            role:      'guard',
          })
        if (pErr) throw pErr

        const { error: gErr } = await supabase
          .from('guards')
          .insert({
            id:           newId,
            badge_number: form.badge_number.trim() || null,
            status:       form.status,
            site_id:      form.site_id || null,
            shift_start:  form.shift_start || null,
            shift_end:    form.shift_end   || null,
          })
        if (gErr) throw gErr
        showToast('Guard added', 'success')
      }

      onSaved()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Guard' : 'Add Guard'}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{isEdit ? 'Update guard details' : 'Add a new guard to the roster'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">

          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name *">
              <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Kabelo Dlamini" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+27 82 000 0000" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Badge Number">
              <Input value={form.badge_number} onChange={e => set('badge_number', e.target.value)} placeholder="e.g. SO-0042" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s} className="bg-white dark:bg-slate-900">{STATUS_CFG[s].label}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Assigned Site">
            <Select value={form.site_id} onChange={e => set('site_id', e.target.value)}>
              <option value="" className="bg-white dark:bg-slate-900">No site assigned</option>
              {sites.map(s => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900">{s.name}</option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Shift Start">
              <Input type="datetime-local" value={form.shift_start} onChange={e => set('shift_start', e.target.value)} />
            </Field>
            <Field label="Shift End">
              <Input type="datetime-local" value={form.shift_end} onChange={e => set('shift_end', e.target.value)} />
            </Field>
          </div>

          <div className="flex gap-3 pt-2 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Guard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── DeleteModal ───────────────────────────────────────────────
function DeleteModal({ guard, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()
  const name = guard.profile?.full_name ?? 'this guard'

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await supabase.from('guards').delete().eq('id', guard.id)
      if (error) throw error
      showToast('Guard removed', 'success')
      onDeleted()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl animate-fade-in p-6">
        <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">Remove Guard</h2>
        <p className="text-[13px] text-slate-400 mb-6">
          Remove <strong className="text-slate-700 dark:text-slate-200">{name}</strong> from the roster? Their profile will be kept.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── GuardRow (table row) ──────────────────────────────────────
function GuardRow({ guard, onEdit, onDelete }) {
  const name     = guard.profile?.full_name ?? '—'
  const phone    = guard.profile?.phone     ?? '—'
  const siteName = guard.site?.name         ?? '—'

  function fmtTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <tr className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
      {/* Avatar + name */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[11px] font-bold shrink-0">
            {initials(name)}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{name}</p>
            <p className="text-[11.5px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone size={10} strokeWidth={2} /> {phone}
            </p>
          </div>
        </div>
      </td>

      {/* Badge */}
      <td className="px-4 py-3.5">
        <span className="text-[12px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Hash size={11} strokeWidth={2} />
          {guard.badge_number ?? '—'}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <StatusBadge status={guard.status} />
      </td>

      {/* Site */}
      <td className="px-4 py-3.5">
        <span className="text-[12.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <MapPin size={11} strokeWidth={2} />
          {siteName}
        </span>
      </td>

      {/* Shift */}
      <td className="px-4 py-3.5">
        <span className="text-[12px] text-slate-400 font-variant-numeric: tabular-nums flex items-center gap-1.5">
          <Clock size={11} strokeWidth={2} />
          {guard.shift_start ? `${fmtTime(guard.shift_start)} — ${fmtTime(guard.shift_end)}` : '—'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(guard)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(guard)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function Guards() {
  const [guards,   setGuards]   = useState([])
  const [sites,    setSites]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [modal,    setModal]    = useState(null)
  const [selected, setSelected] = useState(null)
  const { showToast } = useToast()
  const { isManager } = useAuth()

  async function fetchGuards() {
    try {
      const { data, error } = await supabase
        .from('guards')
        .select('*, profile:profiles(full_name, phone, role), site:sites(name)')
      if (error) throw error
      // Sort client-side by name
      const sorted = (data ?? []).sort((a, b) =>
        (a.profile?.full_name ?? '').localeCompare(b.profile?.full_name ?? '')
      )
      setGuards(sorted)
    } catch (err) {
      showToast('Failed to load guards', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSites() {
    const { data } = await supabase.from('sites').select('id, name').eq('status', 'active').order('name')
    setSites(data ?? [])
  }

  useEffect(() => { fetchGuards(); fetchSites() }, [])

  const visible = guards.filter(g => {
    const name = g.profile?.full_name ?? ''
    const badge = g.badge_number ?? ''
    const q = search.toLowerCase()
    const matchSearch = name.toLowerCase().includes(q) || badge.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || g.status === filter
    return matchSearch && matchFilter
  })

  // Stats
  const total    = guards.length
  const onDuty   = guards.filter(g => g.status === 'on_duty').length
  const onPatrol = guards.filter(g => g.status === 'patrol').length
  const offDuty  = guards.filter(g => g.status === 'off_duty').length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[21px] font-black tracking-tight text-slate-900 dark:text-white">Guards</h1>
          <p className="text-[12.5px] text-slate-400 mt-0.5">Manage your security personnel roster</p>
        </div>
        {isManager && (
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors">
            <Plus size={15} strokeWidth={2.5} /> Add Guard
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Guards" value={total}    sub="On roster"      icon={Users} />
        <StatCard label="On Duty"      value={onDuty}   sub="At their sites" icon={CheckCircle} />
        <StatCard label="On Patrol"    value={onPatrol} sub="Active patrols" icon={ShieldUser} />
        <StatCard label="Off Duty"     value={offDuty}  sub="Available"      icon={Clock} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or badge…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'on_duty', 'patrol', 'off_duty', 'on_leave'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors
                ${filter === f
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}>
              {f === 'all' ? 'All' : STATUS_CFG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <ShieldUser size={22} className="text-slate-400" strokeWidth={1.8} />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
              {search || filter !== 'all' ? 'No guards match your search' : 'No guards yet'}
            </p>
            <p className="text-[13px] text-slate-400 mb-4">
              {search || filter !== 'all' ? 'Try a different search or filter' : 'Add your first guard to the roster'}
            </p>
            {!search && filter === 'all' && isManager && (
              <button onClick={() => setModal('add')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors">
                <Plus size={14} /> Add First Guard
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04]">
                  {['Guard', 'Badge', 'Status', 'Site', 'Shift', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(g => (
                  <GuardRow key={g.id} guard={g}
                    onEdit={g  => { setSelected(g); setModal('edit') }}
                    onDelete={g => { setSelected(g); setModal('delete') }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && visible.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-white/[0.04] text-[12px] text-slate-400">
            Showing {visible.length} of {total} guards
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <GuardModal sites={sites} onClose={() => setModal(null)} onSaved={fetchGuards} />
      )}
      {modal === 'edit' && selected && (
        <GuardModal guard={selected} sites={sites}
          onClose={() => { setModal(null); setSelected(null) }} onSaved={fetchGuards} />
      )}
      {modal === 'delete' && selected && (
        <DeleteModal guard={selected}
          onClose={() => { setModal(null); setSelected(null) }} onDeleted={fetchGuards} />
      )}
    </div>
  )
}
