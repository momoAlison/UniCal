"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    id: string;
    role: "ai" | "user";
    content: string;
    hasPlanCard?: boolean;
    isTyping?: boolean;
}

const AI_REPLIES = [
    "好的！我来帮你规划一下。你希望什么时候开始？",
    "明白！我已经检测到你日历上的空闲时段，可以帮你安排。",
    "没问题，我会把这个任务拆分成几个阶段，方便你每天完成。",
    "检测到潜在冲突！你周三上午已有会议，我建议调整到下午 3 点，可以吗？",
    "已经帮你排好了！点击「一键入历」即可同步到你的日历。✨",
    "你的专注力表现很棒！这周完成率比上周提高了 18%，继续加油！🦄",
];

const initialMessages: Message[] = [
    { id: "1", role: "ai", content: "早上好！今天有 2 个任务待完成，需要我帮你安排吗？" },
    { id: "2", role: "user", content: "我下周二要去斯德哥尔摩旅行三天，这期间想保持每天 30 分钟运动，帮我排一下。" },
    { id: "3", role: "ai", content: "好的！运动安排在早晨还是晚上？" },
    { id: "4", role: "user", content: "早晨。" },
    { id: "5", role: "ai", content: "", hasPlanCard: true },
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

function PlanCard({ onConfirm }: { onConfirm: () => void }) {
    return (
        <div style={{ background: "var(--bg)", borderRadius: "14px", padding: "14px", border: "1.5px solid var(--border)", fontSize: "11px", maxWidth: "95%", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "var(--text)", marginBottom: "10px" }}>斯德哥尔摩行程草稿</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", marginBottom: "7px", fontWeight: 700, color: "var(--text)", fontSize: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c6fcd", flexShrink: 0, marginTop: "3px" }} />
                <span>周二-周四 斯德哥尔摩旅行（全天）</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", marginBottom: "7px", fontWeight: 700, color: "var(--text)", fontSize: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4bbfa8", flexShrink: 0, marginTop: "3px" }} />
                <span>每天 07:00 晨跑 30 min</span>
            </div>
            <div style={{ background: "#fef3e2", border: "1.5px solid #f0c670", borderRadius: "9px", padding: "9px 11px", marginTop: "8px", fontSize: "11px", color: "#7a4508", fontWeight: 700, display: "flex", alignItems: "flex-start", gap: "7px", lineHeight: 1.45 }}>
                <span>⚠️</span>
                <span>周三 9:00 与线上会议冲突，已自动调整至下午 5 点。</span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                    onClick={onConfirm}
                    style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "none", fontSize: "12px", fontWeight: 800, cursor: "pointer", background: "var(--purple)", color: "#fff", fontFamily: "Nunito, sans-serif", transition: "all .18s" }}
                >
                    一键入历 ↗
                </button>
                <button
                    style={{ flex: 1, padding: "9px", borderRadius: "10px", border: "1.5px solid var(--border)", fontSize: "12px", fontWeight: 800, cursor: "pointer", background: "#fff", color: "var(--text)", fontFamily: "Nunito, sans-serif", transition: "all .18s" }}
                >
                    调整
                </button>
            </div>
        </div>
    );
}

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [replyIdx, setReplyIdx] = useState(0);
    const msgsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleConfirm = () => {
        setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), role: "ai", content: "✅ 已成功添加到日历！周二到周四的旅行日程和每日晨跑已排好。祝旅途愉快！🦄" },
        ]);
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
        <div style={{ width: "308px", borderLeft: "1px solid var(--border)", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            {/* Header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg,#c4b8f0,#7c6fcd)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 2px 8px rgba(124,111,205,0.3)", flexShrink: 0 }}>
                    🦄
                </div>
                <div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--text)" }}>Uni</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>你的 AI 日程助理</div>
                </div>
                <div style={{ width: "8px", height: "8px", background: "#6dba7a", borderRadius: "50%", border: "1.5px solid #fff", marginLeft: "auto", flexShrink: 0 }} />
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {messages.map(msg => (
                    <div key={msg.id}>
                        {msg.role === "user" ? (
                            <div style={{ maxWidth: "88%", padding: "10px 13px", borderRadius: "16px", fontSize: "12px", fontWeight: 600, lineHeight: 1.55, background: "var(--purple)", color: "#fff", borderBottomRightRadius: "4px", alignSelf: "flex-end", marginLeft: "auto" }}>
                                {msg.content}
                            </div>
                        ) : msg.hasPlanCard ? (
                            <PlanCard onConfirm={handleConfirm} />
                        ) : msg.isTyping ? (
                            <div style={{ maxWidth: "88%", borderRadius: "16px", fontSize: "12px", fontWeight: 600, lineHeight: 1.55, background: "var(--bg)", color: "var(--text)", borderBottomLeftRadius: "4px", border: "1px solid var(--border)" }}>
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
                    placeholder="有任何计划，先跟我聊聊..."
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
