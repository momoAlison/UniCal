"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const handleGoogleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // Request Google Calendar access alongside basic auth
                scopes: "https://www.googleapis.com/auth/calendar",
                redirectTo: `${window.location.origin}/api/auth/callback`,
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f0eef8 0%, #fce9f3 50%, #e0f7f3 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Nunito, sans-serif",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "28px",
                    padding: "48px 40px",
                    width: "100%",
                    maxWidth: "400px",
                    boxShadow: "0 8px 40px rgba(124,111,205,0.18)",
                    border: "1.5px solid #ede9fb",
                    textAlign: "center",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        background: "linear-gradient(135deg,#c4b8f0 0%,#7c6fcd 100%)",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        margin: "0 auto 20px",
                        boxShadow: "0 4px 16px rgba(124,111,205,0.35)",
                    }}
                >
                    🦄
                </div>

                <h1
                    style={{
                        fontSize: "26px",
                        fontWeight: 900,
                        color: "#2d2456",
                        letterSpacing: "-0.5px",
                        marginBottom: "6px",
                    }}
                >
                    UniCal AI
                </h1>
                <p
                    style={{
                        fontSize: "14px",
                        color: "#8b85b0",
                        fontWeight: 600,
                        marginBottom: "36px",
                        lineHeight: 1.5,
                    }}
                >
                    Your intelligent calendar assistant.
                    <br />
                    Sign in to get started.
                </p>

                {/* Error message */}
                {error && (
                    <div
                        style={{
                            background: "#fef3e2",
                            border: "1.5px solid #f0c670",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#7a4508",
                            marginBottom: "20px",
                            textAlign: "left",
                        }}
                    >
                        ⚠️ Authentication failed. Please try again.
                    </div>
                )}

                {/* Google Sign-In Button */}
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: "100%",
                        padding: "14px 20px",
                        borderRadius: "14px",
                        border: "1.5px solid #e8e4f8",
                        background: "#fff",
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#2d2456",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        fontFamily: "Nunito, sans-serif",
                        boxShadow: "0 2px 8px rgba(124,111,205,0.12)",
                        transition: "all .18s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#f5f3ff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#7c6fcd";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8e4f8";
                    }}
                >
                    {/* Google SVG icon */}
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Continue with Google
                </button>

                <p
                    style={{
                        fontSize: "11px",
                        color: "#b0aac8",
                        fontWeight: 600,
                        marginTop: "20px",
                        lineHeight: 1.6,
                    }}
                >
                    By signing in, you grant UniCal AI access to your Google Calendar
                    to sync and manage your events.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}
