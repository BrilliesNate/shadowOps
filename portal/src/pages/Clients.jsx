import { Users } from 'lucide-react'

export default function Clients() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="text-[21px] font-black tracking-tight">Clients</h1>
        <p className="text-[12.5px] text-slate-400 mt-0.5">Manage client accounts and contracts</p>
      </div>
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.055] rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Users size={22} className="text-green-500" strokeWidth={1.8} />
        </div>
        <p className="font-bold text-slate-700 dark:text-slate-200">Clients module coming soon</p>
        <p className="text-sm text-slate-400 mt-1">This feature is under development.</p>
      </div>
    </div>
  )
}
