"use client";

import { useApp } from "@/lib/store";

interface BarItem { val: string; h: number; color: string; lbl: string; }
interface DonutItem { color: string; name: string; pct: string; }

function getHeatmapColor(w: number, d: number): string {
    const colors = ["#f0eef8", "#d9d2f5", "#b09fe8", "#7c6fcd", "#5347a8"];
    const seed = (w * 7 + d) % 17;
    const idx = seed < 4 ? 0 : seed < 8 ? 1 : seed < 11 ? 2 : seed < 14 ? 3 : 4;
    return colors[idx];
}

const CATEGORY_COLOR: Record<string, string> = {
    Fitness: "#4bbfa8",
    Work: "#e784b0",
    Learning: "#5ba4e5",
    Travel: "#7c6fcd",
    Other: "#f0a653",
};

export default function StatsView() {
    const { events, goals } = useApp();

    // ── Derive KPIs from live data ──────────────────────────────────────────
    const confirmedEvents = events.filter(e => e.status === "confirmed" || e.status === undefined);
    const aiEvents = confirmedEvents.filter(e => e.type === "ai");
    const totalTasks = aiEvents.length;

    // Tasks completed = goal tasks marked done
    const allGoalTasks = goals.flatMap(g => g.tasks);
    const doneTasks = allGoalTasks.filter(t => t.done).length;
    const completionRate = allGoalTasks.length > 0
        ? Math.round((doneTasks / allGoalTasks.length) * 100)
        : 86; // fallback seed

    // Focus time: estimate 0.5h per AI event
    const focusHours = (totalTasks * 0.5 + 14.5).toFixed(1);

    // ── Bar chart: daily AI events this week ───────────────────────────────
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));

    const barData: BarItem[] = DOW.map((lbl, i) => {
        const day = new Date(weekStart);
        day.setUTCDate(weekStart.getUTCDate() + i);
        const count = aiEvents.filter(e => {
            const d = new Date(e.isoDate);
            return d.getUTCFullYear() === day.getUTCFullYear() &&
                d.getUTCMonth() === day.getUTCMonth() &&
                d.getUTCDate() === day.getUTCDate();
        }).length;
        // Seed baseline + live count
        const seedH = [30, 60, 50, 40, 70, 20, 20][i];
        const h = Math.min(100, seedH + count * 10);
        const val = (seedH / 20 * 0.5 + count * 0.5).toFixed(1) + "h";
        return { val, h, color: i === now.getUTCDay() ? "#5347a8" : "#7c6fcd", lbl };
    });

    // ── Donut: category breakdown from AI goals ────────────────────────────
    const catCounts: Record<string, number> = { Work: 0, Fitness: 0, Learning: 0, Travel: 0, Other: 0 };
    for (const g of goals) catCounts[g.category] = (catCounts[g.category] ?? 0) + g.tasks.length;
    // Add seed baseline
    catCounts.Work += 10; catCounts.Fitness += 6; catCounts.Learning += 4; catCounts.Travel += 4; catCounts.Other += 2;
    const catTotal = Object.values(catCounts).reduce((a, b) => a + b, 0);
    const donutLegend: DonutItem[] = Object.entries(catCounts)
        .filter(([, v]) => v > 0)
        .map(([name, v]) => ({ color: CATEGORY_COLOR[name] ?? "#ccc", name, pct: `${Math.round((v / catTotal) * 100)}%` }));

    // ── Goal progress rows ─────────────────────────────────────────────────
    const seedRows = [
        { name: "Competitor Analysis", pct: 60, color: "#e784b0", val: "6 / 10h" },
        { name: "Python Learning Plan", pct: 42, color: "#5ba4e5", val: "4.2 / 10h" },
    ];
    const aiRows = goals.map(g => {
        const done = g.tasks.filter(t => t.done).length;
        const pct = g.tasks.length > 0 ? Math.round((done / g.tasks.length) * 100) : 0;
        return { name: g.name, pct, color: g.color, val: `${done} / ${g.tasks.length} sessions` };
    });
    const catRows = [...aiRows, ...seedRows];

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)" }}>
            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
                {[
                    { lbl: "Focus Time This Week", val: `${focusHours}h`, chg: "↑ 18% vs last week", up: true },
                    { lbl: "Tasks Completed", val: `${doneTasks + 23}`, chg: `↑ ${doneTasks} AI tasks`, up: true },
                    { lbl: "Completion Rate", val: `${completionRate}%`, chg: "↑ 12pp", up: true },
                    { lbl: "Current Streak", val: "7 days", chg: "Best: 14 days", neutral: true },
                ].map(k => (
                    <div key={k.lbl} style={{ background: "#fff", borderRadius: "16px", padding: "16px 18px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
                        <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "6px" }}>{k.lbl}</div>
                        <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text)", letterSpacing: "-1px" }}>{k.val}</div>
                        <div style={{ fontSize: "11px", fontWeight: 800, marginTop: "5px", color: k.up ? "var(--green)" : "var(--muted)" }}>{k.chg}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: "14px", marginBottom: "22px" }}>
                {/* Bar Chart */}
                <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>Daily Focus Time (This Week)</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "130px" }}>
                        {barData.map(b => (
                            <div key={b.lbl} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text)" }}>{b.val}</div>
                                <div style={{ width: "100%", borderRadius: "8px 8px 0 0", background: b.color, height: `${b.h}%`, minHeight: "4px", transition: "height .6s ease" }} />
                                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)" }}>{b.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut Chart */}
                <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>Task Type Breakdown</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#f0eef8" strokeWidth="16" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#7c6fcd" strokeWidth="16" strokeDasharray="95.5 143.3" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#4bbfa8" strokeWidth="16" strokeDasharray="57.3 181.4" strokeDashoffset="-95.5" transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#e784b0" strokeWidth="16" strokeDasharray="38.2 200.5" strokeDashoffset="-152.8" transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#f0a653" strokeWidth="16" strokeDasharray="26.4 212.3" strokeDashoffset="-191" transform="rotate(-90 50 50)" />
                            <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="800" fill="#2d2456" fontFamily="Nunito,sans-serif">{doneTasks + 23}</text>
                        </svg>
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px", flex: 1 }}>
                            {donutLegend.map(l => (
                                <div key={l.name} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", flex: 1 }}>{l.name}</div>
                                    <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--muted)" }}>{l.pct}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Progress */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: "22px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>Goal Progress</div>
                {catRows.map(r => (
                    <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "11px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", minWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                        <div style={{ flex: 1, height: "10px", background: "var(--bg)", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)" }}>
                            <div style={{ height: "100%", borderRadius: "20px", background: r.color, width: `${r.pct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--muted)", minWidth: "100px", textAlign: "right" }}>{r.val}</div>
                    </div>
                ))}
            </div>

            {/* Heatmap */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: "22px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>Activity Heatmap (Last 12 Weeks)</div>
                <div style={{ display: "flex", gap: "3px", marginBottom: "6px", paddingLeft: "20px" }}>
                    {["May", "Jun", "Jul"].map(m => (
                        <span key={m} style={{ flex: 1, fontSize: "10px", fontWeight: 700, color: "var(--muted)" }}>{m}</span>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", justifyContent: "space-around", paddingTop: "2px" }}>
                        {["Mon", "Wed", "Fri", "Sun"].map(d => (
                            <div key={d} style={{ fontSize: "9px", color: "var(--muted2)", fontWeight: 700, height: "13px", display: "flex", alignItems: "center" }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "3px" }}>
                        {Array.from({ length: 12 }, (_, w) => (
                            <div key={w} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                {Array.from({ length: 7 }, (_, d) => (
                                    <div key={d} style={{ width: "13px", height: "13px", borderRadius: "3px", background: getHeatmapColor(w, d), cursor: "pointer", transition: "transform .15s" }} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trend */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: "22px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>8-Week Focus Trend</div>
                <svg width="100%" height="80" viewBox="0 0 500 80" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                    <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c6fcd" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#7c6fcd" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0,65 L62,50 L125,42 L187,38 L250,30 L312,18 L375,22 L500,10" fill="none" stroke="#7c6fcd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0,65 L62,50 L125,42 L187,38 L250,30 L312,18 L375,22 L500,10 L500,80 L0,80 Z" fill="url(#trendGrad)" />
                    {[[0, 65], [62, 50], [125, 42], [187, 38], [250, 30], [312, 18], [375, 22]].map(([x, y]) => (
                        <circle key={x} cx={x} cy={y} r="4" fill="#7c6fcd" />
                    ))}
                    <circle cx="500" cy="10" r="5" fill="#5347a8" stroke="#fff" strokeWidth="2" />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)", fontWeight: 700, marginTop: "4px" }}>
                    <span>Avg 8.2h/wk</span><span>Avg 10.5h/wk</span><span>Avg 12.8h/wk</span>
                    <span style={{ color: "var(--purple-deep)", fontWeight: 900 }}>This week {focusHours}h ↑</span>
                </div>
            </div>
        </div>
    );
}
