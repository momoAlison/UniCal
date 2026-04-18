"use client";

import { useState } from "react";
import UnicornAvatar from "./icons/UnicornAvatar";

interface Message {
    id: string;
    role: "ai" | "user";
    content: string;
    hasPlanCard?: boolean;
}

const initialMessages: Message[] = [
    {
        id: "1",
        role: "ai",
        content: "早上好！今天有 2 个任务待完成，需要我帮你安排吗？",
    },
    {
        id: "2",
        role: "user",
        content:
            "我下周二要去斯德哥尔摩旅行三天，这期间想保持每天 30 分钟运动，帮我排一下。",
    },
    {
        id: "3",
        role: "ai",
        content: "好的！运动安排在早晨还是晚上？",
        hasPlanCard: true,
    },
];

function AiMiniAvatar() {
    return (
        <div className="w-5 h-5 bg-[#EEEDFE] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
            <svg viewBox="0 0 12 12" fill="none" width={12} height={12}>
                <ellipse cx="6" cy="7" rx="4" ry="3.5" fill="#c6e2f1" />
                <path d="M6 2 L7 4.5 L6 3.5 L5 4.5 Z" fill="#534AB7" />
            </svg>
        </div>
    );
}

function PlanCard() {
    return (
        <div className="bg-white border border-[#c6e2f1] rounded-[10px] p-[8px_10px] mt-1.5 text-[11px]">
            <div className="font-medium text-[#3C3489] mb-[5px]">
                斯德哥尔摩行程草稿
            </div>
            <div className="flex items-center gap-1.5 py-[3px] text-[#444]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c6e2f1] flex-shrink-0" />
                <span className="text-[#888]">周二–周四</span> 斯德哥尔摩旅行
            </div>
            <div className="flex items-center gap-1.5 py-[3px] text-[#444]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F4C0D1] flex-shrink-0" />
                <span className="text-[#888]">每天</span> 晨跑 30 min
            </div>

            {/* Conflict Banner */}
            <div className="flex gap-1.5 items-start mt-1.5 bg-[#FFF0FA] border border-[#F4C0D1] rounded-lg p-[7px_10px] text-[11px] text-[#993556]">
                <svg
                    className="flex-shrink-0 mt-[1px]"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                >
                    <path
                        d="M6 1L11 10H1L6 1Z"
                        fill="#F4C0D1"
                        stroke="#D4537E"
                        strokeWidth="0.8"
                    />
                    <text x="5.2" y="8.5" fontSize="6" fill="#993556">
                        !
                    </text>
                </svg>
                周三 9:00 与线上会议冲突，已自动调整至下午 5 点。
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 mt-2">
                <button className="flex-1 py-[5px] rounded-lg text-[11px] text-center cursor-pointer bg-[#534AB7] text-white border border-[#534AB7] hover:bg-[#3C3489] transition-colors">
                    一键入历 ↗
                </button>
                <button className="flex-1 py-[5px] rounded-lg text-[11px] text-center cursor-pointer bg-white text-[#534AB7] border border-[#c6e2f1] hover:bg-[#f8f5ff] transition-colors">
                    调整
                </button>
            </div>
        </div>
    );
}

export default function ChatBox() {
    const [messages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        if (!inputValue.trim()) return;
        // Future: integrate with Vercel AI SDK useChat
        setInputValue("");
    };

    return (
        <div className="w-64 flex flex-col flex-shrink-0 bg-white">
            {/* Chat Header */}
            <div className="px-4 pt-[14px] pb-[10px] border-b border-[#eae6f4] flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-[#EEEDFE] rounded-full flex items-center justify-center flex-shrink-0">
                    <UnicornAvatar size={20} />
                </div>
                <div>
                    <div className="text-[13px] font-medium text-[#3C3489]">
                        Uni
                    </div>
                    <div className="text-[11px] text-[#bbb]">你的 AI 日程助理</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-[#5DCAA5] flex-shrink-0" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-2.5">
                        {msg.role === "ai" ? (
                            <div className="flex gap-1.5 items-start">
                                <AiMiniAvatar />
                                <div>
                                    <div className="bg-[#f3f0fa] rounded-[0_10px_10px_10px] px-[10px] py-2 text-xs text-[#3C3489] leading-[1.5] max-w-[188px]">
                                        {msg.content}
                                    </div>
                                    {msg.hasPlanCard && <PlanCard />}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#534AB7] rounded-[10px_0_10px_10px] px-[10px] py-2 text-xs text-[#EEEDFE] leading-[1.5] ml-auto max-w-[188px]">
                                {msg.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="px-3 py-[10px] border-t border-[#eae6f4] flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-[#f8f5ff] rounded-full px-[14px] py-[6px] border border-[#e0d8f0]">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="有任何计划，先跟我聊聊…"
                        className="text-xs text-[#444] flex-1 bg-transparent outline-none placeholder:text-[#aaa]"
                    />
                    <button
                        onClick={handleSend}
                        className="w-6 h-6 rounded-full bg-[#534AB7] flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-[#3C3489] transition-colors"
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                        >
                            <path
                                d="M2 6h8M7 3l3 3-3 3"
                                stroke="#fff"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
