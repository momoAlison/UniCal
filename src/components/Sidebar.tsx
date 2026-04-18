"use client";

interface SidebarProps {
    activeItem: string;
    onItemChange: (id: string) => void;
}

const sidebarItems = [
    { id: "calendar", emoji: "📅", title: "日历" },
    { id: "clock", emoji: "🕐", title: "时钟" },
    { id: "stats", emoji: "📈", title: "趋势" },
];

export default function Sidebar({ activeItem, onItemChange }: SidebarProps) {
    const btnStyle = (id: string): React.CSSProperties => ({
        width: "38px",
        height: "38px",
        borderRadius: "11px",
        border: "none",
        background:
            activeItem === id ? "var(--purple-light)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "18px",
        color: "var(--muted)",
        boxShadow:
            activeItem === id
                ? "inset 0 0 0 1.5px var(--purple)"
                : "none",
        transition: "all .18s",
    });

    return (
        <aside
            style={{
                width: "54px",
                background: "#fff",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px 0",
                gap: "6px",
                flexShrink: 0,
            }}
        >
            {sidebarItems.map((item) => (
                <button
                    key={item.id}
                    title={item.title}
                    onClick={() => onItemChange(item.id)}
                    style={btnStyle(item.id)}
                >
                    {item.emoji}
                </button>
            ))}

            <div style={{ flex: 1 }} />

            <button
                title="设置"
                style={btnStyle("settings")}
                onClick={() => onItemChange("settings")}
            >
                ⚙️
            </button>
            <button
                title="用户"
                style={btnStyle("user")}
                onClick={() => onItemChange("user")}
            >
                👤
            </button>
        </aside>
    );
}
