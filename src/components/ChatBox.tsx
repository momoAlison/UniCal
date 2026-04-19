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
 * ThinkingBlock — renders the AI's <thinking>...</thinking> content.
 * While streaming (content is partial/changing), shows a scrolling marquee of the latest text.
 * After streaming completes, collapses to a single-line pill (expandable on click).
 */
function ThinkingBlock({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
    const [expanded, setExpanded] = useState(false);

    if (isStreaming) {
        // During streaming: show a compact 1-line pill with the last ~60 chars of content scrolling
        const preview = content.length > 60 ? "…" + content.slice(-60) : content;
        return (
            <div style={{
                padding: "3px 10px",
                borderRadius: "10px",
                background: "rgba(124,111,205,0.06)",
                border: "1px solid rgba(124,111,205,0.15)",
                fontSize: "10px",
                fontWeight: 500,
                fontStyle: "italic",
                color: "var(--muted)",
                lineHeight: 1.5,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                opacity: 0.8,
            }}>
                <span style={{ marginRight: "4px" }}>🧠</span>
                {preview}
            </div>
        );
    }

    // After streaming: collapsed pill, expandable on click
    return (
        <div
            onClick={() => setExpanded(e => !e)}
            style={{
                cursor: "pointer",
                padding: expanded ? "6px 10px" : "3px 10px",
                borderRadius: "10px",
                background: "rgba(124,111,205,0.06)",
                border: "1px solid rgba(124,111,205,0.15)",
                fontSize: "10px",
                fontWeight: 500,
                fontStyle: "italic",
                color: "var(--muted)",
                lineHeight: 1.5,
                userSelect: "none",
                transition: "padding .15s",
                overflow: expanded ? "visible" : "hidden",
                whiteSpace: expanded ? "normal" : "nowrap",
                textOverflow: expanded ? "clip" : "ellipsis",
            }}
            title={expanded ? "Click to collapse" : "Click to expand thinking"}
        >
            {expanded ? (
                <>
                    <span style={{ opacity: 0.6, marginRight: "4px" }}>🧠</span>
                    {content}
                    <span style={{ marginLeft: "6px", opacity: 0.5, fontSize: "9px" }}>▲ collapse</span>
                </>
            ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0.7 }}>
                    <span>🧠</span>
                    <span>Thinking...</span>
                    <span style={{ opacity: 0.5, fontSize: "9px", marginLeft: "2px" }}>▼</span>
                </span>
            )}
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

// ─── Conflict detection ───────────────────────────────────────────────────────

interface ConflictInfo {
    newEvent: PlanEvent;
    existingTitle: string;
    existingStart: string;
    existingEnd: string;
}

function detectConflicts(newEvents: PlanEvent[], existingEvents: { isoDate: string; isoEnd?: string; text: string }[]): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    for (const newEv of newEvents) {
        const newStart = new Date(newEv.start_time).getTime();
        const newEnd = new Date(newEv.end_time).getTime();
        for (const ex of existingEvents) {
            if (!ex.isoEnd) continue;
            const exStart = new Date(ex.isoDate).getTime();
            const exEnd = new Date(ex.isoEnd).getTime();
            const GRACE_MS = 5 * 60_000;
            if (newStart < exEnd - GRACE_MS && newEnd > exStart + GRACE_MS) {
                conflicts.push({
                    newEvent: newEv,
                    existingTitle: ex.text,
                    existingStart: ex.isoDate,
                    existingEnd: ex.isoEnd,
                });
            }
        }
    }
    return conflicts;
}

