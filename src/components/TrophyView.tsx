"use client";

const trophies = [
    { icon: "🦄", name: "旅行自律者", desc: "旅行期间每日坚持运动打卡", unlocked: true, badge: "本周新获" },
    { icon: "🌅", name: "早起挑战者", desc: "连续 7 天早晨完成首个任务", unlocked: true, badge: "已解锁" },
    { icon: "📊", name: "分析达人", desc: "成功完成首份竞品分析报告", unlocked: true, badge: "已解锁" },
    { icon: "🏃", name: "运动先锋", desc: "累计完成运动任务 50 小时", unlocked: true, badge: "已解锁" },
    { icon: "💎", name: "百小时专注", desc: "累计专注学习满 100 小时", unlocked: false, badge: "还差 58h" },
    { icon: "🌙", name: "月度传说", desc: "本月连胜天数达到 30 天", unlocked: false, badge: "还差 23天" },
    { icon: "🎯", name: "零失误周", desc: "整周所有 AI 规划任务全部完成", unlocked: false, badge: "未解锁" },
    { icon: "🚀", name: "超级执行者", desc: "单日完成 5 个以上规划任务", unlocked: false, badge: "未解锁" },
    { icon: "🌈", name: "全能达人", desc: "同时管理工作、运动、学习三类目标", unlocked: false, badge: "未解锁" },
];

const streakWeeks = [
    { label: "第1周", days: [{ n: 1, s: "done" }, { n: 2, s: "done" }, { n: 3, s: "done" }, { n: 4, s: "done" }, { n: 5, s: "done" }, { n: 6, s: "done" }, { n: 7, s: "done" }] },
    { label: "第2周", days: [{ n: 8, s: "done" }, { n: 9, s: "done" }, { n: 10, s: "done" }, { n: 11, s: "done" }, { n: 12, s: "miss" }, { n: 13, s: "done" }, { n: 14, s: "done" }] },
    { label: "第3周", days: [{ n: 15, s: "today" }, { n: 16, s: "empty" }, { n: 17, s: "empty" }, { n: 18, s: "empty" }, { n: 19, s: "empty" }, { n: 20, s: "empty" }, { n: 21, s: "empty" }] },
    { label: "第4周", days: [{ n: 22, s: "empty" }, { n: 23, s: "empty" }, { n: 24, s: "empty" }, { n: 25, s: "empty" }, { n: 26, s: "empty" }, { n: 27, s: "empty" }, { n: 28, s: "empty" }] },
];

function sdStyle(s: string): React.CSSProperties {
    if (s === "done") return { background: "var(--purple)", color: "#fff", boxShadow: "0 2px 5px rgba(124,111,205,0.4)" };
    if (s === "today") return { background: "linear-gradient(135deg,var(--pink),#f056a0)", color: "#fff", boxShadow: "0 2px 5px rgba(232,132,176,0.45)" };
    if (s === "miss") return { background: "#fceaea", color: "#e85d5d", border: "1.5px solid #f7c1c1" };
    return { background: "var(--bg)", color: "var(--muted2)", border: "1.5px solid var(--border)" };
}

export default function TrophyView() {
    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)" }}>
            {/* Hero */}
            <div style={{ borderRadius: "22px", padding: "28px 32px", color: "#fff", marginBottom: "22px", display: "flex", alignItems: "center", gap: "28px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#6b5fcf 0%,#a08be0 40%,#d97fba 80%,#e784b0 100%)" }}>
                <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-60px", right: "60px", width: "150px", height: "150px", background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
                <div className="hero-uni" style={{ fontSize: "70px", position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))" }}>🦄</div>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "6px", letterSpacing: "-0.5px" }}>旅行自律者</h2>
                    <p style={{ fontSize: "14px", opacity: 0.9, fontWeight: 600 }}>旅行期间坚持每日晨跑，获得本周最佳表现！</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "18px" }}>
                        {[{ num: "7", lbl: "连胜天数" }, { num: "4", lbl: "已解锁奖杯" }, { num: "142h", lbl: "专注总时长" }].map(s => (
                            <div key={s.lbl} style={{ background: "rgba(255,255,255,0.18)", borderRadius: "12px", padding: "12px 14px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                                <div style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px" }}>{s.num}</div>
                                <div style={{ fontSize: "11px", opacity: 0.85, fontWeight: 700, marginTop: "1px" }}>{s.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Streak Board */}
            <div style={{ background: "#fff", borderRadius: "18px", padding: "20px", border: "1.5px solid var(--border)", marginBottom: "22px", boxShadow: "var(--shadow)" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--text)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>🔥 本月连胜日历</div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                    {[{ bg: "var(--purple)", label: "已完成" }, { bg: "var(--pink)", label: "今天" }, { bg: "#fceaea", label: "已错过", border: "1.5px solid #f7c1c1" }].map(l => (
                        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, color: "var(--muted)" }}>
                            <div style={{ width: "10px", height: "10px", background: l.bg, borderRadius: "3px", border: l.border }} />
                            {l.label}
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {streakWeeks.map(week => (
                        <div key={week.label} style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", width: "24px", flexShrink: 0 }}>{week.label}</div>
                            {week.days.map(d => (
                                <div key={d.n} style={{ width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, cursor: "pointer", transition: "transform .15s", ...sdStyle(d.s) }}>
                                    {d.n}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Trophies */}
            <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--text)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>🏆 成就徽章</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "22px" }}>
                {trophies.map(t => (
                    <div key={t.name} style={{ background: t.unlocked ? "linear-gradient(135deg,#fffdf0,#fff9e0)" : "#fff", borderRadius: "18px", padding: "20px", textAlign: "center", border: t.unlocked ? "1.5px solid #e8c866" : "1.5px solid var(--border)", cursor: "pointer", boxShadow: "var(--shadow)", opacity: t.unlocked ? 1 : 0.4, filter: t.unlocked ? "none" : "grayscale(0.7)", transition: "all .2s" }}>
                        <span style={{ fontSize: "38px", display: "block", marginBottom: "10px", lineHeight: 1 }}>{t.icon}</span>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>{t.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, lineHeight: 1.4 }}>{t.desc}</div>
                        <div style={{ display: "inline-block", marginTop: "8px", background: t.unlocked ? "#fef3e2" : "var(--bg)", color: t.unlocked ? "#7a4508" : "var(--muted)", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "10px", border: t.unlocked ? "1px solid #f0a653" : "1px solid var(--border)" }}>
                            {t.badge}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
