"use client";

type Page = "calendar" | "goals" | "trophy" | "stats";

interface HeaderProps {
    currentPage: Page;
    onPageChange: (page: Page) => void;
}

const navItems: { id: Page; label: string }[] = [
    { id: "calendar", label: "日历" },
    { id: "goals", label: "目标" },
    { id: "trophy", label: "奖杯" },
    { id: "stats", label: "统计" },
];

export default function Header({ currentPage, onPageChange }: HeaderProps) {
    return (
        <header
            style={{
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                height: "58px",
                background: "#fff",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
                gap: "16px",
                position: "relative",
                zIndex: 10,
                boxShadow:
                    "0 1px 0 var(--border),0 2px 8px rgba(124,111,205,0.06)",
            }}
        >
            {/* Logo */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    fontSize: "17px",
                    fontWeight: 900,
                    color: "var(--purple-deep)",
                    minWidth: "130px",
                    letterSpacing: "-0.3px",
                }}
            >
                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        background:
                            "linear-gradient(135deg,#c4b8f0 0%,#7c6fcd 100%)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        boxShadow: "0 2px 8px rgba(124,111,205,0.3)",
                    }}
                >
                    🦄
                </div>
                UniCal AI
            </div>

            {/* Navigation */}
            <nav style={{ display: "flex", gap: "2px", flex: 1 }}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        style={{
                            padding: "7px 18px",
                            borderRadius: "22px",
                            border: "none",
                            background:
                                currentPage === item.id
                                    ? "var(--purple)"
                                    : "transparent",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                                currentPage === item.id
                                    ? "#fff"
                                    : "var(--muted)",
                            cursor: "pointer",
                            fontFamily: "Nunito, sans-serif",
                            boxShadow:
                                currentPage === item.id
                                    ? "0 2px 8px rgba(124,111,205,0.35)"
                                    : "none",
                            transition: "all .18s",
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Right side */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginLeft: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        background:
                            "linear-gradient(135deg,#ffe8e8,#fff0f0)",
                        color: "var(--streak)",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "13px",
                        fontWeight: 800,
                        border: "1px solid #ffc9c9",
                    }}
                >
                    <span className="streak-flame">🔥</span>
                    连胜 7 天
                </div>
                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        background:
                            "linear-gradient(135deg,var(--purple),var(--purple-deep))",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(124,111,205,0.35)",
                    }}
                >
                    AS
                </div>
            </div>
        </header>
    );
}
