"use client";

import { useState } from "react";
import { useApp, CalEvent } from "@/lib/store";

// ── STATIC SEED DATA ──────────────────────────────────────────────
const SEED_EVENTS: CalEvent[] = [
    // Fixed events
    { id: "f1", day: 3, text: "Project Review", color: "chip-blue", type: "fixed" },
    { id: "f2", day: 9, text: "Team Meeting", color: "chip-blue", type: "fixed" },
    { id: "f3", day: 16, text: "Standup", color: "chip-blue", type: "fixed" },
    // AI tasks
    { id: "a1", day: 7, text: "Morning Run", color: "chip-teal", type: "ai" },
    { id: "a2", day: 8, text: "Stockholm Trip", color: "chip-purple", type: "ai" },
    { id: "a3", day: 8, text: "Run 30min", color: "chip-teal", type: "ai" },
    { id: "a4", day: 9, text: "Stockholm Trip", color: "chip-purple", type: "ai" },
    { id: "a5", day: 10, text: "Stockholm Trip", color: "chip-purple", type: "ai" },
    { id: "a6", day: 10, text: "Afternoon Workout", color: "chip-teal", type: "ai" },
    { id: "a7", day: 14, text: "Competitor Analysis", color: "chip-pink", type: "ai" },
    { id: "a8", day: 15, text: "Competitor Analysis", color: "chip-pink", type: "ai" },
    { id: "a9", day: 15, text: "Data Analysis", color: "chip-amber", type: "ai" },
    { id: "a10", day: 16, text: "Competitor Analysis", color: "chip-pink", type: "ai" },
    { id: "a11", day: 21, text: "Morning Run", color: "chip-teal", type: "ai" },
    { id: "a12", day: 28, text: "Monthly Review", color: "chip-amber", type: "ai" },
];

const chipStyle: Record<string, React.CSSProperties> = {
    "chip-purple": { background: "#ede9fb", color: "#5347a8" },
    "chip-teal": { background: "#e0f7f3", color: "#0a5e49" },
    "chip-pink": { background: "#fce9f3", color: "#993356" },
    "chip-amber": { background: "#fef3e2", color: "#7a4508" },
    "chip-blue": { background: "#e6f1fb", color: "#175fa5" },
};

const weStyle: Record<string, React.CSSProperties> = {
    "we-purple": { background: "#ede9fb", color: "#5347a8" },
    "we-teal": { background: "#e0f7f3", color: "#0a5e49" },
    "we-pink": { background: "#fce9f3", color: "#993356" },
    "we-amber": { background: "#fef3e2", color: "#7a4508" },
    "we-blue": { background: "#e6f1fb", color: "#175fa5" },
};

const TIMES = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

// ── SHARED EVENT COMPONENT ──────────────────────────────────────────────
interface CheckboxEventProps {
    text: string;
    done: boolean;
    isFixed: boolean;
    isNew?: boolean;
    color: string;
    onToggle?: () => void;
    compact?: boolean;
}