function PlanCard({ events }: { events: PlanEvent[] }) {
    const [phase, setPhase] = useState<"idle" | "previewing" | "confirmed">("idle");
    const [previewIds, setPreviewIds] = useState<string[]>([]);
    const { addEvents, confirmEvents, removeEvents, setViewMonth, upsertGoals, events: existingEvents } = useApp();

    const existingWithEnd = existingEvents.filter(e => e.isoEnd && !previewIds.includes(e.id));
    const conflicts = detectConflicts(events, existingWithEnd);

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
            confirmEvents(previewIds);
        } else {
            const calEvs = buildCalEvents("confirmed");
            addEvents(calEvs);
            navigateToFirst(calEvs);
        }

        const newGoals = buildGoalsFromEvents(events);
        if (newGoals.length > 0) {
            upsertGoals(newGoals);
        }

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

            {events.map((ev, i) => {
                const evConflicts = conflicts.filter(c => c.newEvent === ev);
                return (
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
                            background: evConflicts.length > 0 ? "#f0a653" : ev.is_fixed ? "#7c6fcd" : "#4bbfa8",
                            flexShrink: 0,
                            marginTop: "3px",
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <span>{ev.title}</span>
                                {evConflicts.length > 0 && (
                                    <span style={{ fontSize: "9px", background: "#fef3e2", color: "#7a4508", border: "1px solid #f0c670", borderRadius: "4px", padding: "1px 5px", fontWeight: 800 }}>
                                        ⚠ conflict
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600, marginTop: "2px" }}>
                                {formatLocal(ev.start_time, ev.timezone)} → {formatLocal(ev.end_time, ev.timezone)}
                            </div>
                            {evConflicts.map((c, ci) => (
                                <div key={ci} style={{ fontSize: "10px", color: "#7a4508", fontWeight: 700, marginTop: "3px", background: "#fef3e2", borderRadius: "6px", padding: "3px 7px", border: "1px solid #f0c670" }}>
                                    ⚠ Overlaps with &quot;{c.existingTitle}&quot; ({formatLocal(c.existingStart, ev.timezone)} – {formatLocal(c.existingEnd, ev.timezone)})
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

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

                    // Split out <thinking>...</thinking> blocks and render them separately.
                    // Also handle the case where streaming is mid-tag (no closing </thinking> yet).
                    const rawText = textPart.text;
                    const segments: Array<{ type: "thinking" | "thinking-streaming" | "normal"; content: string }> = [];
                    let lastIndex = 0;
                    let match: RegExpExecArray | null;
                    const closedThinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/gi;
                    while ((match = closedThinkingRegex.exec(rawText)) !== null) {
                        if (match.index > lastIndex) {
                            const before = rawText.slice(lastIndex, match.index).trim();
                            if (before) segments.push({ type: "normal", content: before });
                        }
                        segments.push({ type: "thinking", content: match[1].trim() });
                        lastIndex = match.index + match[0].length;
                    }
                    // Check for an unclosed <thinking> tag (still streaming)
                    const openTagIdx = rawText.indexOf("<thinking>", lastIndex);
                    if (openTagIdx !== -1) {
                        const before = rawText.slice(lastIndex, openTagIdx).trim();
                        if (before) segments.push({ type: "normal", content: before });
                        const streamingContent = rawText.slice(openTagIdx + "<thinking>".length);
                        segments.push({ type: "thinking-streaming", content: streamingContent });
                        lastIndex = rawText.length;
                    }
                    if (lastIndex < rawText.length) {
                        const tail = rawText.slice(lastIndex).trim();
                        if (tail) segments.push({ type: "normal", content: tail });
                    }
                    if (segments.length === 0) segments.push({ type: "normal", content: rawText });

                    return (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {segments.map((seg, si) => {
                                if (seg.type === "thinking") {
                                    return <ThinkingBlock key={si} content={seg.content} isStreaming={false} />;
                                }
                                if (seg.type === "thinking-streaming") {
                                    return <ThinkingBlock key={si} content={seg.content} isStreaming={true} />;
                                }
                                if (!seg.content) return null;
                                return (
                                    <div key={si} style={{
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
                                        {seg.content}
                                    </div>
                                );
                            })}
                        </div>
                    );
                }

                // Tool invocation — check for create_plan
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
    const { events: existingEvents } = useApp();
    const [inputValue, setInputValue] = useState("");
    const msgsEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Listen for "unical:focus-chat" events dispatched by CalendarView when conflicts are detected
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<{ prefill?: string }>).detail;
            if (detail?.prefill) setInputValue(detail.prefill);
            inputRef.current?.focus();
        };
        window.addEventListener("unical:focus-chat", handler);
        return () => window.removeEventListener("unical:focus-chat", handler);
    }, []);

    // Detect user's IANA timezone for System Prompt injection (Rule 3)
    const userTimezone =
        typeof Intl !== "undefined"
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "UTC";

    // Build a compact list of existing events to send to the AI for conflict avoidance.
    // Include ALL events with an end time (Google Calendar synced + previously confirmed AI events).
    // Exclude preview events (status === "preview") since they haven't been confirmed yet.
    const existingEventsForAI = existingEvents
        .filter(e => e.isoEnd && e.status !== "preview")
        .map(e => ({ title: e.text, start: e.isoDate, end: e.isoEnd! }));

    // Use DefaultChatTransport with body injection for timezone + existing events.
    const { messages, sendMessage: _sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { timezone: userTimezone },
        }),
    });

    // Wrap sendMessage to always inject the latest existingEventsForAI at send time.
    // Only send events within the next 14 days to keep the context focused and reduce noise.
    const sendMessage = (opts: Parameters<typeof _sendMessage>[0]) => {
        const now = Date.now();
        const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
        const latestEvents = existingEvents
            .filter(e => {
                if (!e.isoEnd || e.status === "preview") return false;
                const start = new Date(e.isoDate).getTime();
                return start >= now - 60 * 60 * 1000 && start <= now + fourteenDaysMs;
            })
            .map(e => ({ title: e.text, start: e.isoDate, end: e.isoEnd! }));
        console.log(`%c[UniCal] Sending ${latestEvents.length} existing events to AI (next 14 days)`, "color:#7c6fcd;font-weight:bold", latestEvents.map(e => `${e.title} @ ${e.start}`));
        return _sendMessage(opts, { body: { timezone: userTimezone, existingEvents: latestEvents } });
    };

    // suppress unused warning
    void existingEventsForAI;
    void genId;

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
                    ref={inputRef}
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
