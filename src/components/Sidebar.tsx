"use client";

import { useApp, Page } from "@/lib/store";

const navItems: { id: Page; emoji: string; label: string }[] = [
    { id: "calendar", emoji: "📅", label: "Calendar" },
    { id: "goals", emoji: "🎯", label: "Goals" },
    { id: "stats", emoji: "📈", label: "Stats" },
    { id: "trophy", emoji: "🏆", label: "Trophies" },
];

export default function Sidebar() {
    const { currentPage, setPage } = useApp();

    const btnStyle = (active: boolean): React.CSSProperties => ({
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "10px 6px",
        borderRadius: "12px",
        border: "none",
        background: active ? "var(--purple-light)" : "transparent",
        cursor: "pointer",
        boxShadow: active ? "inset 0 0 0 1.5px var(--purple)" : "none",
        transition: "all .18s",
    });

    return (
        <aside style={{ width: "64px", background: "#fff", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 8px", gap: "4px", flexShrink: 0 }}>
            {navItems.map((item) => (
                <button key={item.id} title={item.label} onClick={() => setPage(item.id)} style={btnStyle(currentPage === item.id)}>
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>{item.emoji}</span>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: currentPage === item.id ? "var(--purple)" : "var(--muted)", letterSpacing: "0.2px" }}>
                        {item.label}
                    </span>
                </button>
            ))}

            <div style={{ flex: 1 }} />

            {[{ emoji: "⚙️", label: "Settings" }, { emoji: "👤", label: "Profile" }].map((item) => (
                <button key={item.label} title={item.label} style={btnStyle(false)}>
                    <span style={{ fontSize: "20px", lineHeight: 1 }}>{item.emoji}</span>
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "var(--muted)" }}>{item.label}</span>
                </button>
            ))}
        </aside>
    );
}
