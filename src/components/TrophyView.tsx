"use client";

const trophies = [
    { icon: "🦄", name: "Travel Disciplinarian", desc: "Kept up daily workouts throughout a trip", unlocked: true, badge: "New this week", isNew: true },
    { icon: "🌅", name: "Early Riser", desc: "Completed first task in the morning 7 days in a row", unlocked: true, badge: "Unlocked" },
    { icon: "📊", name: "Analysis Pro", desc: "Completed your first competitor analysis report", unlocked: true, badge: "Unlocked" },
    { icon: "🏃", name: "Fitness Pioneer", desc: "Accumulated 50 hours of workout tasks", unlocked: true, badge: "Unlocked" },
    { icon: "💎", name: "100-Hour Focus", desc: "Accumulated 100 hours of focused study", unlocked: false, badge: "58h to go" },
    { icon: "🌙", name: "Monthly Legend", desc: "Reach a 30-day streak this month", unlocked: false, badge: "23 days to go" },
    { icon: "🎯", name: "Perfect Week", desc: "Complete every AI-planned task in a full week", unlocked: false, badge: "Locked" },
    { icon: "🚀", name: "Super Executor", desc: "Complete 5+ planned tasks in a single day", unlocked: false, badge: "Locked" },
    { icon: "🌈", name: "All-Rounder", desc: "Manage work, fitness, and learning goals simultaneously", unlocked: false, badge: "Locked" },
];

export default function TrophyView() {
    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Hero banner */}
            <div style={{ borderRadius: "22px", padding: "28px 32px", color: "#fff", display: "flex", alignItems: "center", gap: "28px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#6b5fcf 0%,#a08be0 40%,#d97fba 80%,#e784b0 100%)", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "220px", height: "220px", background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-30px", left: "30%", width: "120px", height: "120px", background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
                <div style={{ fontSize: "72px", position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))", flexShrink: 0 }}>🦄</div>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, opacity: 0.8, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Latest Achievement</div>
                    <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "6px", letterSpacing: "-0.5px" }}>Travel Disciplinarian 🏆</h2>
                    <p style={{ fontSize: "13px", opacity: 0.9, fontWeight: 600, lineHeight: 1.5 }}>You kept up your morning runs throughout your trip — incredible self-discipline!</p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                        {[
                            { num: "4", lbl: "Achievements" },
                            { num: "7 days", lbl: "Current Streak" },
                            { num: "142h", lbl: "Focus Time" },
                        ].map(s => (
                            <div key={s.lbl} style={{ background: "rgba(255,255,255,0.18)", borderRadius: "12px", padding: "10px 16px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
                                <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px" }}>{s.num}</div>
                                <div style={{ fontSize: "10px", opacity: 0.85, fontWeight: 700, marginTop: "2px", whiteSpace: "nowrap" }}>{s.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trophy grid */}
            <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)" }}>🏆 All Achievements</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
                {trophies.map(t => (
                    <div key={t.name} style={{ background: t.unlocked ? "linear-gradient(135deg,#fffdf0,#fff9e0)" : "#fff", borderRadius: "18px", padding: "20px 16px", textAlign: "center", border: t.isNew ? "2px solid #e8c866" : t.unlocked ? "1.5px solid #e8c866" : "1.5px solid var(--border)", cursor: "pointer", boxShadow: t.isNew ? "0 4px 20px rgba(232,200,102,0.35)" : "var(--shadow)", opacity: t.unlocked ? 1 : 0.38, filter: t.unlocked ? "none" : "grayscale(0.8)", transition: "all .2s", position: "relative" }}>
                        {t.isNew && (
                            <div style={{ position: "absolute", top: "-8px", right: "12px", background: "linear-gradient(135deg,#f0a653,#e8c866)", color: "#fff", fontSize: "9px", fontWeight: 900, padding: "2px 8px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(240,166,83,0.4)" }}>NEW</div>
                        )}
                        <span style={{ fontSize: "38px", display: "block", marginBottom: "10px", lineHeight: 1 }}>{t.icon}</span>
                        <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "4px" }}>{t.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, lineHeight: 1.45, marginBottom: "10px" }}>{t.desc}</div>
                        <div style={{ display: "inline-block", background: t.unlocked ? "#fef3e2" : "var(--bg)", color: t.unlocked ? "#7a4508" : "var(--muted)", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "8px", border: t.unlocked ? "1px solid #f0a653" : "1px solid var(--border)" }}>
                            {t.badge}
                        </div>
                    </div>
                ))}
            </div>

            {/* Next unlock hint */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "28px" }}>💎</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "3px" }}>Next Achievement: 100-Hour Focus</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>58 more hours of focused study to go — keep it up!</div>
                    <div style={{ marginTop: "8px", height: "6px", background: "var(--bg)", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                        <div style={{ height: "100%", borderRadius: "10px", background: "linear-gradient(90deg,var(--purple-mid),var(--purple))", width: "42%" }} />
                    </div>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--purple)" }}>42%</div>
            </div>
        </div>
    );
}
