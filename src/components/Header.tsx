"use client";

import { useState } from "react";
import UnicornLogo from "./icons/UnicornLogo";

const tabs = ["日历", "目标", "奖杯"];

export default function Header() {
    const [activeTab, setActiveTab] = useState("日历");

    return (
        <header className="flex items-center px-5 h-[52px] border-b border-[#eae6f4] bg-white gap-3 flex-shrink-0">
            {/* Logo */}
            <div className="flex-shrink-0">
                <UnicornLogo size={28} />
            </div>
            <span className="text-[15px] font-medium text-[#3C3489] tracking-tight">
                UniCal AI
            </span>

            {/* Navigation Tabs */}
            <nav className="flex gap-0.5 ml-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-xs px-[10px] py-1 rounded-full border cursor-pointer transition-colors ${activeTab === tab
                                ? "bg-[#EEEDFE] text-[#534AB7] font-medium border-[#EEEDFE]"
                                : "text-[#888] border-transparent hover:bg-gray-50"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2">
                {/* Streak Badge */}
                <div className="flex items-center gap-1 bg-[#FFF0FA] border border-[#F4C0D1] rounded-full px-[10px] py-[3px] text-xs text-[#993556]">
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                    >
                        <path
                            d="M6 1 Q8 3 7 5 Q9 4 9 7 Q9 10 6 11 Q3 10 3 7 Q3 4 5 5 Q4 3 6 1Z"
                            fill="#D4537E"
                        />
                    </svg>
                    连胜 7 天
                </div>

                {/* User Avatar */}
                <div className="w-7 h-7 rounded-full bg-[#c6e2f1] flex items-center justify-center text-[11px] font-medium text-[#185FA5]">
                    AS
                </div>
            </div>
        </header>
    );
}
