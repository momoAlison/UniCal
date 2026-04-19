"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
    const { currentPage, calView, setCalView } = useApp();
    const [streakDays] = useState(7);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Get current session
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });

        // Listen for auth state changes (login / logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const handleSignIn = () => {
        window.location.href = "/login";
    };

    // Derive initials from user email or name
    const initials = user?.user_metadata?.full_name
        ? (user.user_metadata.full_name as string).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() ?? "?";

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

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
                {/* Streak badge — only show when logged in */}
                {user && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,#ffe8e8,#fff0f0)", color: "var(--streak)", borderRadius: "20px", padding: "5px 12px", fontSize: "12px", fontWeight: 800, border: "1px solid #ffc9c9" }}>
                        <span className="streak-flame">🔥</span>
                        {streakDays}-day streak
                    </div>
                )}

                {/* Notification bell — only show when logged in */}
                {user && (
                    <button style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", position: "relative" }}>
                        🔔
                        <span style={{ position: "absolute", top: "2px", right: "2px", width: "8px", height: "8px", background: "var(--streak)", borderRadius: "50%", border: "1.5px solid #fff" }} />
                    </button>
                )}

                {/* Auth button */}
                {loading ? (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg)", border: "1.5px solid var(--border)" }} />
                ) : user ? (
                    /* Logged-in: avatar + sign-out on click */
                    <div
                        title={`Signed in as ${user.email}\nClick to sign out`}
                        onClick={handleSignOut}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 6px rgba(124,111,205,0.35)", flexShrink: 0, border: "2px solid var(--purple)" }}
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,var(--purple),var(--purple-deep))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 800 }}>
                                {initials}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Logged-out: sign-in button */
                    <button
                        onClick={handleSignIn}
                        style={{ padding: "6px 14px", borderRadius: "10px", border: "1.5px solid var(--purple)", background: "var(--purple)", color: "#fff", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", transition: "all .18s" }}
                    >
                        Sign in
                    </button>
                )}
            </div>
        </header>
    );
}
