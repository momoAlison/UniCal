"use client";

import { useState } from "react";

type CalView = "month" | "week" | "day";

// ── DATA ──────────────────────────────────────────────
const monthEvents: Record<number, { text: string; cls: string }[]> = {
    3: [{ text: "项目汇报", cls: "chip-teal" }],
    7: [{ text: "每日晨跑", cls: "chip-teal" }],
    8: [
        { text: "斯德哥尔摩", cls: "chip-purple" },
        { text: "晨跑 30min", cls: "chip-teal" },
    ],
    9: [
        { text: "斯德哥尔摩", cls: "chip-purple" },
        { text: "线上会议", cls: "chip-blue" },
    ],
    10: [
        { text: "斯德哥尔摩", cls: "chip-purple" },
        { text: "下午运动", cls: "chip-teal" },
    ],
    14: [{ text: "竞品分析", cls: "chip-pink" }],
    15: [
        { text: "竞品分析", cls: "chip-pink" },
        { text: "数据分析", cls: "chip-amber" },
    ],
    16: [
        { text: "团队站会", cls: "chip-blue" },
        { text: "竞品分析", cls: "chip-pink" },
    ],
    21: [{ text: "每日晨跑", cls: "chip-teal" }],
    28: [{ text: "月度复盘", cls: "chip-amber" }],
};

const chipStyle: Record<string, React.CSSProperties> = {
    "chip-purple": { background: "#ede9fb", color: "#5347a8" },
    "chip-teal": { background: "#e0f7f3", color: "#0a5e49" },
    "chip-pink": { background: "#fce9f3", color: "#993356" },
    "chip-amber": { background: "#fef3e2", color: "#7a4508" },
    "chip-blue": { background: "#e6f1fb", color: "#175fa5" },
};

const TIMES = [
    "7:00", "8:00", "9:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const weekEvents = [
    { col: 1, slot: 0, h: 1, text: "晨跑", cls: "we-teal" },
    { col: 1, slot: 2, h: 1, text: "竞品分析", cls: "we-pink" },
    { col: 1, slot: 6, h: 1, text: "资料收集", cls: "we-amber" },
    { col: 2, slot: 0, h: 1, text: "晨跑", cls: "we-teal" },
    { col: 2, slot: 1, h: 2, text: "斯德哥尔摩", cls: "we-purple" },
    { col: 2, slot: 3, h: 1, text: "竞品分析", cls: "we-pink" },
    { col: 2, slot: 6, h: 1, text: "数据分析", cls: "we-amber" },
    { col: 3, slot: 1, h: 2, text: "斯德哥尔摩", cls: "we-purple" },
    { col: 3, slot: 2, h: 1, text: "线上会议", cls: "we-blue" },
    { col: 3, slot: 6, h: 1, text: "草稿撰写", cls: "we-amber" },
    { col: 3, slot: 9, h: 1, text: "运动5pm", cls: "we-teal" },
    { col: 4, slot: 0, h: 1, text: "晨跑", cls: "we-teal" },
    { col: 4, slot: 1, h: 2, text: "斯德哥尔摩", cls: "we-purple" },
    { col: 4, slot: 3, h: 1, text: "竞品分析", cls: "we-pink" },
    { col: 5, slot: 6, h: 1, text: "复盘修改", cls: "we-amber" },
    { col: 6, slot: 0, h: 1, text: "晨跑", cls: "we-teal" },
    { col: 6, slot: 8, h: 1, text: "月度复盘", cls: "we-amber" },
];

const weStyle: Record<string, React.CSSProperties> = {
    "we-purple": { background: "#ede9fb", color: "#5347a8", borderLeftColor: "#7c6fcd" },
    "we-teal": { background: "#e0f7f3", color: "#0a5e49", borderLeftColor: "#4bbfa8" },
    "we-pink": { background: "#fce9f3", color: "#993356", borderLeftColor: "#e784b0" },
    "we-amber": { background: "#fef3e2", color: "#7a4508", borderLeftColor: "#f0a653" },
    "we-blue": { background: "#e6f1fb", color: "#175fa5", borderLeftColor: "#5ba4e5" },
};

const daySlots = [
    { slot: 0, text: "晨跑 30min", cls: "we-teal", icon: "🏃", time: "7:00 - 7:30", done: true, pct: 100 },
    { slot: 1, text: "斯德哥尔摩旅行", cls: "we-purple", icon: "✈️", time: "全天 · 第 1/3 天", done: false, pct: 33 },
    { slot: 3, text: "竞品分析 · 资料收集", cls: "we-pink", icon: "📊", time: "10:00 - 12:00 · 进行中", done: false, pct: 50 },
    { slot: 6, text: "数据分析阶段", cls: "we-amber", icon: "🔬", time: "13:00 - 15:00 · 待开始", done: false, pct: 0 },
];

