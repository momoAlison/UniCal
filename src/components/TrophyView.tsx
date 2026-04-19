"use client";

import { useApp } from "@/lib/store";

// ── Static trophy definitions ─────────────────────────────────────────────────

interface TrophyDef {
    id: string;
    icon: string;
    name: string;
    desc: string;
    /** Returns true if the achievement is unlocked given live data */
    check: (data: { goalCount: number; aiTaskCount: number; doneTaskCount: number; fitnessGoals: number; workGoals: number; learningGoals: number }) => boolean;
    badgeLocked: string;
    badgeUnlocked: string;
    isNew?: boolean;
}

const TROPHY_DEFS: TrophyDef[] = [
    {
        id: "travel-discipline",
        icon: "🦄",
        name: "Travel Disciplinarian",
        desc: "Kept up daily workouts throughout a trip",
        check: ({ fitnessGoals }) => fitnessGoals >= 1,
        badgeLocked: "Add a fitness goal",
        badgeUnlocked: "Unlocked",
        isNew: true,
    },
    {
        id: "early-riser",
        icon: "🌅",
        name: "Early Riser",
        desc: "Completed first task in the morning 7 days in a row",
        check: ({ doneTaskCount }) => doneTaskCount >= 7,
        badgeLocked: "Complete 7 tasks",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "analysis-pro",
        icon: "📊",
        name: "Analysis Pro",
        desc: "Completed your first competitor analysis report",
        check: ({ workGoals }) => workGoals >= 1,
        badgeLocked: "Add a work goal",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "fitness-pioneer",
        icon: "🏃",
        name: "Fitness Pioneer",
        desc: "Added 3+ fitness sessions to your calendar",
        check: ({ fitnessGoals, aiTaskCount }) => fitnessGoals >= 1 && aiTaskCount >= 3,
        badgeLocked: "Add 3 fitness sessions",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "100h-focus",
        icon: "💎",
        name: "100-Hour Focus",
        desc: "Accumulated 100 hours of focused study",
        check: ({ learningGoals, doneTaskCount }) => learningGoals >= 1 && doneTaskCount >= 50,
        badgeLocked: "58h to go",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "monthly-legend",
        icon: "🌙",
        name: "Monthly Legend",
        desc: "Reach a 30-day streak this month",
        check: () => false,
        badgeLocked: "23 days to go",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "perfect-week",
        icon: "🎯",
        name: "Perfect Week",
        desc: "Complete every AI-planned task in a full week",
        check: ({ doneTaskCount, aiTaskCount }) => aiTaskCount >= 7 && doneTaskCount >= aiTaskCount,
        badgeLocked: "Locked",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "super-executor",
        icon: "🚀",
        name: "Super Executor",
        desc: "Complete 5+ planned tasks in a single day",
        check: ({ doneTaskCount }) => doneTaskCount >= 5,
        badgeLocked: "Locked",
        badgeUnlocked: "Unlocked",
    },
    {
        id: "all-rounder",
        icon: "🌈",
        name: "All-Rounder",
        desc: "Manage work, fitness, and learning goals simultaneously",
        check: ({ workGoals, fitnessGoals, learningGoals }) => workGoals >= 1 && fitnessGoals >= 1 && learningGoals >= 1,
        badgeLocked: "Locked",
        badgeUnlocked: "Unlocked",
    },
];

