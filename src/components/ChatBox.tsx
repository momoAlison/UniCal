"use client";

import { useState, useRef, useEffect } from "react";
import { useApp, CalEvent } from "@/lib/store";

interface Message {
    id: string;
    role: "ai" | "user";
    content: string;
    hasPlanCard?: boolean;
    isTyping?: boolean;
}

const AI_REPLIES = [
    "Got it! Let me help you plan that. When would you like to start?",
    "Sure! I've detected some free slots on your calendar and can schedule it for you.",
    "No problem — I'll break this task into daily phases so it's easy to complete.",
    "Conflict detected! You have a meeting Wednesday morning. I suggest moving it to 3 PM — does that work?",
    "All set! Click 'Add to Calendar' to sync everything. ✨",
    "Great focus this week! Your completion rate is up 18% from last week — keep it up! 🦄",
];

const initialMessages: Message[] = [
    { id: "1", role: "ai", content: "Good morning! You have 2 tasks pending today — want me to help schedule them?" },
    { id: "2", role: "user", content: "I'm traveling to Stockholm next Tuesday for 3 days. I want to keep a 30-minute workout every day — can you plan that?" },
    { id: "3", role: "ai", content: "Sure! Would you prefer morning or evening workouts?" },
    { id: "4", role: "user", content: "Morning." },
    { id: "5", role: "ai", content: "", hasPlanCard: true },
];

const PLAN_EVENTS: CalEvent[] = [
    { id: "new-run-15", day: 15, text: "Morning Run 30min", color: "chip-teal", type: "ai", isNew: true },
    { id: "new-run-16", day: 16, text: "Morning Run 30min", color: "chip-teal", type: "ai", isNew: true },
    { id: "new-run-17", day: 17, text: "Morning Run 30min", color: "chip-teal", type: "ai", isNew: true },
    { id: "new-travel-15", day: 15, text: "Stockholm Trip", color: "chip-purple", type: "ai", isNew: true },
    { id: "new-travel-16", day: 16, text: "Stockholm Trip", color: "chip-purple", type: "ai", isNew: true },
    { id: "new-travel-17", day: 17, text: "Stockholm Trip", color: "chip-purple", type: "ai", isNew: true },
];

function TypingIndicator() {
    return (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "8px 12px" }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
        </div>
    );
}

function PlanCard({ onConfirm, onAdjust }: { onConfirm: () => void; onAdjust: () => void }) {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        setConfirmed(true);
        onConfirm();
    };

    return (
        <div style={{ background: "var(--bg)", borderRadius: "14px", padding: "14px", border: "1.5px solid var(--border)", fontSize: "11px", maxWidth: "95%", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "var(--text)", marginBottom: "10px" }}>Stockholm Trip Draft</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", marginBottom: "7px", fontWeight: 700, color: "var(--text)", fontSize: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c6fcd", flexShrink: 0, marginTop: "3px" }} />
                <span>Tue–Thu · Stockholm Trip (all day)</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", marginBottom: "7px", fontWeight: 700, color: "var(--text)", fontSize: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4bbfa8", flexShrink: 0, marginTop: "3px" }} />
                <span>Daily 07:00 · Morning Run 30 min ✨</span>
            </div>
            <div style={{ background: "#fef3e2", border: "1.5px solid #f0c670", borderRadius: "9px", padding: "9px 11px", marginTop: "8px", fontSize: "11px", color: "#7a4508", fontWeight: 700, display: "flex", alignItems: "flex-start", gap: "7px", lineHeight: 1.45 }}>
                <span>⚠️</span>
                <span>Wed 9:00 conflicts with Team Meeting — auto-rescheduled to 5 PM.</span>
            </div>
            {!confirmed ? (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                        onClick={handleConfirm}
                        style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "none", fontSize: "12px", fontWeight: 800, cursor: "pointer", background: "var(--purple)", color: "#fff", fontFamily: "Nunito, sans-serif", transition: "all .18s" }}
                    >
                        Add to Calendar ↗
                    </button>
                    <button
                        onClick={onAdjust}
                        style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "1.5px solid var(--border)", fontSize: "12px", fontWeight: 800, cursor: "pointer", background: "#fff", color: "var(--text)", fontFamily: "Nunito, sans-serif", transition: "all .18s" }}
                    >
                        Adjust
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "10px", background: "#eaf6ec", border: "1px solid #9fe1cb", fontSize: "12px", fontWeight: 800, color: "#0a5e49", display: "flex", alignItems: "center", gap: "6px" }}>
                    ✅ Synced to your calendar!
                </div>
            )}
        </div>
    );
}

export default function ChatBox() {
    const { addEvents } = useApp();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [replyIdx, setReplyIdx] = useState(0);
    const msgsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleConfirm = () => {
        addEvents(PLAN_EVENTS);
        setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), role: "ai", content: "✅ Added to your calendar! Tue–Thu trip and daily morning runs are all set. Have a great trip! 🦄" },
        ]);
    };

    const handleAdjust = () => {
        setInputValue("This time doesn't work — please find another free slot.");
    };

    const sendChat = () => {
        const text = inputValue.trim();
        if (!text) return;
        setInputValue("");

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
        const typingMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: "", isTyping: true };

        setMessages(prev => [...prev, userMsg, typingMsg]);

        setTimeout(() => {
            const reply = AI_REPLIES[replyIdx % AI_REPLIES.length];
            setReplyIdx(i => i + 1);
            setMessages(prev => prev.map(m => m.isTyping ? { ...m, content: reply, isTyping: false } : m));
        }, 900 + Math.random() * 600);
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
                <div style={{ width: "8px", height: "8px", background: "#6dba7a", borderRadius: "50%", border: "1.5px solid #fff", marginLeft: "auto", flexShrink: 0 }} />
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {messages.map(msg => (
                    <div key={msg.id}>
                        {msg.role === "user" ? (
                            <div style={{ maxWidth: "88%", padding: "10px 13px", borderRadius: "16px", fontSize: "12px", fontWeight: 600, lineHeight: 1.55, background: "var(--purple)", color: "#fff", borderBottomRightRadius: "4px", marginLeft: "auto" }}>
                                {msg.content}
                            </div>
                        ) : msg.hasPlanCard ? (
                            <PlanCard onConfirm={handleConfirm} onAdjust={handleAdjust} />
                        ) : msg.isTyping ? (
                            <div style={{ maxWidth: "88%", borderRadius: "16px", background: "var(--bg)", borderBottomLeftRadius: "4px", border: "1px solid var(--border)" }}>
                                <TypingIndicator />
                            </div>
                        ) : (
                            <div style={{ maxWidth: "88%", padding: "10px 13px", borderRadius: "16px", fontSize: "12px", fontWeight: 600, lineHeight: 1.55, background: "var(--bg)", color: "var(--text)", borderBottomLeftRadius: "4px", border: "1px solid var(--border)" }}>
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={msgsEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendChat()}
                    placeholder="Any plans? Let's chat..."
                    style={{ flex: 1, padding: "9px 14px", borderRadius: "22px", border: "1.5px solid var(--border)", fontSize: "12px", fontFamily: "Nunito, sans-serif", outline: "none", color: "var(--text)", background: "#fff" }}
                />
                <button
                    onClick={sendChat}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--purple)", border: "none", color: "#fff", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(124,111,205,0.35)", transition: "all .18s" }}
                >
                    →
                </button>
            </div>
        </div>
    );
}
