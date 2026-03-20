import { useState, useEffect } from 'react'
import {
  Building2, ShieldUser, AlertTriangle, Timer,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ── Demo data (used until real tables exist) ──────────────────
const DEMO_TREND = [
  { date:'Mar 5',  incidents:3, resolved:3 },
  { date:'Mar 7',  incidents:5, resolved:4 },
  { date:'Mar 9',  incidents:2, resolved:2 },
  { date:'Mar 11', incidents:4, resolved:4 },
  { date:'Mar 13', incidents:6, resolved:5 },
  { date:'Mar 15', incidents:3, resolved:3 },
  { date:'Mar 17', incidents:2, resolved:2 },
  { date:'Mar 19', incidents:3, resolved:2 },
]

const DEMO_ACTIVITY = [
  { id:1, type:'checkin',  color:'bg-green-500',  text:'K. Dlamini checked in at Sandton City Mall',     site:'Sandton City',      time:'1m ago' },
  { id:2, type:'patrol',   color:'bg-blue-500',   text:'M. Nkosi completed patrol sweep — Sector 3',    site:'Rosebank Tower',    time:'4m ago' },
  { id:3, type:'incident', color:'bg-red-500',    text:'Unauthorized access reported at Gate B',          site:'Melrose Arch',      time:'11m ago' },
  { id:4, type:'alert',    color:'bg-amber-500',  text:'Camera offline — Zone 4 perimeter',              site:'Bryanston Offices', time:'18m ago' },
  { id:5, type:'checkin',  color:'bg-green-500',  text:'T. Mokoena started night shift',                 site:'Fourways Mall',     time:'24m ago' },
]

const DEMO_INCIDENTS = [
  { id:'#INC-0847', type:'Unauthorized Access', site:'Melrose Arch',      guard:'M. Nkosi',     time:'11:42', priority:'high', status:'open' },
  { id:'#INC-0846', type:'Suspicious Activity', site:'Sandton City Mall', guard:'K. Dlamini',   time:'09:17', priority:'med',  status:'resolved' },
  { id:'#INC-0845', type:'Camera Offline',      site:'Bryanston Offices', guard:'S. van Wyk',   time:'08:55', priority:'med',  status:'open' },
  { id:'#INC-0844', type:'Medical Emergency',   site:'Fourways Mall',     guard:'T. Mokoena',   time:'07:30', priority:'high', status:'resolved' },
]

// ── Sub-components ────────────────────────────────────────────
function StatCard({ label, value, unit, trend, trendLabel, icon: Icon, iconColor }) {
  const up = trend === 'up'
  const down = trend === 'down'
  return (
    <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl p-[18px] flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-white/10 transition-all hover:-translate-y-[1px]">
      <div className="flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{label}</p>
        <p className="text-[34px] font-black leading-none tracking-tight">
          {value}
          {unit && <span className="text-[16px] font-medium text-slate-400 ml-0.5">{unit}</span>}
        </p>
        <div className={`flex items-center gap-1 mt-2 text-[12px] font-medium ${up ? 'text-green-500' : down ? 'text-red-400' : 'text-slate-400'}`}>
          {up && <TrendingUp size={13} />}
          {down && <TrendingDown size={13} />}
          <span>{trendLabel}</span>
        </div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
    </div>
  )
}

function ActivityItem({ item }) {
  const TAG = {
    checkin:  { cls: 'bg-green-500/10 text-green-500', label: 'Check-in' },
    patrol:   { cls: 'bg-blue-500/10  text-blue-400',  label: 'Patrol' },
    incident: { cls: 'bg-red-500/10   text-red-400',   label: 'Incident' },
    alert:    { cls: 'bg-amber-500/10 text-amber-400', label: 'Alert' },
    report:   { cls: 'bg-purple-500/10 text-purple-400', label: 'Report' },
  }
  const tag = TAG[item.type] ?? TAG.alert
  return (
    <div className="flex items-start gap-3 py-[10px] border-b border-slate-100 dark:border-white/[0.04] last:border-0 animate-fade-in">
      <div className={`w-2 h-2 rounded-full ${item.color} shrink-0 mt-1.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-snug">{item.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tag.cls}`}>{tag.label}</span>
          <span className="text-[11.5px] text-slate-400">{item.site}</span>
          <span className="text-[11.5px] text-slate-400">{item.time}</span>
        </div>
      </div>
    </div>
  )
}

const P_STYLE = {
  high: 'text-red-400',
  med:  'text-amber-400',
  low:  'text-green-500',
}
const S_STYLE = {
  open:     'bg-amber-500/10 text-amber-400',
  resolved: 'bg-green-500/10 text-green-500',
  critical: 'bg-red-500/10   text-red-400',
}

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const { userProfile } = useAuth()
  const { dark } = useTheme()

  const [stats, setStats] = useState({ sites: 12, guards: 47, incidents: 3, responseTime: 4.2 })
  const [trendData, setTrendData]     = useState(DEMO_TREND)
  const [activity, setActivity]       = useState(DEMO_ACTIVITY)
  const [incidents, setIncidents]     = useState(DEMO_INCIDENTS)
  const [loadingStats, setLoadingStats] = useState(true)

  const chartColors = dark
    ? { tick: '#475569', grid: 'rgba(255,255,255,0.04)', tooltip: '#0d1117', text: '#e2e8f0' }
    : { tick: '#94a3b8', grid: 'rgba(0,0,0,0.05)',       tooltip: '#ffffff', text: '#0f172a' }

  // Fetch real data — gracefully falls back to demo if tables don't exist
  useEffect(() => {
    async function load() {
      try {
        // Active sites count
        const { count: sitesCount } = await supabase
          .from('sites').select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // On-duty guards count
        const { count: guardsCount } = await supabase
          .from('guards').select('*', { count: 'exact', head: true })
          .eq('status', 'on_duty')

        // Today's incidents
        const today = new Date().toISOString().split('T')[0]
        const { count: incCount } = await supabase
          .from('incidents').select('*', { count: 'exact', head: true })
          .gte('created_at', today)

        // Recent incidents list
        const { data: recentInc } = await supabase
          .from('incidents')
          .select('id, type, site:sites(name), guard:profiles(full_name), created_at, priority, status')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats(s => ({
          sites:        sitesCount ?? s.sites,
          guards:       guardsCount ?? s.guards,
          incidents:    incCount ?? s.incidents,
          responseTime: s.responseTime,
        }))

        if (recentInc?.length) {
          setIncidents(recentInc.map(i => ({
            id:       `#INC-${String(i.id).slice(-4).padStart(4,'0')}`,
            type:     i.type,
            site:     i.site?.name ?? '—',
            guard:    i.guard?.full_name ?? '—',
            time:     new Date(i.created_at).toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit', hour12:false }),
            priority: i.priority,
            status:   i.status,
          })))
        }

        // Real-time activity feed
        const { data: actData } = await supabase
          .from('activity_log')
          .select('id, type, message, site:sites(name), created_at')
          .order('created_at', { ascending: false })
          .limit(8)

        if (actData?.length) {
          const colorMap = { checkin:'bg-green-500', patrol:'bg-blue-500', incident:'bg-red-500', alert:'bg-amber-500', report:'bg-purple-500' }
          setActivity(actData.map(a => ({
            id:    a.id,
            type:  a.type,
            color: colorMap[a.type] ?? 'bg-slate-400',
            text:  a.message,
            site:  a.site?.name ?? '—',
            time:  new Date(a.created_at).toLocaleString('en-ZA', { hour:'2-digit', minute:'2-digit', hour12:false }),
          })))
        }

      } catch (err) {
        // Tables don't exist yet — demo data stays
        console.log('Using demo data:', err.message)
      } finally {
        setLoadingStats(false)
      }
    }

    load()

    // Real-time subscription for activity feed
    const channel = supabase
      .channel('activity_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' },
        payload => {
          const a = payload.new
          const colorMap = { checkin:'bg-green-500', patrol:'bg-blue-500', incident:'bg-red-500', alert:'bg-amber-500' }
          setActivity(prev => [{
            id: a.id, type: a.type,
            color: colorMap[a.type] ?? 'bg-slate-400',
            text: a.message, site: '—', time: 'just now',
          }, ...prev.slice(0, 7)])
        })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const now = new Date()

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[21px] font-black tracking-tight">Operations Center</h1>
          <p className="text-[12.5px] text-slate-400 mt-0.5">
            {now.toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-green-500 uppercase tracking-wider">All Systems Operational</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-black text-[13px] font-bold transition-colors">
            + New Incident
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active Sites"      value={stats.sites}        trend="up"   trendLabel="All secured"       icon={Building2}   iconColor="bg-green-500/10 text-green-500" />
        <StatCard label="Guards On Duty"    value={stats.guards}       trend="up"   trendLabel="+3 from yesterday" icon={ShieldUser}   iconColor="bg-blue-500/10 text-blue-400" />
        <StatCard label="Incidents Today"   value={stats.incidents}    trend="down" trendLabel="−2 vs yesterday"   icon={AlertTriangle} iconColor="bg-amber-500/10 text-amber-400" />
        <StatCard label="Avg Response Time" value={stats.responseTime} unit="m" trend="up" trendLabel="0.8m faster" icon={Timer}       iconColor="bg-red-500/10 text-red-400" />
      </div>

      {/* Trend chart */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.04]">
          <h2 className="text-[13px] font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Activity size={15} className="text-slate-400" strokeWidth={1.8} />
            Weekly Incident Trend
          </h2>
          <div className="flex gap-2">
            {['7 days','30 days','90 days'].map(l => (
              <button key={l}
                className={`px-2.5 py-1 rounded-lg text-[11.5px] font-semibold transition-colors
                  ${l === '30 days'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                    : 'bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[140px] px-4 pt-3 pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="date" tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chartColors.tick, fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{ background: chartColors.tooltip, border: `1px solid ${chartColors.grid}`, borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: chartColors.text, fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: chartColors.tick }} />
              <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#22c55e" strokeWidth={2} fill="url(#gInc)" dot={{ r:3, fill:'#22c55e', strokeWidth:0 }} />
              <Area type="monotone" dataKey="resolved"  name="Resolved"  stroke="#3b82f6" strokeWidth={1.5} fill="url(#gRes)" dot={{ r:2, fill:'#3b82f6', strokeWidth:0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Quick metrics row */}
        <div className="grid grid-cols-4 border-t border-slate-100 dark:border-white/[0.04] divide-x divide-slate-100 dark:divide-white/[0.04]">
          {[
            { label:'Total This Month', val:'28', sub:'↓ 12% vs last month', subColor:'text-green-500' },
            { label:'Resolved',         val:'25', sub:'89% resolution rate', subColor:'text-slate-400' },
            { label:'Open Cases',       val:'3',  sub:'Avg 2.4h open time',  subColor:'text-slate-400', valColor:'text-amber-400' },
            { label:'Critical Alerts',  val:'1',  sub:'Melrose Arch — Gate B', subColor:'text-slate-400', valColor:'text-red-400' },
          ].map(m => (
            <div key={m.label} className="px-4 py-3.5">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">{m.label}</p>
              <p className={`text-[22px] font-black ${m.valColor ?? ''}`}>{m.val}</p>
              <p className={`text-[11px] mt-0.5 ${m.subColor}`}>{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed + Incidents table */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* Activity feed */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.04]">
            <h2 className="text-[13px] font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Activity size={15} className="text-slate-400" strokeWidth={1.8} />
              Live Activity Feed
            </h2>
            <button className="text-[12px] text-green-500 font-semibold hover:opacity-70 transition-opacity">View all</button>
          </div>
          <div className="px-5 py-1 max-h-[320px] overflow-y-auto">
            {activity.map(item => <ActivityItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* Recent incidents */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.04]">
            <h2 className="text-[13px] font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <AlertTriangle size={15} className="text-slate-400" strokeWidth={1.8} />
              Recent Incidents
            </h2>
            <button className="text-[12px] text-green-500 font-semibold hover:opacity-70 transition-opacity">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04]">
                  {['Type','Site','Priority','Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map(i => (
                  <tr key={i.id} className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{i.type}</td>
                    <td className="px-4 py-3 text-slate-400">{i.site}</td>
                    <td className={`px-4 py-3 font-semibold ${P_STYLE[i.priority] ?? ''}`}>
                      {i.priority === 'high' ? 'High' : i.priority === 'med' ? 'Med' : 'Low'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${S_STYLE[i.status] ?? ''}`}>
                        {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
