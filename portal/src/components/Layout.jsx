import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, ShieldUser, AlertTriangle,
  CalendarDays, BarChart3,
  Users, Settings, LogOut, Sun, Moon, Bell, ChevronLeft, ChevronRight, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sites',      icon: MapPin,           label: 'Sites' },
  { to: '/guards',     icon: ShieldUser,       label: 'Guards' },
  { to: '/incidents',  icon: AlertTriangle,    label: 'Incidents', badge: true },
  { group: 'Management' },
  { to: '/scheduling', icon: CalendarDays,     label: 'Scheduling' },
  { to: '/reports',    icon: BarChart3,        label: 'Reports' },
  { to: '/clients',    icon: Users,            label: 'Clients' },
  { group: 'System' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
]

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('so-sidebar') === 'collapsed'
  )
  const { userProfile, signOut } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()

  function handleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('so-sidebar', next ? 'collapsed' : 'expanded')
  }

  async function handleSignOut() {
    await signOut()
    showToast('Signed out successfully', 'success')
    navigate('/login')
  }

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : '??'

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#07090c] text-slate-900 dark:text-slate-100">

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-white dark:bg-[#0d1117]
        border-r border-slate-200 dark:border-white/[0.055]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[62px]' : 'w-[244px]'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-[15px] h-[58px] border-b border-slate-200 dark:border-white/[0.055] shrink-0 overflow-hidden">
          <div className="w-[30px] h-[30px] bg-green-500 rounded-lg flex items-center justify-center shrink-0">
            <Shield size={16} className="text-black font-black" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="font-black text-[15px] uppercase tracking-widest whitespace-nowrap">
              Shadow <span className="text-green-500">Ops</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 flex flex-col gap-[2px]">
          {NAV.map((item, i) => {
            if (item.group) return collapsed ? null : (
              <p key={i} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-2 pt-4 pb-1 whitespace-nowrap">
                {item.group}
              </p>
            )
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-[10px] px-[9px] py-[8px] rounded-lg
                  text-[13.5px] font-medium whitespace-nowrap relative
                  transition-all duration-150
                  ${isActive
                    ? 'bg-green-500/10 text-green-500 before:absolute before:left-0 before:top-[22%] before:bottom-[22%] before:w-[2.5px] before:bg-green-500 before:rounded-r-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <Icon size={17} className="shrink-0" strokeWidth={1.8} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-[6px] py-[1px] rounded-full">3</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-slate-200 dark:border-white/[0.055] shrink-0">
          <div className="flex items-center gap-[10px] px-[7px] py-[8px]">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-[12.5px] font-semibold truncate">{userProfile?.full_name ?? 'User'}</p>
                <p className="text-[11px] text-slate-400 capitalize">{userProfile?.role ?? '—'}</p>
              </div>
            )}
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-[10px] w-full px-[9px] py-[8px] rounded-lg text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors whitespace-nowrap">
            <LogOut size={16} className="shrink-0" strokeWidth={1.8} />
            {!collapsed && 'Logout'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={handleCollapse}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-green-500 transition-colors shadow-sm z-10">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'ml-[62px]' : 'ml-[244px]'}`}>

        {/* Top bar */}
        <header className="sticky top-0 z-40 h-[58px] bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-white/[0.055] flex items-center px-5 gap-3 shrink-0">
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search…"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-green-500 uppercase tracking-wider">Live</span>
            </div>

            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-[#0d1117]" />
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              {dark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