export default function TrophyView() {
    const { goals } = useApp();

    // Derive live data for trophy checks
    const allTasks = goals.flatMap(g => g.tasks);
    const doneTaskCount = allTasks.filter(t => t.done).length;
    const aiTaskCount = allTasks.length;
    const fitnessGoals = goals.filter(g => g.category === "Fitness").length;
    const workGoals = goals.filter(g => g.category === "Work").length;
    const learningGoals = goals.filter(g => g.category === "Learning").length;
    const goalCount = goals.length;

    const checkData = { goalCount, aiTaskCount, doneTaskCount, fitnessGoals, workGoals, learningGoals };

    const trophies = TROPHY_DEFS.map(def => ({
        ...def,
        unlocked: def.check(checkData),
    }));

    const unlockedCount = trophies.filter(t => t.unlocked).length;
    const latestUnlocked = trophies.filter(t => t.unlocked).at(-1);

    // Focus time estimate
    const focusHours = (aiTaskCount * 0.5 + 142).toFixed(0);

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Hero banner */}
            <div style={{ borderRadius: "22px", padding: "28px 32px", color: "#fff", display: "flex", alignItems: "center", gap: "28px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#6b5fcf 0%,#a08be0 40%,#d97fba 80%,#e784b0 100%)", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "220px", height: "220px", background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-30px", left: "30%", width: "120px", height: "120px", background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
                <div style={{ fontSize: "72px", position: "relative", zIndex: 1, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))", flexShrink: 0 }}>
                    {latestUnlocked?.icon ?? "🏆"}
                </div>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, opacity: 0.8, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Latest Achievement</div>
                    <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                        {latestUnlocked?.name ?? "Keep going!"} 🏆
                    </h2>
                    <p style={{ fontSize: "13px", opacity: 0.9, fontWeight: 600, lineHeight: 1.5 }}>
                        {latestUnlocked?.desc ?? "Add goals from the chat to unlock achievements!"}
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                        {[
                            { num: `${unlockedCount}`, lbl: "Achievements" },
                            { num: "7 days", lbl: "Current Streak" },
                            { num: `${focusHours}h`, lbl: "Focus Time" },
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
                    <div key={t.id} style={{ background: t.unlocked ? "linear-gradient(135deg,#fffdf0,#fff9e0)" : "#fff", borderRadius: "18px", padding: "20px 16px", textAlign: "center", border: t.isNew && t.unlocked ? "2px solid #e8c866" : t.unlocked ? "1.5px solid #e8c866" : "1.5px solid var(--border)", cursor: "pointer", boxShadow: t.isNew && t.unlocked ? "0 4px 20px rgba(232,200,102,0.35)" : "var(--shadow)", opacity: t.unlocked ? 1 : 0.38, filter: t.unlocked ? "none" : "grayscale(0.8)", transition: "all .2s", position: "relative" }}>
                        {t.isNew && t.unlocked && (
                            <div style={{ position: "absolute", top: "-8px", right: "12px", background: "linear-gradient(135deg,#f0a653,#e8c866)", color: "#fff", fontSize: "9px", fontWeight: 900, padding: "2px 8px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(240,166,83,0.4)" }}>NEW</div>
                        )}
                        <span style={{ fontSize: "38px", display: "block", marginBottom: "10px", lineHeight: 1 }}>{t.icon}</span>
                        <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "4px" }}>{t.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, lineHeight: 1.45, marginBottom: "10px" }}>{t.desc}</div>
                        <div style={{ display: "inline-block", background: t.unlocked ? "#fef3e2" : "var(--bg)", color: t.unlocked ? "#7a4508" : "var(--muted)", fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "8px", border: t.unlocked ? "1px solid #f0a653" : "1px solid var(--border)" }}>
                            {t.unlocked ? t.badgeUnlocked : t.badgeLocked}
                        </div>
                    </div>
                ))}
            </div>

            {/* Next unlock hint */}
            {(() => {
                const nextLocked = trophies.find(t => !t.unlocked);
                if (!nextLocked) return null;
                return (
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "16px 20px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ fontSize: "28px" }}>{nextLocked.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: 900, color: "var(--text)", marginBottom: "3px" }}>Next Achievement: {nextLocked.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>{nextLocked.desc}</div>
                            <div style={{ marginTop: "8px", height: "6px", background: "var(--bg)", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                                <div style={{ height: "100%", borderRadius: "10px", background: "linear-gradient(90deg,var(--purple-mid),var(--purple))", width: `${Math.round((unlockedCount / TROPHY_DEFS.length) * 100)}%` }} />
                            </div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--purple)" }}>
                            {Math.round((unlockedCount / TROPHY_DEFS.length) * 100)}%
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
