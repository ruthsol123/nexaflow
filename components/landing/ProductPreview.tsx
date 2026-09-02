import {
  Activity,
  Bell,
  ChevronDown,
  Circle,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Users,
} from "lucide-react";

const tasks = [
  ["Redesign onboarding flow", "In progress", "cyan"],
  ["Q3 launch checklist", "Complete", "green"],
  ["Review analytics report", "To do", "amber"],
];
const avatars = ["AM", "JK", "RS", "LN"];

export function ProductPreview() {
  return (
    <section className="relative px-4 pb-16 pt-2 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 xl:pb-32">
      <div className="float-preview dashboard-shadow mx-auto max-w-6xl overflow-hidden rounded-xl border border-white/12 bg-[#0b121e]">
        <div className="flex h-10 items-center gap-2 border-b border-white/8 bg-white/2.5 px-4">
          <span className="size-2 rounded-full bg-[#ff6b6b]" />
          <span className="size-2 rounded-full bg-[#ffd166]" />
          <span className="size-2 rounded-full bg-[#61d095]" />
          <div className="mx-auto hidden flex items-center gap-2 rounded-md border border-white/8 px-3 py-1 text-[10px] text-slate-500 sm:flex"><Search size={11} /> Search anything</div>
        </div>
        <div className="grid min-h-105 grid-cols-[150px_1fr] sm:grid-cols-[190px_1fr]">
          <aside className="hidden border-r border-white/8 p-4 sm:block">
            <div className="mb-7 flex items-center gap-2 text-xs font-semibold"><span className="flex size-6 items-center justify-center rounded bg-cyan-300 text-[#07101d]"><LayoutDashboard size={13} /></span> NexaFlow</div>
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Workspace</p>
            <div className="space-y-1 text-[11px] text-slate-500">
              <div className="rounded-md bg-cyan-300/10 px-2.5 py-2 text-cyan-200"><LayoutDashboard className="mr-2 inline" size={13} /> Overview</div>
              <div className="px-2.5 py-2"><Activity className="mr-2 inline" size={13} /> My tasks</div>
              <div className="px-2.5 py-2"><Users className="mr-2 inline" size={13} /> Team</div>
              <div className="px-2.5 py-2"><Settings2 className="mr-2 inline" size={13} /> Settings</div>
            </div>
            <p className="mb-2 mt-8 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Projects</p>
            <div className="space-y-3 px-2.5 text-[11px] text-slate-500">
              <div><span className="mr-2 inline-block size-1.5 rounded-full bg-cyan-300" />Nexa website</div>
              <div><span className="mr-2 inline-block size-1.5 rounded-full bg-violet-400" />Mobile app</div>
              <div><span className="mr-2 inline-block size-1.5 rounded-full bg-amber-300" />Marketing</div>
            </div>
          </aside>
          <div className="min-w-0 p-4 sm:p-5 lg:p-8">
            <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-slate-500">Projects / Nexa website</p><h2 className="mt-2 text-base font-semibold text-white sm:text-lg lg:text-xl">Nexa website <ChevronDown className="ml-1 inline text-slate-500" size={15} /></h2></div><button aria-label="More project options" className="text-slate-500 shrink-0"><MoreHorizontal size={18} /></button></div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:gap-3 lg:grid-cols-4"><Metric label="Open tasks" value="24" change="+12%" /><Metric label="Completed" value="68" change="+18%" /><Metric label="Team members" value="12" change="+2" /><Metric label="On track" value="84%" change="This week" /></div>
            <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-lg border border-white/8 bg-white/2.5 p-3 sm:p-4"><div className="mb-3 flex items-center justify-between sm:mb-4"><h3 className="text-xs font-medium">Recent tasks</h3><button className="text-[10px] text-cyan-300">View all</button></div>{tasks.map(([task, status, color]) => <div className="flex items-center justify-between border-t border-white/6 py-2 text-[11px] sm:py-3" key={task}><span className="flex min-w-0 items-center gap-2 truncate text-slate-300"><Circle size={10} className={color === "green" ? "text-emerald-300" : color === "amber" ? "text-amber-300" : "text-cyan-300"} />{task}</span><span className={`ml-2 shrink-0 rounded-full px-2 py-1 text-[9px] ${color === "green" ? "bg-emerald-300/10 text-emerald-300" : color === "amber" ? "bg-amber-300/10 text-amber-300" : "bg-cyan-300/10 text-cyan-300"}`}>{status}</span></div>)}</div>
              <div className="rounded-lg border border-white/8 bg-white/2.5 p-3 sm:p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-medium">Team velocity</h3><span className="text-[10px] text-slate-500">Last 7 days</span></div><div className="mt-3 flex h-16 items-end gap-1.5 sm:mt-4 sm:h-20 sm:gap-2">{[35, 48, 42, 65, 55, 76, 88].map((height, index) => <div className="flex-1 rounded-t bg-linear-to-t from-blue-500/50 to-cyan-300" style={{ height: `${height}%`, opacity: .55 + index * .06 }} key={height} />)}</div><div className="mt-2 flex justify-between text-[9px] text-slate-600 sm:mt-3"><span>Mon</span><span>Sun</span></div></div>
            </div>
            <div className="mt-4 flex flex-col items-start gap-2 text-[10px] text-slate-500 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><span className="flex items-center gap-2"><Bell size={13} /> 4 updates this week</span><span className="flex items-center gap-2">Active team <span className="flex -space-x-1.5">{avatars.map((avatar) => <span className="flex size-6 items-center justify-center rounded-full border-2 border-[#0b121e] bg-slate-600 text-[8px] text-white" key={avatar}>{avatar}</span>)}</span><Plus size={13} /></span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, change }: { label: string; value: string; change: string }) {
  return <div className="rounded-lg border border-white/8 bg-white/2.5 p-2.5 sm:p-3"><p className="text-[10px] text-slate-500">{label}</p><div className="mt-2 flex items-end justify-between gap-1"><strong className="text-base font-medium text-white sm:text-lg">{value}</strong><span className="text-[9px] text-emerald-300">{change}</span></div></div>;
}
