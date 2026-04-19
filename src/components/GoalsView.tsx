"use client";

import { useState } from "react";

interface Goal {
    id: string;
    icon: string;
    name: string;
    category: string;
    color: string;
    bgColor: string;
    borderColor: string;
    totalHours: number;
    doneHours: number;
    unit: string;
    aiHint: string;
    aiHintType: "warn" | "ok" | "great";
    tasks: { id: string; text: string; done: boolean; time: string }[];
}

const GOALS: Goal[] = [
    {
        id: "python",
        icon: "🐍",
        name: "Python Learning Plan",
        category: "Learning",
        color: "#5ba4e5",
        bgColor: "#e6f1fb",
        borderColor: "#5ba4e5",
        totalHours: 10,
        doneHours: 4.2,
        unit: "h",
        aiHint: "You're behind schedule. Want AI to add 1 extra hour this weekend to catch up?",
        aiHintType: "warn",
        tasks: [
            { id: "p1", text: "Chapter 3: Functions & Modules", done: true, time: "Mon · 1.5h" },
            { id: "p2", text: "Chapter 4: Object-Oriented Programming", done: false, time: "Wed · 2h" },
            { id: "p3", text: "20 Practice Problems", done: false, time: "Fri · 1h" },
        ],
    },
    {
        id: "run",
        icon: "🏃",
        name: "Daily Morning Run 30min",
        category: "Fitness",
        color: "#4bbfa8",
        bgColor: "#e0f7f3",
        borderColor: "#4bbfa8",
        totalHours: 21,
        doneHours: 15,
        unit: "days",
        aiHint: "5/7 days done this week — great consistency! Tomorrow's run is scheduled at 7:00.",
        aiHintType: "great",
        tasks: [
            { id: "r1", text: "Monday Morning Run 30min", done: true, time: "7:00 · Done" },
            { id: "r2", text: "Tuesday Morning Run 30min", done: true, time: "7:00 · Done" },
            { id: "r3", text: "Wednesday Morning Run 30min", done: false, time: "7:00 · Tomorrow" },
        ],
    },
    {
        id: "analysis",
        icon: "📊",
        name: "Competitor Analysis Report",
        category: "Work",
        color: "#e784b0",
        bgColor: "#fce9f3",
        borderColor: "#e784b0",
        totalHours: 10,
        doneHours: 6,
        unit: "h",
        aiHint: "On track — estimated completion by Friday. AI has reserved 2h Thursday afternoon.",
        aiHintType: "ok",
        tasks: [
            { id: "c1", text: "Research & Data Collection", done: true, time: "Mon · 2h" },
            { id: "c2", text: "Data Analysis Phase", done: true, time: "Tue · 2h" },
            { id: "c3", text: "Report Writing", done: false, time: "Thu · 2h" },
            { id: "c4", text: "Review & Submit", done: false, time: "Fri · 2h" },
        ],
    },
    {
        id: "review",
        icon: "📝",
        name: "Monthly Retrospective",
        category: "Work",
        color: "#f0a653",
        bgColor: "#fef3e2",
        borderColor: "#f0a653",
        totalHours: 4,
        doneHours: 1,
        unit: "h",
        aiHint: "3 hours remaining, due end of month. AI suggests scheduling 2h Saturday afternoon — OK?",
        aiHintType: "warn",
        tasks: [
            { id: "m1", text: "Collect Monthly Data", done: true, time: "Mon · 1h" },
            { id: "m2", text: "Write Retrospective Doc", done: false, time: "Sat · 2h" },
            { id: "m3", text: "Share & Archive", done: false, time: "End of month · 1h" },
        ],
    },
];

const hintStyle: Record<string, React.CSSProperties> = {
    warn: { background: "#fef3e2", border: "1.5px solid #f0c670", color: "#7a4508" },
    ok: { background: "#e0f7f3", border: "1.5px solid #9fe1cb", color: "#0a5e49" },
    great: { background: "#ede9fb", border: "1.5px solid #c4b8f0", color: "#5347a8" },
};

const hintIcon: Record<string, string> = {
    warn: "⚠️",
    ok: "✅",
    great: "🦄",
};

