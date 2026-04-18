"use client";

import { useState } from "react";

const sidebarItems = [
    {
        id: "calendar",
        icon: (
            <svg viewBox="0 0 18 18" fill="none" width={18} height={18}>
                <rect
                    x="2"
                    y="3"
                    width="14"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
                <path
                    d="M6 2v2M12 2v2M2 7h14"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    {
        id: "clock",
        icon: (
            <svg viewBox="0 0 18 18" fill="none" width={18} height={18}>
                <path
                    d="M9 3v6l4 2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
                <circle
                    cx="9"
                    cy="9"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                />
            </svg>
        ),
    },
    {
        id: "stats",
        icon: (
            <svg viewBox="0 0 18 18" fill="none" width={18} height={18}>
                <path
                    d="M3 13 L5 9 L8 11 L11 6 L15 10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
    },
];

export default function Sidebar() {
    const [activeItem, setActiveItem] = useState("calendar");

    return (
        <aside className="w-[52px] border-r border-[#eae6f4] flex flex-col items-center py-3 gap-2 bg-[#fafafa] flex-shrink-0">
            {sidebarItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-colors ${activeItem === item.id
                            ? "bg-[#EEEDFE] text-[#534AB7]"
                            : "text-[#aaa] hover:bg-gray-100"
                        }`}
                >
                    {item.icon}
                </button>
            ))}

            {/* User icon at bottom */}
            <button className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer text-[#aaa] hover:bg-gray-100 mt-auto">
                <svg viewBox="0 0 18 18" fill="none" width={18} height={18}>
                    <circle
                        cx="9"
                        cy="7"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                    />
                    <path
                        d="M3 15c0-3 2.7-5 6-5s6 2 6 5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </aside>
    );
}
