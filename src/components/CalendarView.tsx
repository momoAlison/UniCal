"use client";

import { useState } from "react";
import { useApp, CalEvent } from "@/lib/store";

// ── HELPERS ──────────────────────────────────────────────────────────────────

/** Return the day-of-month for a UTC ISO string in the given year/month */
function isoToDayOfMonth(iso: string, year: number, month: number): number | null {
    const d = new Date(iso);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
        return d.getUTCDate();
    }
    return null;
}

/** Format a UTC ISO string to local time string for display */
function formatTime(iso: string, tz: string = "UTC"): string {
    try {
        return new Date(iso).toLocaleTimeString("en-US", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "";
    }
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// ── SEED DATA (uses isoDate for real-date matching) ───────────────────────────
// Seed events are placed relative to "today" so they always appear in the current month.
function buildSeedEvents(): CalEvent[] {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();

    const d = (day: number) => {
        const dt = new Date(Date.UTC(y, m, day, 9, 0, 0));
        return dt.toISOString();
    };

    return [
        { id: "f1", isoDate: d(3), day: 3, text: "Project Review", color: "chip-blue", type: "fixed" },
        { id: "f2", isoDate: d(9), day: 9, text: "Team Meeting", color: "chip-blue", type: "fixed" },
        { id: "f3", isoDate: d(16), day: 16, text: "Standup", color: "chip-blue", type: "fixed" },
        { id: "a1", isoDate: d(7), day: 7, text: "Morning Run", color: "chip-teal", type: "ai" },
        { id: "a2", isoDate: d(8), day: 8, text: "Stockholm Trip", color: "chip-purple", type: "ai" },
        { id: "a3", isoDate: d(8), day: 8, text: "Run 30min", color: "chip-teal", type: "ai" },
        { id: "a4", isoDate: d(9), day: 9, text: "Stockholm Trip", color: "chip-purple", type: "ai" },
        { id: "a5", isoDate: d(10), day: 10, text: "Stockholm Trip", color: "chip-purple", type: "ai" },
        { id: "a6", isoDate: d(10), day: 10, text: "Afternoon Workout", color: "chip-teal", type: "ai" },
        { id: "a7", isoDate: d(14), day: 14, text: "Competitor Analysis", color: "chip-pink", type: "ai" },
        { id: "a8", isoDate: d(15), day: 15, text: "Competitor Analysis", color: "chip-pink", type: "ai" },
        { id: "a9", isoDate: d(15), day: 15, text: "Data Analysis", color: "chip-amber", type: "ai" },
        { id: "a10", isoDate: d(16), day: 16, text: "Competitor Analysis", color: "chip-pink", type: "ai" },
        { id: "a11", isoDate: d(21), day: 21, text: "Morning Run", color: "chip-teal", type: "ai" },
        { id: "a12", isoDate: d(28), day: 28, text: "Monthly Review", color: "chip-amber", type: "ai" },
    ];
}

const SEED_EVENTS = buildSeedEvents();

// ── STYLES ────────────────────────────────────────────────────────────────────

const chipStyle: Record<string, React.CSSProperties> = {
    "chip-purple": { background: "#ede9fb", color: "#5347a8" },
    "chip-teal": { background: "#e0f7f3", color: "#0a5e49" },
    "chip-pink": { background: "#fce9f3", color: "#993356" },
    "chip-amber": { background: "#fef3e2", color: "#7a4508" },
    "chip-blue": { background: "#e6f1fb", color: "#175fa5" },
    "we-purple": { background: "#ede9fb", color: "#5347a8" },
    "we-teal": { background: "#e0f7f3", color: "#0a5e49" },
    "we-pink": { background: "#fce9f3", color: "#993356" },
    "we-amber": { background: "#fef3e2", color: "#7a4508" },
    "we-blue": { background: "#e6f1fb", color: "#175fa5" },
};

const TIMES = ["7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

// ── SHARED EVENT COMPONENT ────────────────────────────────────────────────────

interface CheckboxEventProps {
    text: string;
    done: boolean;
    isFixed: boolean;
    isNew?: boolean;
    color: string;
    onToggle?: () => void;
    compact?: boolean;
}

function CheckboxEvent({ text, done, isFixed, isNew, color, onToggle, compact, isPreview }: CheckboxEventProps & { isPreview?: boolean }) {
    const base = chipStyle[color] || {};
    // preview → dashed; new (just added, confirmed) → solid with animation; normal → solid
    const borderStyle = isPreview ? "1.5px dashed currentColor" : "1.5px solid currentColor";
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
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", flexShrink: 0, border: `1.5px solid ${done ? "transparent" : "#666"}`, background: done ? "#5347a8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 900, color: "#fff", transition: "all .2s" }}>
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
                <div style={{ width: "15px", height: "15px", borderRadius: "4px", flexShrink: 0, border: done ? "none" : "1.5px solid #666", background: done ? "#5347a8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900, color: "#fff", transition: "all .2s" }}>
                    {done ? "✓" : ""}
                </div>
            )}
            <span style={{ textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
        </div>
    );
}

// ── MONTH VIEW ────────────────────────────────────────────────────────────────

function MonthView() {
    const { events, viewYear, viewMonth, setViewMonth } = useApp();
    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

    const allEvents = [...SEED_EVENTS, ...events];

    const toggleDone = (id: string) => setDoneIds(prev => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
    });

    const navigate = (delta: number) => {
        let m = viewMonth + delta;
        let y = viewYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setViewMonth(y, m);
    };

    // Calendar grid
    const firstDow = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const daysInPrevMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
    const prevDays: number[] = [];
    for (let i = 0; i < firstDow; i++) prevDays.push(daysInPrevMonth - firstDow + 1 + i);
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
    const nextDays = Array.from({ length: totalCells - firstDow - daysInMonth }, (_, i) => i + 1);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
    const todayDay = isCurrentMonth ? today.getDate() : -1;

    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: "10px", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.5px" }}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => navigate(-1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>‹</button>
                    <button onClick={() => navigate(1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>›</button>
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
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridAutoRows: "1fr", overflow: "hidden" }}>
                {prevDays.map(d => (
                    <div key={`p${d}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "6px", background: "#faf9fd" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted2)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>{d}</div>
                    </div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const isToday = d === todayDay;
                    const evs = allEvents.filter(e => isoToDayOfMonth(e.isoDate, viewYear, viewMonth) === d);
                    return (
                        <div key={d} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "6px", background: "#fff", display: "flex", flexDirection: "column", gap: "3px", minHeight: 0, overflow: "hidden" }}>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: isToday ? "#fff" : "var(--text)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "var(--purple)" : "transparent", boxShadow: isToday ? "0 2px 6px rgba(124,111,205,0.4)" : "none", flexShrink: 0 }}>{d}</div>
                            {evs.slice(0, 2).map(e => <CheckboxEvent key={e.id} text={e.text} done={doneIds.has(e.id)} isFixed={e.type === "fixed"} color={e.color} isNew={e.isNew} isPreview={e.status === "preview"} onToggle={() => toggleDone(e.id)} compact />)}
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

// ── WEEK VIEW ─────────────────────────────────────────────────────────────────

interface WeekEv { col: number; slot: number; h: number; text: string; type: string; cls: string; isNew?: boolean; id: string; }

function WeekView() {
    const { events, viewYear, viewMonth, setViewMonth } = useApp();
    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

    // Current week start (Sunday) based on today
    const today = new Date();
    const [weekOffset, setWeekOffset] = useState(0);

    const weekStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - today.getUTCDay() + weekOffset * 7));

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setUTCDate(weekStart.getUTCDate() + i);
        return {
            dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
            num: d.getUTCDate(),
            month: d.getUTCMonth(),
            year: d.getUTCFullYear(),
            isToday: d.getUTCFullYear() === today.getUTCFullYear() && d.getUTCMonth() === today.getUTCMonth() && d.getUTCDate() === today.getUTCDate(),
            isoDate: d.toISOString(),
        };
    });

    const weekLabel = `${MONTH_NAMES[weekDays[0].month]} ${weekDays[0].year}`;

    const navigate = (delta: number) => {
        setWeekOffset(prev => prev + delta);
        // Update viewMonth to match the week's dominant month
        const mid = weekDays[3];
        setViewMonth(mid.year, mid.month);
    };

    // Map all events (seed + AI) to week columns
    const allEvents = [...SEED_EVENTS, ...events];
    const weekEvs: WeekEv[] = [];
    weekDays.forEach((wd, col) => {
        const dayEvs = allEvents.filter(e => {
            const d = new Date(e.isoDate);
            return d.getUTCFullYear() === wd.year && d.getUTCMonth() === wd.month && d.getUTCDate() === wd.num;
        });
        dayEvs.forEach((e) => {
            const hour = new Date(e.isoDate).getUTCHours();
            const slot = Math.max(0, Math.min(TIMES.length - 1, hour - 7));
            weekEvs.push({ id: e.id, col, slot, h: 1, text: e.text, type: e.type, cls: e.color.replace("chip-", "we-"), isNew: e.isNew, isPreview: e.status === "preview" } as WeekEv & { isPreview?: boolean });
        });
    });

    const toggleDone = (id: string) => setDoneIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", gap: "10px", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.5px" }}>{weekLabel}</div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => navigate(-1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>‹</button>
                    <button onClick={() => navigate(1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>›</button>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7,1fr)", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ padding: "10px 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>Time</span>
                </div>
                {weekDays.map(d => (
                    <div key={d.num + "-" + d.month} style={{ padding: "10px 6px", textAlign: "center", borderLeft: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{d.dow}</div>
                        {d.isToday ? (
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
                        const colEvs = weekEvs.filter(e => e.col === c);
                        const isToday = weekDays[c].isToday;
                        return (
                            <div key={c} style={{ borderLeft: "1px solid var(--border)", position: "relative", background: isToday ? "linear-gradient(180deg,#faf8ff 0%,#fff 100%)" : undefined }}>
                                {TIMES.map((_, s) => <div key={s} style={{ height: "56px", borderBottom: "1px solid var(--border)" }} />)}
                                {colEvs.map(ev => {
                                    const evAny = ev as WeekEv & { isPreview?: boolean };
                                    return (
                                        <div key={ev.id} style={{ position: "absolute", left: "3px", right: "3px", top: `${ev.slot * 56 + 4}px`, height: `${ev.h * 56 - 8}px`, zIndex: 2, animation: ev.isNew ? "fadeSlideIn .4s ease" : undefined }}>
                                            <CheckboxEvent text={ev.text} done={doneIds.has(ev.id)} isFixed={ev.type === "fixed"} color={ev.cls} isNew={ev.isNew} isPreview={evAny.isPreview} onToggle={() => toggleDone(ev.id)} />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── DAY VIEW ──────────────────────────────────────────────────────────────────

interface DayTask { id: string; text: string; time: string; type: "fixed" | "ai"; cls: string; done: boolean; slot: number; }

function DayView() {
    const { events } = useApp();
    const [dayOffset, setDayOffset] = useState(0);
    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

    const today = new Date();
    const viewDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + dayOffset));
    const isToday = dayOffset === 0;

    const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayLabel = `${DOW_NAMES[viewDate.getUTCDay()]}, ${MONTH_NAMES[viewDate.getUTCMonth()]} ${viewDate.getUTCDate()}, ${viewDate.getUTCFullYear()}`;

    const allEvents = [...SEED_EVENTS, ...events];
    const dayEvs = allEvents.filter(e => {
        const d = new Date(e.isoDate);
        return d.getUTCFullYear() === viewDate.getUTCFullYear() && d.getUTCMonth() === viewDate.getUTCMonth() && d.getUTCDate() === viewDate.getUTCDate();
    });

    const tasks: (DayTask & { isPreview?: boolean })[] = dayEvs.map(e => {
        const hour = new Date(e.isoDate).getUTCHours();
        const slot = Math.max(0, Math.min(TIMES.length - 1, hour - 7));
        const timeStr = formatTime(e.isoDate) + (e.isoEnd ? " - " + formatTime(e.isoEnd) : "");
        return { id: e.id, text: e.text, time: timeStr, type: e.type, cls: e.color.replace("chip-", "we-"), done: doneIds.has(e.id), slot, isPreview: e.status === "preview" };
    });

    const aiTasks = tasks.filter(t => t.type === "ai");
    const aiDone = aiTasks.filter(t => doneIds.has(t.id)).length;
    const aiPct = aiTasks.length > 0 ? Math.round((aiDone / aiTasks.length) * 100) : 0;

    const toggleDone = (id: string) => setDoneIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "#fff", display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => setDayOffset(p => p - 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>‹</button>
                    <button onClick={() => setDayOffset(p => p + 1)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>›</button>
                </div>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.4px" }}>{dayLabel}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginTop: "1px" }}>{isToday ? "Today" : ""} · {aiTasks.length} AI tasks</div>
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
                        const ev = tasks.find(t => t.slot === s);
                        return (
                            <div key={s} style={{ height: "72px", borderBottom: "1px solid var(--border)", padding: "6px 10px" }}>
                                {ev && (
                                    <div style={{ height: "60px", display: "flex", alignItems: "stretch" }}>
                                        <CheckboxEvent text={`${ev.text}  ·  ${ev.time}`} done={doneIds.has(ev.id)} isFixed={ev.type === "fixed"} color={ev.cls} isNew={ev.id.startsWith("new")} isPreview={ev.isPreview} onToggle={() => toggleDone(ev.id)} />
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

// ── ROOT ──────────────────────────────────────────────────────────────────────

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
