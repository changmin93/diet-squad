import { prisma } from "@/lib/prisma";
import { History, AlertCircle } from "lucide-react";

export default async function PenaltyHistoryView() {
  const history = await prisma.penaltyHistory.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  if (history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg">
      <h2 className="text-xs font-black text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
        <History className="w-3.5 h-3.5" /> Penalty Logs
      </h2>
      <div className="space-y-4">
        {history.map((log) => (
          <div key={log.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black">{log.user.name}</span>
                <span className="text-[9px] font-bold bg-red-50 dark:bg-red-950/30 text-red-500 px-1.5 py-0.5 rounded uppercase">+{log.points} P</span>
              </div>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Week {log.week}</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic border-l-2 border-zinc-100 dark:border-zinc-800 pl-2">
              "{log.reason}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
