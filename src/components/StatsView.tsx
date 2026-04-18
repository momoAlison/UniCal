"use client";

const barData = [
    { val: "1.5h", h: 30, color: "#d9d2f5", lbl: "日" },
    { val: "3.0h", h: 60, color: "#7c6fcd", lbl: "一" },
    { val: "2.5h", h: 50, color: "#9d93d8", lbl: "二" },
    { val: "2.0h", h: 40, color: "#7c6fcd", lbl: "三" },
    { val: "3.5h", h: 70, color: "#5347a8", lbl: "四" },
    { val: "1.0h", h: 20, color: "#d9d2f5", lbl: "五" },
    { val: "1.0h", h: 20, color: "#d9d2f5", lbl: "六" },
];

const catRows = [
    { name: "竞品分析报告", pct: 60, color: "#e784b0", val: "6 / 10h" },
    { name: "每日晨跑计划", pct: 71, color: "#4bbfa8", val: "15 / 21天" },
    { name: "斯德哥尔摩行程", pct: 100, color: "#7c6fcd", val: "3 / 3天 ✓" },
    { name: "月度复盘总结", pct: 25, color: "#f0a653", val: "1 / 4h" },
    { name: "Python 学习计划", pct: 42, color: "#5ba4e5", val: "4.2 / 10h" },
];

const donutLegend = [
    { color: "#7c6fcd", name: "工作", pct: "40%" },
    { color: "#4bbfa8", name: "运动", pct: "24%" },
    { color: "#e784b0", name: "旅行", pct: "16%" },
    { color: "#f0a653", name: "学习", pct: "11%" },
    { color: "#d9d2f5", name: "其他", pct: "9%" },
];

const kpis = [
    { lbl: "本周专注时长", val: "14.5h", chg: "↑ 18% 较上周", up: true },
    { lbl: "完成任务数", val: "23", chg: "↑ 4 较上周", up: true },
    { lbl: "任务完成率", val: "86%", chg: "↑ 12pp", up: true },
    { lbl: "当前连胜", val: "7天", chg: "最长 14 天", neutral: true },
];

// Generate heatmap data deterministically
function getHeatmapColor(w: number, d: number): string {
    const colors = ["#f0eef8", "#d9d2f5", "#b09fe8", "#7c6fcd", "#5347a8"];
    const seed = (w * 7 + d) % 17;
    const idx = seed < 4 ? 0 : seed < 8 ? 1 : seed < 11 ? 2 : seed < 14 ? 3 : 4;
    return colors[idx];
}

export default function StatsView() {
    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)" }}>
            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
                {kpis.map(k => (
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
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>每日专注时长（本周）</div>
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
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>任务类型分布</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#f0eef8" strokeWidth="16" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#7c6fcd" strokeWidth="16" strokeDasharray="95.5 143.3" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#4bbfa8" strokeWidth="16" strokeDasharray="57.3 181.4" strokeDashoffset="-95.5" transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#e784b0" strokeWidth="16" strokeDasharray="38.2 200.5" strokeDashoffset="-152.8" transform="rotate(-90 50 50)" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#f0a653" strokeWidth="16" strokeDasharray="26.4 212.3" strokeDashoffset="-191" transform="rotate(-90 50 50)" />
                            <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="800" fill="#2d2456" fontFamily="Nunito,sans-serif">23</text>
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
                <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>目标完成进度</div>
                {catRows.map(r => (
                    <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "11px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", minWidth: "110px" }}>{r.name}</div>
                        <div style={{ flex: 1, height: "10px", background: "var(--bg)", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)" }}>
                            <div style={{ height: "100%", borderRadius: "20px", background: r.color, width: `${r.pct}%`, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--muted)", minWidth: "44px", textAlign: "right" }}>{r.val}</div>
                    </div>
                ))}
            </div>

            {/* Heatmap */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", marginBottom: "22px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>活跃度热力图（近 12 周）</div>
                <div style={{ display: "flex", gap: "3px", marginBottom: "6px", paddingLeft: "20px" }}>
                    {["五月", "六月", "七月"].map(m => (
                        <span key={m} style={{ flex: 1, fontSize: "10px", fontWeight: 700, color: "var(--muted)" }}>{m}</span>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", justifyContent: "space-around", paddingTop: "2px" }}>
                        {["一", "三", "五", "日"].map(d => (
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
                <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "18px", letterSpacing: "-0.2px" }}>近 8 周专注趋势</div>
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
                    <span>周均 8.2h</span><span>周均 10.5h</span><span>周均 12.8h</span>
                    <span style={{ color: "var(--purple-deep)", fontWeight: 900 }}>本周 14.5h ↑</span>
                </div>
            </div>
        </div>
    );
}
