"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useApp, detectCategory, CATEGORY_COLORS, type Goal, type GoalTask } from "@/lib/store";
import { generateId as genId } from "ai";
import type { UIMessage } from "ai";
import { generateId } from "ai";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanEvent {
    title: string;
    start_time: string; // ISO 8601 UTC
    end_time: string;   // ISO 8601 UTC
    timezone: string;   // IANA
    is_fixed: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "8px 12px" }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
        </div>
    );
}

/**
 * Group ALL non-fixed AI events into a SINGLE goal.
 * Each event becomes one task under that goal.
 * The goal name is inferred from the shared category or the first event title.
 */
function buildGoalsFromEvents(planEvents: PlanEvent[]): Goal[] {
    const aiEvents = planEvents.filter(ev => !ev.is_fixed);
    if (aiEvents.length === 0) return [];

    // Detect the dominant category across all events
    const allText = aiEvents.map(e => e.title).join(" ");
    const category = detectCategory(allText);
    const colors = CATEGORY_COLORS[category];

    // Derive a goal name: if all events share a common theme word, use it;
    // otherwise fall back to "7-Day Plan" style
    const goalName = aiEvents.length > 1
        ? `${aiEvents.length}-Day ${category} Plan`
        : aiEvents[0].title;

    const goalId = `goal-${goalName.toLowerCase().replace(/\s+/g, "-").slice(0, 24)}-${Date.now()}`;

    const tasks: GoalTask[] = aiEvents.map((ev: PlanEvent, i: number) => {
        const d = new Date(ev.start_time);
        const timeStr = d.toLocaleString("en-US", {
            timeZone: ev.timezone,
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        return {
            id: `${goalId}-t${i}`,
            text: ev.title,
            done: false,
            time: timeStr,
        };
    });

    return [{
        id: goalId,
        icon: colors.icon,
        name: goalName,
        category,
        color: colors.color,
        bgColor: colors.bgColor,
        borderColor: colors.borderColor,
        totalSessions: aiEvents.length,
        doneSessions: 0,
        unit: "sessions",
        aiHint: `AI scheduled ${aiEvents.length} session${aiEvents.length > 1 ? "s" : ""} for this goal. Complete them to track progress!`,
        aiHintType: "ok",
        tasks,
        lastActivity: aiEvents[0].start_time,
    }];
}

function PlanCard({ events }: { events: PlanEvent[] }) {
    const [phase, setPhase] = useState<"idle" | "previewing" | "confirmed">("idle");
    const [previewIds, setPreviewIds] = useState<string[]>([]);
    const { addEvents, confirmEvents, removeEvents, setViewMonth, upsertGoals } = useApp();

    /** Build CalEvent objects from the AI plan */
    const buildCalEvents = (status: "preview" | "confirmed") =>
        events.map(ev => {
            const d = new Date(ev.start_time);
            return {
                id: generateId(),
                isoDate: ev.start_time,
                isoEnd: ev.end_time,
                day: d.getUTCDate(),
                text: ev.title,
                color: ev.is_fixed ? "chip-blue" : "chip-purple",
                type: (ev.is_fixed ? "fixed" : "ai") as "fixed" | "ai",
                isNew: true,
                status,
            };
        });

    const navigateToFirst = (calEvs: { isoDate: string }[]) => {
        if (calEvs.length > 0) {
            const d = new Date(calEvs[0].isoDate);
            setViewMonth(d.getUTCFullYear(), d.getUTCMonth());
        }
    };

    const handlePreview = () => {
        // Remove any existing preview from this card first
        if (previewIds.length > 0) removeEvents(previewIds);

        const calEvs = buildCalEvents("preview");
        addEvents(calEvs);
        const ids = calEvs.map(e => e.id);
        setPreviewIds(ids);
        navigateToFirst(calEvs);
        setPhase("previewing");
    };

    const handleAddToCalendar = () => {
        if (phase === "previewing" && previewIds.length > 0) {
            // Upgrade existing preview events to confirmed
            confirmEvents(previewIds);
        } else {
            // Direct add (no preview step)
            const calEvs = buildCalEvents("confirmed");
            addEvents(calEvs);
            navigateToFirst(calEvs);
        }

        // Auto-detect goals from AI events and upsert into store
        const newGoals = buildGoalsFromEvents(events);
        if (newGoals.length > 0) {
            upsertGoals(newGoals);
        }

        // Persist to Supabase (fire-and-forget; gracefully handles unauthenticated users)
        const payload = events.map(ev => ({
            title: ev.title,
            start_time: ev.start_time,
            end_time: ev.end_time,
            timezone: ev.timezone,
            is_ai_task: !ev.is_fixed,
        }));

        fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ events: payload }),
        })
            .then(async res => {
                const json = await res.json();
                if (!res.ok) {
                    // 401 = not logged in — silently skip DB write
                    if (res.status !== 401) {
                        console.warn("[UniCal] Supabase insert failed:", json.error);
                    }
                } else {
                    console.log(
                        `%c[UniCal] ✅ ${json.inserted} event(s) saved to Supabase`,
                        "color:#4bbfa8;font-weight:bold"
                    );
                }
            })
            .catch(err => console.warn("[UniCal] Network error saving events:", err));

        console.log(
            "%c[UniCal] 一键入历 — event payload:",
            "color:#7c6fcd;font-weight:bold",
            JSON.stringify(payload, null, 2)
        );
        if (newGoals.length > 0) {
            console.log(
                "%c[UniCal] Auto-detected goals:",
                "color:#4bbfa8;font-weight:bold",
                newGoals.map(g => `${g.icon} ${g.name} (${g.category})`).join(", ")
            );
        }

        setPhase("confirmed");
    };

    const handleCancel = () => {
        if (previewIds.length > 0) removeEvents(previewIds);
        setPreviewIds([]);
        setPhase("idle");
    };

    // Format UTC ISO string to local time for display
    const formatLocal = (iso: string, tz: string) => {
        try {
            return new Date(iso).toLocaleString("en-US", {
                timeZone: tz,
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    return (
        <div style={{
            background: "var(--bg)",
            borderRadius: "14px",
            padding: "14px",
            border: "1.5px solid var(--border)",
            fontSize: "11px",
            maxWidth: "95%",
            boxShadow: "var(--shadow)",
        }}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "var(--text)", marginBottom: "10px" }}>
                📅 Proposed Plan
            </div>

            {events.map((ev, i) => (
                <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "7px",
                    marginBottom: "7px",
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: "12px",
                }}>
                    <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: ev.is_fixed ? "#7c6fcd" : "#4bbfa8",
                        flexShrink: 0,
                        marginTop: "3px",
                    }} />
                    <div>
                        <div>{ev.title}</div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>
                            {formatLocal(ev.start_time, ev.timezone)} → {formatLocal(ev.end_time, ev.timezone)}
                        </div>
                    </div>
                </div>
            ))}

            {phase === "confirmed" ? (
                <div style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    background: "#eaf6ec",
                    border: "1px solid #9fe1cb",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#0a5e49",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                }}>
                    ✅ Added to calendar!
                </div>
            ) : phase === "previewing" ? (
                /* Previewing: show Confirm + Cancel */
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                        onClick={handleAddToCalendar}
                        style={{
                            flex: 1,
                            padding: "9px",
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "var(--purple)",
                            color: "#fff",
                            fontFamily: "Nunito, sans-serif",
                            transition: "all .18s",
                        }}
                    >
                        ✓ Confirm
                    </button>
                    <button
                        onClick={handleCancel}
                        style={{
                            flex: 1,
                            padding: "9px",
                            borderRadius: "10px",
                            border: "1.5px solid var(--border)",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "#fff",
                            color: "var(--text)",
                            fontFamily: "Nunito, sans-serif",
                            transition: "all .18s",
                        }}
                    >
                        ✕ Cancel
                    </button>
                </div>
            ) : (
                /* Idle: show Preview + Add directly */
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                        onClick={handlePreview}
                        style={{
                            flex: 1,
                            padding: "9px",
                            borderRadius: "10px",
                            border: "1.5px solid var(--purple)",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "#fff",
                            color: "var(--purple)",
                            fontFamily: "Nunito, sans-serif",
                            transition: "all .18s",
                        }}
                    >
                        👁 Preview
                    </button>
                    <button
                        onClick={handleAddToCalendar}
                        style={{
                            flex: 1,
                            padding: "9px",
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "var(--purple)",
                            color: "#fff",
                            fontFamily: "Nunito, sans-serif",
                            transition: "all .18s",
                        }}
                    >
                        Add ↗
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Message renderer ─────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: UIMessage }) {
    if (message.role === "user") {
        const text = message.parts
            .filter(p => p.type === "text")
            .map(p => (p as { type: "text"; text: string }).text)
            .join("");
        return (
            <div style={{
                maxWidth: "88%",
                padding: "10px 13px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: 1.55,
                background: "var(--purple)",
                color: "#fff",
                borderBottomRightRadius: "4px",
                marginLeft: "auto",
            }}>
                {text}
            </div>
        );
    }

    // Assistant message — render parts
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "95%" }}>
            {message.parts.map((part, i) => {
                if (part.type === "text") {
                    const textPart = part as { type: "text"; text: string };
                    if (!textPart.text) return null;
                    return (
                        <div key={i} style={{
                            padding: "10px 13px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: 600,
                            lineHeight: 1.55,
                            background: "var(--bg)",
                            color: "var(--text)",
                            borderBottomLeftRadius: "4px",
                            border: "1px solid var(--border)",
                        }}>
                            {textPart.text}
                        </div>
                    );
                }

                // Tool invocation — check for create_plan
                // Use unknown cast first to satisfy TS strict overlap check
                const anyPart = part as unknown as {
                    type: string;
                    state: string;
                    input?: { events: PlanEvent[] };
                };

                if (anyPart.type === "tool-create_plan") {
                    if (
                        (anyPart.state === "input-available" || anyPart.state === "output-available") &&
                        anyPart.input?.events
                    ) {
                        return <PlanCard key={i} events={anyPart.input.events} />;
                    }
                    // Still streaming input
                    return (
                        <div key={i} style={{
                            borderRadius: "16px",
                            background: "var(--bg)",
                            borderBottomLeftRadius: "4px",
                            border: "1px solid var(--border)",
                        }}>
                            <TypingIndicator />
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}

// ─── Main ChatBox ─────────────────────────────────────────────────────────────

export default function ChatBox() {
    useApp(); // keep store connected
    const [inputValue, setInputValue] = useState("");
    const msgsEndRef = useRef<HTMLDivElement>(null);

    // Detect user's IANA timezone for System Prompt injection (Rule 3)
    const userTimezone =
        typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "UTC";

    // Use DefaultChatTransport with body injection for timezone
    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { timezone: userTimezone },
        }),
    });

    const isLoading = status === "streaming" || status === "submitted";

    useEffect(() => {
        msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text || isLoading) return;
        setInputValue("");
        sendMessage({ text });
    };

    return (
        <div style={{ width: "310px", borderLeft: "1px solid var(--border)", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg,#c4b8f0,#7c6fcd)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 2px 8px rgba(124,111,205,0.3)", flexShrink: 0 }}>
                    🦄
                </div>
                <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--text)" }}>Uni</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>Your AI scheduling assistant</div>
                </div>
                <div style={{
                    width: "8px",
                    height: "8px",
                    background: isLoading ? "#f0c670" : "#6dba7a",
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                    marginLeft: "auto",
                    flexShrink: 0,
                    transition: "background .3s",
                }} />
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Welcome message when no messages yet */}
                {messages.length === 0 && (
                    <div style={{
                        padding: "10px 13px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: 600,
                        lineHeight: 1.55,
                        background: "var(--bg)",
                        color: "var(--text)",
                        borderBottomLeftRadius: "4px",
                        border: "1px solid var(--border)",
                        maxWidth: "88%",
                    }}>
                        Good morning! I&apos;m Uni, your AI scheduling assistant. What would you like to plan today? 🦄
                    </div>
                )}

                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator while waiting for first token */}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div style={{
                        maxWidth: "88%",
                        borderRadius: "16px",
                        background: "var(--bg)",
                        borderBottomLeftRadius: "4px",
                        border: "1px solid var(--border)",
                    }}>
                        <TypingIndicator />
                    </div>
                )}

                <div ref={msgsEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Any plans? Let's chat..."
                    disabled={isLoading}
                    style={{
                        flex: 1,
                        padding: "9px 14px",
                        borderRadius: "22px",
                        border: "1.5px solid var(--border)",
                        fontSize: "12px",
                        fontFamily: "Nunito, sans-serif",
                        outline: "none",
                        color: "var(--text)",
                        background: isLoading ? "var(--bg)" : "#fff",
                        opacity: isLoading ? 0.7 : 1,
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: isLoading ? "var(--muted)" : "var(--purple)",
                        border: "none",
                        color: "#fff",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(124,111,205,0.35)",
                        transition: "all .18s",
                    }}
                >
                    →
                </button>
            </div>
        </div>
    );
}