// ── PROGRESS BARS ──────────────────────────────────────
function ProgressSection({ title, rows }: {
    title: string;
    rows: { color: string; name: string; pct: number; label: string }[];
}) {
    return (
        <div style={{ padding: "12px 20px", background: "#fff", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "9px" }}>
                {title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {rows.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)", minWidth: "100px", flexShrink: 0 }}>{r.name}</div>
                        <div style={{ flex: 1, height: "7px", background: "var(--bg)", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)" }}>
                            <div style={{ height: "100%", borderRadius: "20px", background: r.color, width: `${r.pct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted)", minWidth: "38px", textAlign: "right" }}>{r.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── MONTH VIEW ──────────────────────────────────────────
function MonthView({ onViewChange }: { onViewChange: (v: CalView) => void }) {
    const startDow = 2; // July 2025 starts Tuesday
    const daysInMonth = 31;
    const daysInPrevMonth = 30;

    const prevDays: number[] = [];
    for (let i = 0; i < startDow; i++) {
        prevDays.push(daysInPrevMonth - startDow + 1 + i);
    }
    const total = startDow + daysInMonth;
    const rem = 35 - total;
    const nextDays: number[] = Array.from({ length: rem }, (_, i) => i + 1);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: "12px", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.5px" }}>2025年7月</div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>‹</button>
                    <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>›</button>
                </div>
                <ViewSwitch current="month" onChange={onViewChange} />
            </div>
            <ProgressSection title="本月任务进度" rows={[
                { color: "#7c6fcd", name: "斯德哥尔摩旅行", pct: 100, label: "100%" },
                { color: "#e784b0", name: "竞品分析报告", pct: 60, label: "60%" },
                { color: "#4bbfa8", name: "每日晨跑 30min", pct: 71, label: "15/21" },
                { color: "#f0a653", name: "月度复盘", pct: 25, label: "25%" },
            ]} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                    {["日", "一", "二", "三", "四", "五", "六"].map(d => (
                        <div key={d} style={{ padding: "9px 12px", textAlign: "center", fontSize: "11px", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{d}</div>
                    ))}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridTemplateRows: "repeat(5,1fr)", overflow: "hidden" }}>
                    {prevDays.map(d => (
                        <div key={`p${d}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "8px", background: "#faf9fd", display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted2)", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>{d}</div>
                        </div>
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                        const isToday = d === 15;
                        const evs = monthEvents[d] || [];
                        return (
                            <div key={d} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "8px", cursor: "pointer", background: "#fff", display: "flex", flexDirection: "column", gap: "3px", minHeight: 0 }}>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: isToday ? "#fff" : "var(--text)", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "var(--purple)" : "transparent", boxShadow: isToday ? "0 2px 6px rgba(124,111,205,0.4)" : "none", flexShrink: 0 }}>{d}</div>
                                {evs.slice(0, 2).map((e, i) => (
                                    <div key={i} style={{ padding: "3px 7px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", ...chipStyle[e.cls] }}>{e.text}</div>
                                ))}
                                {evs.length > 2 && <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", padding: "2px 6px" }}>+{evs.length - 2} 更多</div>}
                            </div>
                        );
                    })}
                    {nextDays.map(d => (
                        <div key={`n${d}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "8px", background: "#faf9fd", display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted2)", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>{d}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── WEEK VIEW ──────────────────────────────────────────
function WeekView({ onViewChange }: { onViewChange: (v: CalView) => void }) {
    const weekDays = [
        { dow: "日", num: 13 }, { dow: "一", num: 14 }, { dow: "二", num: 15, today: true },
        { dow: "三", num: 16 }, { dow: "四", num: 17 }, { dow: "五", num: 18 }, { dow: "六", num: 19 },
    ];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: "12px", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.5px" }}>2025年7月 第三周</div>
                <div style={{ display: "flex", gap: "4px" }}>
                    <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>‹</button>
                    <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>›</button>
                </div>
                <ViewSwitch current="week" onChange={onViewChange} />
            </div>
            <ProgressSection title="本周任务进度" rows={[
                { color: "#7c6fcd", name: "斯德哥尔摩旅行", pct: 100, label: "完成 ✓" },
                { color: "#e784b0", name: "竞品分析报告", pct: 60, label: "6/10h" },
                { color: "#4bbfa8", name: "每日晨跑", pct: 71, label: "5/7天" },
                { color: "#f0a653", name: "月度复盘", pct: 25, label: "25%" },
            ]} />
            {/* Week header */}
            <div style={{ display: "grid", gridTemplateColumns: "56px repeat(7,1fr)", borderBottom: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}>
                <div style={{ padding: "10px 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>时间</span>
                </div>
                {weekDays.map((d) => (
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
            {/* Week body */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex" }}>
                <div style={{ width: "56px", background: "#fff", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
                    {TIMES.map(t => (
                        <div key={t} style={{ height: "56px", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "5px 8px 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>{t}</span>
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
                    {Array.from({ length: 7 }, (_, c) => {
                        const isToday = c === 2;
                        const colEvents = weekEvents.filter(e => e.col === c);
                        return (
                            <div key={c} style={{ borderLeft: "1px solid var(--border)", position: "relative", background: isToday ? "linear-gradient(180deg,#faf8ff 0%,#fff 100%)" : undefined }}>
                                {TIMES.map((_, s) => (
                                    <div key={s} style={{ height: "56px", borderBottom: "1px solid var(--border)" }} />
                                ))}
                                {colEvents.map((ev, i) => (
                                    <div key={i} style={{ position: "absolute", left: "3px", right: "3px", top: `${ev.slot * 56 + 4}px`, height: `${ev.h * 56 - 8}px`, borderRadius: "8px", padding: "4px 8px", fontSize: "10px", fontWeight: 800, cursor: "pointer", overflow: "hidden", zIndex: 2, borderLeft: "3px solid transparent", ...weStyle[ev.cls] }}>
                                        {ev.text}
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

// ── DAY VIEW ──────────────────────────────────────────
function DayView({ onViewChange }: { onViewChange: (v: CalView) => void }) {
    const [tasks, setTasks] = useState([
        { id: "run", name: "晨跑 30min", meta: "7:00 · 运动 · 已完成", done: true, pct: 100, color: "var(--teal)" },
        { id: "analysis", name: "竞品分析报告", meta: "10:00 - 12:00 · 工作", done: false, pct: 50, color: "var(--pink)" },
        { id: "data", name: "数据分析阶段", meta: "13:00 - 15:00 · 工作", done: false, pct: 0, color: "var(--amber)" },
    ]);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    return (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "#fff", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                        <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>‹</button>
                        <button style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "13px", fontWeight: 700 }}>›</button>
                    </div>
                    <div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.4px" }}>周二，2025年7月15日</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>今天 · 3 个事件 · 3 个任务</div>
                    </div>
                    <div style={{ marginLeft: "auto", background: "var(--purple)", color: "#fff", fontSize: "11px", fontWeight: 800, padding: "4px 12px", borderRadius: "12px" }}>今天</div>
                    <ViewSwitch current="day" onChange={onViewChange} />
                </div>
                <ProgressSection title="今日任务进度" rows={[
                    { color: "#4bbfa8", name: "晨跑 30min", pct: 100, label: "✓ 完成" },
                    { color: "#e784b0", name: "竞品分析 2h", pct: 50, label: "1/2h" },
                    { color: "#f0a653", name: "数据分析阶段", pct: 0, label: "待开始" },
                ]} />
                <div style={{ flex: 1, overflowY: "auto", display: "flex" }}>
                    <div style={{ width: "64px", background: "#fff", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
                        {TIMES.map(t => (
                            <div key={t} style={{ height: "72px", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "6px 10px 0", borderBottom: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>{t}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, background: "#fff", position: "relative" }}>
                        {TIMES.map((_, s) => {
                            const ev = daySlots.find(e => e.slot === s);
                            const barColor = ev?.cls === "we-teal" ? "#4bbfa8" : ev?.cls === "we-purple" ? "#7c6fcd" : ev?.cls === "we-pink" ? "#e784b0" : "#f0a653";
                            return (
                                <div key={s} style={{ height: "72px", borderBottom: "1px solid var(--border)", padding: "4px 6px", position: "relative" }}>
                                    {ev && (
                                        <div style={{ borderRadius: "12px", padding: "10px 14px", cursor: "pointer", borderLeft: "3px solid transparent", display: "flex", alignItems: "center", gap: "10px", height: "64px", ...weStyle[ev.cls] }}>
                                            <span style={{ fontSize: "18px", flexShrink: 0 }}>{ev.icon}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: "13px", fontWeight: 800 }}>{ev.text}</div>
                                                <div style={{ fontSize: "11px", fontWeight: 600, opacity: 0.75, marginTop: "1px" }}>{ev.time}</div>
                                            </div>
                                            {ev.pct > 0 ? (
                                                <div style={{ width: "60px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
                                                    <div style={{ fontSize: "11px", fontWeight: 800, color: barColor }}>{ev.pct}%</div>
                                                    <div style={{ width: "100%", height: "5px", background: "rgba(0,0,0,0.08)", borderRadius: "10px", overflow: "hidden" }}>
                                                        <div style={{ height: "100%", borderRadius: "10px", background: barColor, width: `${ev.pct}%` }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>待开始</div>
                                            )}
                                            {ev.done && <span style={{ fontSize: "14px" }}>✅</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Day sidebar */}
            <div style={{ width: "250px", borderLeft: "1px solid var(--border)", background: "#fff", overflowY: "auto", padding: "16px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ borderRadius: "14px", padding: "14px", background: "#ede9fb", border: "1px solid #d4c8f5" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--purple)", marginBottom: "7px" }}>今日完成率</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-1px" }}>67%</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--purple)", marginTop: "1px" }}>2/3 任务进行中</div>
                    <div style={{ marginTop: "10px", height: "7px", borderRadius: "20px", overflow: "hidden", background: "rgba(124,111,205,0.15)" }}>
                        <div style={{ height: "100%", borderRadius: "20px", background: "var(--purple)", width: "67%", transition: "width .8s ease" }} />
                    </div>
                </div>
                <div style={{ borderRadius: "14px", padding: "14px", background: "#e0f7f3", border: "1px solid #9fe1cb" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.6px", color: "#0a5e49", marginBottom: "7px" }}>今日专注时长</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#074033", letterSpacing: "-1px" }}>1.5h</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1d9e75", marginTop: "1px" }}>目标 4h · 37%</div>
                    <div style={{ marginTop: "10px", height: "7px", borderRadius: "20px", overflow: "hidden", background: "rgba(75,191,168,0.2)" }}>
                        <div style={{ height: "100%", borderRadius: "20px", background: "var(--teal)", width: "37%", transition: "width .8s ease" }} />
                    </div>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text)" }}>今日任务清单</div>
                {tasks.map(task => (
                    <div key={task.id} style={{ background: "var(--bg)", borderRadius: "12px", padding: "12px", border: "1.5px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <div
                                onClick={() => toggleTask(task.id)}
                                style={{ width: "19px", height: "19px", borderRadius: "6px", border: task.done ? "none" : "2px solid var(--border2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: task.done ? "var(--green)" : "transparent", color: task.done ? "#fff" : "transparent", fontSize: "11px", fontWeight: 800 }}
                            >
                                {task.done ? "✓" : ""}
                            </div>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: task.done ? "var(--muted)" : "var(--text)", textDecoration: task.done ? "line-through" : "none" }}>{task.name}</div>
                                <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>{task.meta}</div>
                            </div>
                        </div>
                        <div style={{ height: "5px", background: "var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: "10px", background: task.color, width: `${task.pct}%`, transition: "width .6s ease" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── VIEW SWITCH ──────────────────────────────────────────
function ViewSwitch({ current, onChange }: { current: CalView; onChange: (v: CalView) => void }) {
    return (
        <div style={{ display: "flex", gap: "2px", background: "var(--bg)", borderRadius: "10px", padding: "3px", marginLeft: "auto" }}>
            {(["月", "周", "日"] as const).map((label, i) => {
                const views: CalView[] = ["month", "week", "day"];
                const v = views[i];
                return (
                    <button key={v} onClick={() => onChange(v)} style={{ padding: "5px 16px", borderRadius: "8px", border: "none", background: current === v ? "#fff" : "transparent", fontSize: "12px", fontWeight: 800, color: current === v ? "var(--purple)" : "var(--muted)", cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: current === v ? "0 1px 6px rgba(124,111,205,0.18)" : "none", transition: "all .18s" }}>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

// ── MAIN EXPORT ──────────────────────────────────────────
export default function CalendarView() {
    const [calView, setCalView] = useState<CalView>("month");

    return (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
            {calView === "month" && <MonthView onViewChange={setCalView} />}
            {calView === "week" && <WeekView onViewChange={setCalView} />}
            {calView === "day" && <DayView onViewChange={setCalView} />}
        </div>
    );
}