function CheckboxEvent({ text, done, isFixed, isNew, color, onToggle, compact }: CheckboxEventProps) {
    const base = chipStyle[color] || weStyle[color] || {};
    const borderStyle = isNew ? "1.5px dashed currentColor" : "1.5px solid currentColor";
    const showCheckbox = !isFixed;

    if (compact) {
        return (
            <div
                onClick={showCheckbox ? onToggle : undefined}
                style={{
                    padding: "2px 6px 2px 4px", borderRadius: "6px", fontSize: "10px", fontWeight: 800,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    cursor: showCheckbox ? "pointer" : "default", display: "flex", alignItems: "center", gap: "4px",
                    border: borderStyle, opacity: done ? 0.5 : 1,
                    animation: isNew ? "fadeSlideIn .4s ease" : undefined, transition: "opacity .25s", ...base,
                }}
            >
                {isFixed ? (
                    <span style={{ fontSize: "9px", flexShrink: 0 }}>🔒</span>
                ) : (
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", flexShrink: 0, border: `1.5px solid ${done ? "transparent" : "#666"}`, background: done ? "#5347a8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900, color: "#fff", transition: "all .2s", boxShadow: done ? "none" : "inset 0 0 0 0.5px rgba(0,0,0,0.08)" }}>
                        {done ? "✓" : ""}
                    </div>
                )}
                <span style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>{text}</span>
            </div>
        );
    }

    return (
        <div
            onClick={showCheckbox ? onToggle : undefined}
            style={{
                borderRadius: "8px", padding: "5px 8px", fontSize: "11px", fontWeight: 800,
                cursor: showCheckbox ? "pointer" : "default", display: "flex", alignItems: "center", gap: "6px",
                border: borderStyle, opacity: done ? 0.45 : 1,
                animation: isNew ? "fadeSlideIn .4s ease" : undefined, transition: "opacity .25s",
                overflow: "hidden", height: "100%", ...base,
            }}
        >
            {isFixed ? (
                <span style={{ fontSize: "10px", flexShrink: 0 }}>🔒</span>
            ) : (
                <div style={{ width: "15px", height: "15px", borderRadius: "4px", flexShrink: 0, border: done ? "none" : "1.5px solid #666", background: done ? "#5347a8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900, color: "#fff", transition: "all .2s", boxShadow: done ? "none" : "inset 0 0 0 0.5px rgba(0,0,0,0.08)" }}>
                    {done ? "✓" : ""}
                </div>
            )}
            <span style={{ textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
        </div>
    );
}

// ── MONTH VIEW ──────────────────────────────────────────────
function MonthView() {
    const { events } = useApp();
    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
    const allEvents = [...SEED_EVENTS, ...events];

    const toggleDone = (id: string) => setDoneIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const startDow = 2, daysInMonth = 31, daysInPrevMonth = 30;
    const prevDays: number[] = [];
    for (let i = 0; i < startDow; i++) prevDays.push(daysInPrevMonth - startDow + 1 + i);
    const nextDays = Array.from({ length: 35 - startDow - daysInMonth }, (_, i) => i + 1);
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: "10px", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.5px" }}>July 2025</div>
                <div style={{ display: "flex", gap: "4px" }}>
                    {["‹", "›"].map(a => <button key={a} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>{a}</button>)}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "14px", alignItems: "center" }}>
                    {[{ icon: "🔒", label: "Fixed Event" }, { icon: "☑", label: "AI Task" }].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, color: "var(--muted)" }}>
                            <span style={{ fontSize: "10px" }}>{l.icon}</span>{l.label}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                {DOW.map(d => <div key={d} style={{ padding: "8px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--muted)", letterSpacing: "0.6px" }}>{d}</div>)}
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridTemplateRows: "repeat(5,1fr)", overflow: "hidden" }}>
                {prevDays.map(d => (
                    <div key={`p${d}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "6px", background: "#faf9fd" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted2)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>{d}</div>
                    </div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const isToday = d === 15;
                    const evs = allEvents.filter(e => e.day === d);
                    return (
                        <div key={d} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "6px", background: "#fff", display: "flex", flexDirection: "column", gap: "3px", minHeight: 0, overflow: "hidden" }}>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: isToday ? "#fff" : "var(--text)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "var(--purple)" : "transparent", boxShadow: isToday ? "0 2px 6px rgba(124,111,205,0.4)" : "none", flexShrink: 0 }}>{d}</div>
                            {evs.slice(0, 2).map(e => <CheckboxEvent key={e.id} text={e.text} done={doneIds.has(e.id)} isFixed={e.type === "fixed"} color={e.color} isNew={e.isNew} onToggle={() => toggleDone(e.id)} compact />)}
                            {evs.length > 2 && <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--muted)", paddingLeft: "4px" }}>+{evs.length - 2}</div>}
                        </div>
                    );
                })}
                {nextDays.map(d => (
                    <div key={`n${d}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "6px", background: "#faf9fd" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted2)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>{d}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── WEEK VIEW ──────────────────────────────────────────────
interface WeekEv { col: number; slot: number; h: number; text: string; type: string; cls: string; isNew?: boolean; id: string; }

const weekEventsData: WeekEv[] = [
    { id: "w1", col: 1, slot: 0, h: 1, text: "Morning Run", type: "ai", cls: "we-teal" },
    { id: "w2", col: 1, slot: 2, h: 1, text: "Competitor Analysis", type: "ai", cls: "we-pink" },
    { id: "w3", col: 2, slot: 0, h: 1, text: "Morning Run", type: "ai", cls: "we-teal" },
    { id: "w4", col: 2, slot: 1, h: 2, text: "Stockholm Trip", type: "ai", cls: "we-purple" },
    { id: "w5", col: 3, slot: 1, h: 2, text: "Stockholm Trip", type: "ai", cls: "we-purple" },
    { id: "w6", col: 3, slot: 2, h: 1, text: "Team Meeting", type: "fixed", cls: "we-blue" },
    { id: "w7", col: 4, slot: 0, h: 1, text: "Morning Run", type: "ai", cls: "we-teal" },
    { id: "w8", col: 4, slot: 1, h: 2, text: "Stockholm Trip", type: "ai", cls: "we-purple" },
    { id: "w9", col: 5, slot: 6, h: 1, text: "Review Edits", type: "ai", cls: "we-amber" },
    { id: "w10", col: 6, slot: 0, h: 1, text: "Morning Run", type: "ai", cls: "we-teal" },
];

function WeekView() {
    const { events } = useApp();
    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
    const weekDays = [
        { dow: "Sun", num: 13 }, { dow: "Mon", num: 14 }, { dow: "Tue", num: 15, today: true },
        { dow: "Wed", num: 16 }, { dow: "Thu", num: 17 }, { dow: "Fri", num: 18 }, { dow: "Sat", num: 19 },
    ];
    const extraWeekEvs: WeekEv[] = events.filter(e => e.day >= 13 && e.day <= 19).map(e => ({ id: e.id, col: e.day - 13, slot: 0, h: 1, text: e.text, type: e.type, cls: e.color.replace("chip-", "we-"), isNew: e.isNew }));
    const allWeekEvs = [...weekEventsData, ...extraWeekEvs];
    const toggleDone = (id: string) => setDoneIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: "10px", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.5px" }}>July 2025 · Week 3</div>
                <div style={{ display: "flex", gap: "4px" }}>
                    {["‹", "›"].map(a => <button key={a} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>{a}</button>)}
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7,1fr)", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ padding: "10px 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>Time</span>
                </div>
                {weekDays.map(d => (
                    <div key={d.num} style={{ padding: "10px 6px", textAlign: "center", borderLeft: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.dow}</div>
                        {d.today ? (
                            <div style={{ width: "32px", height: "32px", background: "var(--purple)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 900, margin: "2px auto 0", boxShadow: "0 2px 6px rgba(124,111,205,0.4)" }}>{d.num}</div>
                        ) : (
                            <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--text)", marginTop: "1px", lineHeight: 1 }}>{d.num}</div>
                        )}
                    </div>
                ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex" }}>
                <div style={{ width: "56px", background: "#fff", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
                    {TIMES.map(t => <div key={t} style={{ height: "56px", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "5px 8px 0", borderBottom: "1px solid var(--border)" }}><span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>{t}</span></div>)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                    {Array.from({ length: 7 }, (_, c) => {
                        const isToday = c === 2;
                        const colEvs = allWeekEvs.filter(e => e.col === c);
                        return (
                            <div key={c} style={{ borderLeft: "1px solid var(--border)", position: "relative", background: isToday ? "linear-gradient(180deg,#faf8ff 0%,#fff 100%)" : undefined }}>
                                {TIMES.map((_, s) => <div key={s} style={{ height: "56px", borderBottom: "1px solid var(--border)" }} />)}
                                {colEvs.map(ev => (
                                    <div key={ev.id} style={{ position: "absolute", left: "3px", right: "3px", top: `${ev.slot * 56 + 4}px`, height: `${ev.h * 56 - 8}px`, zIndex: 2, animation: ev.isNew ? "fadeSlideIn .4s ease" : undefined }}>
                                        <CheckboxEvent text={ev.text} done={doneIds.has(ev.id)} isFixed={ev.type === "fixed"} color={ev.cls} isNew={ev.isNew} onToggle={() => toggleDone(ev.id)} />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── DAY VIEW ──────────────────────────────────────────────
interface DayTask { id: string; text: string; time: string; type: "fixed" | "ai"; cls: string; done: boolean; slot: number; }

function DayView() {
    const { events } = useApp();
    const [tasks, setTasks] = useState<DayTask[]>([
        { id: "run", text: "Morning Run 30min", time: "7:00 - 7:30", type: "ai", cls: "we-teal", done: false, slot: 0 },
        { id: "travel", text: "Stockholm Trip", time: "All day · Day 1/3", type: "ai", cls: "we-purple", done: false, slot: 1 },
        { id: "meeting", text: "Team Meeting", time: "9:00 - 10:00", type: "fixed", cls: "we-blue", done: false, slot: 2 },
        { id: "analysis", text: "Competitor Analysis · Research", time: "10:00 - 12:00", type: "ai", cls: "we-pink", done: false, slot: 3 },
        { id: "data", text: "Data Analysis Phase", time: "13:00 - 15:00", type: "ai", cls: "we-amber", done: false, slot: 6 },
    ]);

    const newDayTasks: DayTask[] = events.filter(e => e.day === 15).map((e, i) => ({ id: e.id, text: e.text, time: "07:00 - 07:30", type: e.type, cls: e.color.replace("chip-", "we-"), done: false, slot: 11 + i }));
    const allTasks = [...tasks, ...newDayTasks];
    const aiTasks = allTasks.filter(t => t.type === "ai");
    const aiDone = aiTasks.filter(t => t.done).length;
    const aiPct = aiTasks.length > 0 ? Math.round((aiDone / aiTasks.length) * 100) : 0;
    const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "#fff", display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    {["‹", "›"].map(a => <button key={a} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>{a}</button>)}
                </div>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.4px" }}>Tuesday, July 15, 2025</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginTop: "1px" }}>Today · {aiTasks.length} AI tasks</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)" }}>AI Task Progress</div>
                    <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="19" fill="none" stroke="var(--bg)" strokeWidth="5" />
                        <circle cx="24" cy="24" r="19" fill="none" stroke="var(--purple)" strokeWidth="5" strokeDasharray={`${(aiPct / 100) * 119.4} 119.4`} strokeLinecap="round" transform="rotate(-90 24 24)" style={{ transition: "stroke-dasharray .6s ease" }} />
                        <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--purple-deep)" fontFamily="Nunito,sans-serif">{aiPct}%</text>
                    </svg>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex" }}>
                <div style={{ width: "64px", background: "#fff", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
                    {TIMES.map(t => <div key={t} style={{ height: "72px", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "6px 10px 0", borderBottom: "1px solid var(--border)" }}><span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>{t}</span></div>)}
                </div>
                <div style={{ flex: 1, background: "#fff" }}>
                    {TIMES.map((_, s) => {
                        const ev = allTasks.find(t => t.slot === s);
                        return (
                            <div key={s} style={{ height: "72px", borderBottom: "1px solid var(--border)", padding: "6px 10px" }}>
                                {ev && (
                                    <div style={{ height: "60px", display: "flex", alignItems: "stretch" }}>
                                        <CheckboxEvent text={`${ev.text}  ·  ${ev.time}`} done={ev.done} isFixed={ev.type === "fixed"} color={ev.cls} isNew={ev.id.startsWith("new")} onToggle={() => toggleTask(ev.id)} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function CalendarView() {
    const { calView } = useApp();
    return (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
            {calView === "month" && <MonthView />}
            {calView === "week" && <WeekView />}
            {calView === "day" && <DayView />}
        </div>
    );
}
