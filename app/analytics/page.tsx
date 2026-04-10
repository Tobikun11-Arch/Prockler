"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { formatDuration } from "@/lib/date";
import { useAllTasks } from "@/hooks/useTasks";

type ViewMode = "month" | "year";

export default function AnalyticsPage() {
  const all = useAllTasks();

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const { startDate, endDate } = useMemo(() => {
    if (viewMode === "year") {
      return {
        startDate: new Date(year, 0, 1).getTime(),
        endDate: new Date(year, 11, 31, 23, 59, 59).getTime(),
      };
    }

    return {
      startDate: new Date(year, month, 1).getTime(),
      endDate: new Date(year, month + 1, 0, 23, 59, 59).getTime(),
    };
  }, [viewMode, year, month]);

  const tasks = useMemo(
    () => all.filter((t) => t.entryDate >= startDate && t.entryDate <= endDate),
    [all, startDate, endDate]
  );

  const totalTasks = tasks.length;
  const totalMinutes = useMemo(
    () => tasks.reduce((s, t) => s + (t.durationMinutes ?? 0), 0),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "Completed").length,
    [tasks]
  );
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      const key = (t.taskCategory ?? "Uncategorized").trim() || "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + (t.durationMinutes ?? 0));
    }
    return Array.from(map.entries())
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [tasks]);

  const periodLabel =
    viewMode === "year"
      ? `${year}`
      : new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <AppShell>
      <div className="mb-8">
        <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Insights</div>
        <h1 className="text-4xl md:text-5xl font-black mt-2">Analytics</h1>
      </div>

      <div className="border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-xs tracking-[0.18em] uppercase border border-border ${
                viewMode === "month" ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
              onClick={() => setViewMode("month")}
              type="button"
            >
              Month
            </button>
            <button
              className={`px-3 py-1 text-xs tracking-[0.18em] uppercase border border-border ${
                viewMode === "year" ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
              onClick={() => setViewMode("year")}
              type="button"
            >
              Year
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 text-xs border border-border"
              onClick={() => {
                if (viewMode === "year") setYear((y) => y - 1);
                else if (month === 0) {
                  setMonth(11);
                  setYear((y) => y - 1);
                } else setMonth((m) => m - 1);
              }}
            >
              Prev
            </button>
            <div className="text-sm font-medium min-w-[160px] text-center">{periodLabel}</div>
            <button
              type="button"
              className="px-3 py-1 text-xs border border-border"
              onClick={() => {
                if (viewMode === "year") setYear((y) => y + 1);
                else if (month === 11) {
                  setMonth(0);
                  setYear((y) => y + 1);
                } else setMonth((m) => m + 1);
              }}
            >
              Next
            </button>
          </div>
        </div>

        {totalTasks === 0 ? (
          <div className="mt-6 text-sm text-muted-foreground">No data for {periodLabel}.</div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground tracking-[0.18em] uppercase">Total Tasks</div>
                <div className="text-3xl font-black mt-2">{totalTasks}</div>
              </div>
              <div className="border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground tracking-[0.18em] uppercase">Hours Worked</div>
                <div className="text-3xl font-black mt-2">{formatDuration(totalMinutes)}</div>
              </div>
              <div className="border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground tracking-[0.18em] uppercase">Completed</div>
                <div className="text-3xl font-black mt-2">{completedTasks}</div>
              </div>
              <div className="border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground tracking-[0.18em] uppercase">Completion Rate</div>
                <div className="text-3xl font-black mt-2">{completionRate}%</div>
                <div className="mt-2 h-1 bg-secondary overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${completionRate}%` }} />
                </div>
              </div>
            </div>

            <div className="border border-border bg-background p-4">
              <div className="text-xs text-muted-foreground tracking-[0.18em] uppercase">By category</div>
              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground tracking-[0.18em] uppercase">
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBreakdown.map((c) => (
                      <tr key={c.name} className="border-t border-border">
                        <td className="py-2">{c.name}</td>
                        <td className="py-2 text-right">{c.minutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