function GoalCard({ goal }: { goal: Goal }) {
    const [tasks, setTasks] = useState(goal.tasks);
    const [expanded, setExpanded] = useState(true);
    const pct = Math.round((goal.doneHours / goal.totalHours) * 100);
    const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    return (
        <div style={{ background: "#fff", borderRadius: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: expanded ? "1px solid var(--border)" : "none", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: goal.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, border: `1.5px solid ${goal.borderColor}` }}>
                        {goal.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ fontSize: "15px", fontWeight: 900, color: "var(--text)" }}>{goal.name}</div>
                            <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "8px", background: goal.bgColor, color: goal.color }}>{goal.category}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>
                            {goal.doneHours} / {goal.totalHours}{goal.unit} · {pct}% complete
                        </div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: goal.color, letterSpacing: "-1px" }}>{pct}%</div>
                    <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "4px" }}>{expanded ? "▲" : "▼"}</span>
                </div>
                <div style={{ height: "10px", background: "var(--bg)", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <div style={{ height: "100%", borderRadius: "20px", background: `linear-gradient(90deg, ${goal.color}cc, ${goal.color})`, width: `${pct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <div style={{ marginTop: "10px", borderRadius: "10px", padding: "9px 12px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "flex-start", gap: "7px", lineHeight: 1.5, ...hintStyle[goal.aiHintType] }}>
                    <span>{hintIcon[goal.aiHintType]}</span>
                    <span style={{ flex: 1 }}>{goal.aiHint}</span>
                    {goal.aiHintType === "warn" && (
                        <button style={{ padding: "4px 10px", borderRadius: "8px", border: "none", background: goal.color, color: "#fff", fontSize: "11px", fontWeight: 800, cursor: "pointer", flexShrink: 0, fontFamily: "Nunito, sans-serif" }} onClick={e => { e.stopPropagation(); }}>
                            Let AI Schedule
                        </button>
                    )}
                </div>
            </div>
            {expanded && (
                <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "4px" }}>✨ AI Sub-tasks</div>
                    {tasks.map(task => (
                        <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", background: task.done ? "var(--bg)" : "#fff", border: task.done ? "1px solid var(--border)" : `1.5px dashed ${goal.borderColor}`, cursor: "pointer", opacity: task.done ? 0.6 : 1, transition: "all .2s" }} onClick={() => toggleTask(task.id)}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: task.done ? "none" : `2px solid ${goal.borderColor}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: task.done ? goal.color : "transparent", color: "#fff", fontSize: "11px", fontWeight: 800 }}>
                                {task.done ? "✓" : ""}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: task.done ? "var(--muted)" : "var(--text)", textDecoration: task.done ? "line-through" : "none" }}>{task.text}</div>
                                <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginTop: "1px" }}>{task.time}</div>
                            </div>
                            <span style={{ fontSize: "10px", color: "var(--muted2)" }}>✨</span>
                        </div>
                    ))}
                    <button style={{ marginTop: "4px", padding: "8px", borderRadius: "10px", border: `1.5px dashed ${goal.borderColor}`, background: "transparent", fontSize: "12px", fontWeight: 800, color: goal.color, cursor: "pointer", fontFamily: "Nunito, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        ✨ Ask AI to break down more sub-tasks
                    </button>
                </div>
            )}
        </div>
    );
}

export default function GoalsView() {
    const totalGoals = GOALS.length;
    const avgPct = Math.round(GOALS.reduce((s, g) => s + (g.doneHours / g.totalHours) * 100, 0) / totalGoals);

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {[
                    { lbl: "Active Goals", val: `${totalGoals}`, color: "var(--purple)" },
                    { lbl: "Avg. Completion", val: `${avgPct}%`, color: "var(--teal)" },
                    { lbl: "AI Tasks This Week", val: "12", color: "var(--pink)" },
                    { lbl: "Current Streak", val: "7 days 🔥", color: "var(--amber)" },
                ].map(s => (
                    <div key={s.lbl} style={{ background: "#fff", borderRadius: "14px", padding: "14px 16px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
                        <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "5px" }}>{s.lbl}</div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: s.color, letterSpacing: "-0.5px" }}>{s.val}</div>
                    </div>
                ))}
            </div>
            {GOALS.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
    );
}
