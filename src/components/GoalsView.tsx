"use client";

import { useState } from "react";
import { useApp, type Goal } from "@/lib/store";

// ── Seed goals (always shown as baseline) ─────────────────────────────────────

const SEED_GOALS: Goal[] = [
    {
        id: "python",
        icon: "🐍",
        name: "Python Learning Plan",
        category: "Learning",
        color: "#5ba4e5",
        bgColor: "#e6f1fb",
        borderColor: "#5ba4e5",
        totalSessions: 10,
        doneSessions: 4,
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
        id: "analysis",
        icon: "📊",
        name: "Competitor Analysis Report",
        category: "Work",
        color: "#e784b0",
        bgColor: "#fce9f3",
        borderColor: "#e784b0",
        totalSessions: 10,
        doneSessions: 6,
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

function GoalCard({ goal, onToggleTask }: { goal: Goal; onToggleTask: (taskId: string) => void }) {
    const [expanded, setExpanded] = useState(true);
    const doneTasks = goal.tasks.filter(t => t.done).length;
    // For AI goals: use task completion ratio; for seed goals: use doneSessions/totalSessions
    const pct = goal.tasks.length > 0
        ? Math.round((doneTasks / goal.tasks.length) * 100)
        : goal.totalSessions > 0
            ? Math.round((goal.doneSessions / goal.totalSessions) * 100)
            : 0;

    return (
        <div style={{ background: "#fff", borderRadius: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: expanded ? "1px solid var(--border)" : "none", cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: goal.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0, border: `1.5px solid ${goal.borderColor}` }}>
                        {goal.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <div style={{ fontSize: "15px", fontWeight: 900, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>{goal.name}</div>
                            <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "8px", background: goal.bgColor, color: goal.color, flexShrink: 0 }}>{goal.category}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>
                            {doneTasks} / {goal.tasks.length > 0 ? goal.tasks.length : goal.totalSessions} {goal.tasks.length > 0 ? "tasks" : goal.unit} · {pct}% complete
                        </div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: goal.color, letterSpacing: "-1px", flexShrink: 0 }}>{pct}%</div>
                    <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "4px", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
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
                    {goal.tasks.map(task => (
                        <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px", background: task.done ? "var(--bg)" : "#fff", border: task.done ? "1px solid var(--border)" : `1.5px dashed ${goal.borderColor}`, cursor: "pointer", opacity: task.done ? 0.6 : 1, transition: "all .2s" }} onClick={() => onToggleTask(task.id)}>
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
    const { goals: aiGoals, toggleGoalTask, streakDays } = useApp();

    // Merge seed goals with AI-generated goals (AI goals appear first if new)
    const seedIds = new Set(SEED_GOALS.map(g => g.id));
    const newAiGoals = aiGoals.filter(g => !seedIds.has(g.id));
    const allGoals = [...newAiGoals, ...SEED_GOALS];

    const totalGoals = allGoals.length;
    const avgPct = totalGoals > 0
        ? Math.round(allGoals.reduce((s, g) => {
            const pct = g.totalSessions > 0
                ? (g.doneSessions / g.totalSessions) * 100
                : g.tasks.length > 0
                    ? (g.tasks.filter(t => t.done).length / g.tasks.length) * 100
                    : 0;
            return s + pct;
        }, 0) / totalGoals)
        : 0;

    const aiTaskCount = aiGoals.reduce((s, g) => s + g.tasks.length, 0);

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {[
                    { lbl: "Active Goals", val: `${totalGoals}`, color: "var(--purple)" },
                    { lbl: "Avg. Completion", val: `${avgPct}%`, color: "var(--teal)" },
                    { lbl: "AI Tasks Added", val: `${aiTaskCount}`, color: "var(--pink)" },
                    { lbl: "Current Streak", val: `${streakDays} days 🔥`, color: "var(--amber)" },
                ].map(s => (
                    <div key={s.lbl} style={{ background: "#fff", borderRadius: "14px", padding: "14px 16px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
                        <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: "5px" }}>{s.lbl}</div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: s.color, letterSpacing: "-0.5px" }}>{s.val}</div>
                    </div>
                ))}
            </div>

            {/* New AI goals banner */}
            {newAiGoals.length > 0 && (
                <div style={{ background: "linear-gradient(135deg,#ede9fb,#e0f7f3)", borderRadius: "14px", padding: "12px 16px", border: "1.5px solid #c4b8f0", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>✨</span>
                    <div>
                        <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--purple-deep)" }}>
                            {newAiGoals.length} new goal{newAiGoals.length > 1 ? "s" : ""} auto-detected from your calendar!
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>
                            {newAiGoals.map(g => `${g.icon} ${g.name}`).join(" · ")}
                        </div>
                    </div>
                </div>
            )}

            {allGoals.map(g => (
                <GoalCard
                    key={g.id}
                    goal={g}
                    onToggleTask={(taskId) => toggleGoalTask(g.id, taskId)}
                />
            ))}
        </div>
    );
}
