"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";

export default function Header() {
    const { currentPage, calView, setCalView } = useApp();
    const [streakDays] = useState(7);

    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                height: "54px",
                background: "#fff",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
                gap: "12px",
                position: "relative",
                zIndex: 10,
                boxShadow: "0 1px 0 var(--border),0 2px 8px rgba(124,111,205,0.06)",
            }}
        >
            {/* Logo wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "130px" }}>
                <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,#c4b8f0 0%,#7c6fcd 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 2px 8px rgba(124,111,205,0.3)", flexShrink: 0 }}>
                    🦄
                </div>
                <span style={{ fontSize: "16px", fontWeight: 900, color: "var(--purple-deep)", letterSpacing: "-0.3px" }}>UniCal AI</span>
            </div>

            {/* Context area */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                {currentPage === "calendar" && (
                    <div style={{ display: "flex", gap: "2px", background: "var(--bg)", borderRadius: "10px", padding: "3px" }}>
                        {(["Month", "Week", "Day"] as const).map((label, i) => {
                            const views = ["month", "week", "day"] as const;
                            const v = views[i];
                            const active = calView === v;
                            return (
                                <button key={v} onClick={() => setCalView(v)} style={{ padding: "5px 20px", borderRadius: "8px", border: "none", background: active ? "#fff" : "transparent", fontSize: "13px", fontWeight: 800, color: active ? "var(--purple)" : "var(--muted)", cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: active ? "0 1px 6px rgba(124,111,205,0.18)" : "none", transition: "all .18s" }}>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}
                {currentPage === "goals" && (
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted)" }}>🎯 Goal Tracker</div>
                )}
                {currentPage === "stats" && (
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted)" }}>📈 Analytics</div>
                )}
                {currentPage === "trophy" && (
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted)" }}>🏆 Hall of Fame</div>
                )}
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,#ffe8e8,#fff0f0)", color: "var(--streak)", borderRadius: "20px", padding: "5px 12px", fontSize: "12px", fontWeight: 800, border: "1px solid #ffc9c9" }}>
                    <span className="streak-flame">🔥</span>
                    {streakDays}-day streak
                </div>
                <button style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", position: "relative" }}>
                    🔔
                    <span style={{ position: "absolute", top: "2px", right: "2px", width: "8px", height: "8px", background: "var(--streak)", borderRadius: "50%", border: "1.5px solid #fff" }} />
                </button>
                <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg,var(--purple),var(--purple-deep))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(124,111,205,0.35)" }}>
                    AS
                </div>
            </div>
        </header>
    );
}
