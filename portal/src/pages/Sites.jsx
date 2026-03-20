import { useState, useEffect } from 'react'
import {
  MapPin, Plus, Search, Building2, ShieldUser,
  AlertTriangle, CheckCircle, MoreHorizontal,
  X, Loader2, Pencil, Trash2, ChevronDown
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

// ── Constants ─────────────────────────────────────────────────
const STATUS_OPTIONS = ['active', 'inactive', 'alert', 'warning']

const STATUS_CFG = {
  active:   { label: 'Active',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  inactive: { label: 'Inactive', dot: 'bg-slate-400',   badge: 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10' },
  alert:    { label: 'Alert',    dot: 'bg-red-500',     badge: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  warning:  { label: 'Warning',  dot: 'bg-amber-500',   badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
}

const EMPTY_FORM = { name: '', address: '', location: '', status: 'active', client_id: '' }

// ── StatusBadge ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.inactive
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

// ── SiteModal (Add / Edit) ────────────────────────────────────
function SiteModal({ site, clients, onClose, onSaved }) {
  const [form,   setForm]   = useState(site ? { ...site, client_id: site.client_id ?? '' } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const isEdit = !!site?.id

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return showToast('Site name is required', 'error')
    setSaving(true)
    try {
      const payload = {
        name:      form.name.trim(),
        address:   form.address.trim(),
        location:  form.location.trim(),
        status:    form.status,
        client_id: form.client_id || null,
      }
      if (isEdit) {
        const { error } = await supabase.from('sites').update(payload).eq('id', site.id)
        if (error) throw error
        showToast('Site updated', 'success')
      } else {
        const { error } = await supabase.from('sites').insert(payload)
        if (error) throw error
        showToast('Site created', 'success')
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl animate-fade-in">

        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Site' : 'Add New Site'}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">{isEdit ? 'Update site details' : 'Add a new security site'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Site Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sandton City Mall"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Sandton Drive, Sandton"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Area / City</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Johannesburg"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-colors">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900">{STATUS_CFG[s].label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Client</label>
              <div className="relative">
                <select value={form.client_id} onChange={e => set('client_id', e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[13.5px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-colors">
                  <option value="" className="bg-white dark:bg-slate-900">No client</option>
                  {clients.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">{c.company_name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── DeleteModal ───────────────────────────────────────────────
function DeleteModal({ site, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await supabase.from('sites').delete().eq('id', site.id)
      if (error) throw error
      showToast('Site deleted', 'success')
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
        <h2 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">Delete Site</h2>
        <p className="text-[13px] text-slate-400 mb-6">
          Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{site.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SiteCard ──────────────────────────────────────────────────
function SiteCard({ site, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl p-5 hover:border-slate-300 dark:hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
          <Building2 size={18} className="text-slate-500 dark:text-slate-400" strokeWidth={1.8} />
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100">
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-36 bg-white dark:bg-[#161e27] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xl py-1 animate-fade-in">
                <button onClick={() => { setMenuOpen(false); onEdit(site) }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => { setMenuOpen(false); onDelete(site) }}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug mb-0.5">{site.name}</h3>
      <p className="text-[12px] text-slate-400 flex items-center gap-1 mb-3">
        <MapPin size={11} strokeWidth={2} />
        {site.location || site.address || 'No location set'}
      </p>

      <StatusBadge status={site.status} />

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <ShieldUser size={13} strokeWidth={1.8} />
          <span>{site.guard_count ?? 0} guards</span>
        </div>
        {site.client_name && (
          <span className="text-[11.5px] text-slate-400 truncate max-w-[120px]">{site.client_name}</span>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function Sites() {
  const [sites,    setSites]    = useState([])
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [modal,    setModal]    = useState(null)
  const [selected, setSelected] = useState(null)
  const { showToast } = useToast()
  const { isManager } = useAuth()

  async function fetchSites() {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*, clients(company_name), guards(id)')
        .order('name')
      if (error) throw error
      setSites(data.map(s => ({
        ...s,
        client_name: s.clients?.company_name ?? null,
        guard_count: Array.isArray(s.guards) ? s.guards.length : 0,
      })))
    } catch (err) {
      showToast('Failed to load sites', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('id, company_name').order('company_name')
    setClients(data ?? [])
  }

  useEffect(() => { fetchSites(); fetchClients() }, [])

  const visible = sites.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = s.name.toLowerCase().includes(q) ||
      (s.location ?? '').toLowerCase().includes(q) ||
      (s.address ?? '').toLowerCase().includes(q)
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  const total    = sites.length
  const active   = sites.filter(s => s.status === 'active').length
  const alerts   = sites.filter(s => s.status === 'alert').length
  const warnings = sites.filter(s => s.status === 'warning').length

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[21px] font-black tracking-tight text-slate-900 dark:text-white">Sites</h1>
          <p className="text-[12.5px] text-slate-400 mt-0.5">Manage all security deployment locations</p>
        </div>
        {isManager && (
          <button onClick={() => setModal('add')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors">
            <Plus size={15} strokeWidth={2.5} /> Add Site
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Sites" value={total}    sub="All locations"     icon={Building2} />
        <StatCard label="Active"      value={active}   sub="Fully operational" icon={CheckCircle} />
        <StatCard label="Alerts"      value={alerts}   sub="Require attention" icon={AlertTriangle} />
        <StatCard label="Warnings"    value={warnings} sub="Under observation" icon={AlertTriangle} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sites…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'active', 'alert', 'warning', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-colors
                ${filter === f
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}>
              {f === 'all' ? 'All' : STATUS_CFG[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Building2 size={22} className="text-slate-400" strokeWidth={1.8} />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
            {search || filter !== 'all' ? 'No sites match your search' : 'No sites yet'}
          </p>
          <p className="text-[13px] text-slate-400 mb-4">
            {search || filter !== 'all' ? 'Try a different search or filter' : 'Add your first site to get started'}
          </p>
          {!search && filter === 'all' && isManager && (
            <button onClick={() => setModal('add')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors">
              <Plus size={14} /> Add First Site
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map(site => (
            <SiteCard key={site.id} site={site}
              onEdit={s  => { setSelected(s); setModal('edit') }}
              onDelete={s => { setSelected(s); setModal('delete') }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'add' && (
        <SiteModal clients={clients} onClose={() => setModal(null)} onSaved={fetchSites} />
      )}
      {modal === 'edit' && selected && (
        <SiteModal site={selected} clients={clients}
          onClose={() => { setModal(null); setSelected(null) }} onSaved={fetchSites} />
      )}
      {modal === 'delete' && selected && (
        <DeleteModal site={selected}
          onClose={() => { setModal(null); setSelected(null) }} onDeleted={fetchSites} />
      )}
    </div>
  )
}
