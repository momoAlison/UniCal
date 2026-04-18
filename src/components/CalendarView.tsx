"use client";

import { useState } from "react";

type ViewMode = "月" | "周" | "日";

interface CalEvent {
    t: string;
    cls: string;
}

const eventMap: Record<number, CalEvent[]> = {
    3: [{ t: "项目汇报", cls: "blue" }],
    7: [{ t: "每日晨跑", cls: "task" }],
    8: [
        { t: "斯德哥尔摩", cls: "blue" },
        { t: "晨跑 30min", cls: "task" },
    ],
    9: [
        { t: "斯德哥尔摩", cls: "blue" },
        { t: "线上会议", cls: "purple" },
    ],
    10: [
        { t: "斯德哥尔摩", cls: "blue" },
        { t: "下午运动", cls: "task" },
    ],
    14: [{ t: "竞品分析", cls: "pink" }],
    15: [{ t: "竞品分析", cls: "pink" }],
    16: [
        { t: "团队站会", cls: "purple" },
        { t: "竞品分析", cls: "pink" },
    ],
    21: [{ t: "每日晨跑", cls: "task" }],
    28: [{ t: "月度复盘", cls: "blue" }],
};

const pillColors: Record<string, string> = {
    blue: "bg-[#c6e2f1] text-[#185FA5]",
    pink: "bg-[#F4C0D1] text-[#993556]",
    purple: "bg-[#CECBF6] text-[#3C3489]",
    task: "bg-[#E1F5EE] text-[#085041]",
};

// July 2025 starts on Tuesday (index 2 in Sun-Mon-...-Sat grid)
// So we need 2 days from previous month (29, 30) before day 1
const prevMonthDays = [29, 30];
const nextMonthDays = [1, 2, 3, 4];
const TOTAL_DAYS_IN_MONTH = 31;
const TODAY = 15;

export default function CalendarView() {
    const [viewMode, setViewMode] = useState<ViewMode>("月");

    return (
        <div className="flex-1 flex flex-col overflow-hidden border-r border-[#eae6f4]">
            {/* Calendar Header */}
            <div className="flex items-center px-5 pt-[14px] pb-[10px] gap-[10px] flex-shrink-0">
                <span className="text-base font-medium text-[#3C3489]">
                    2025年 7月
                </span>
                <div className="flex gap-0.5">
                    <button className="w-[26px] h-[26px] border border-[#e0d8f0] rounded-lg flex items-center justify-center cursor-pointer bg-white text-[#888] text-xs hover:bg-gray-50">
                        ‹
                    </button>
                    <button className="w-[26px] h-[26px] border border-[#e0d8f0] rounded-lg flex items-center justify-center cursor-pointer bg-white text-[#888] text-xs hover:bg-gray-50">
                        ›
                    </button>
                </div>
                <div className="flex gap-0.5 ml-auto bg-[#f3f0fa] rounded-lg p-0.5">
                    {(["月", "周", "日"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`text-[11px] px-2 py-[3px] rounded-md cursor-pointer transition-colors ${viewMode === mode
                                    ? "bg-white text-[#534AB7] font-medium shadow-sm"
                                    : "text-[#888]"
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-4 pb-3 flex-1 overflow-hidden">
                {/* Day Labels */}
                <div className="grid grid-cols-7 mb-1">
                    {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                        <div
                            key={d}
                            className="text-center text-[11px] text-[#bbb] py-1 font-medium"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-[3px]">
                    {/* Previous month days */}
                    {prevMonthDays.map((day) => (
                        <div
                            key={`prev-${day}`}
                            className="rounded-lg p-[5px_6px] min-h-[68px] cursor-pointer hover:bg-[#f8f5ff]"
                        >
                            <div className="text-xs text-[#ddd] w-[22px] h-[22px] flex items-center justify-center mb-[3px]">
                                {day}
                            </div>
                        </div>
                    ))}

                    {/* Current month days */}
                    {Array.from({ length: TOTAL_DAYS_IN_MONTH }, (_, i) => i + 1).map(
                        (day) => (
                            <div
                                key={day}
                                className="rounded-lg p-[5px_6px] min-h-[68px] cursor-pointer hover:bg-[#f8f5ff]"
                            >
                                <div
                                    className={`text-xs w-[22px] h-[22px] flex items-center justify-center mb-[3px] ${day === TODAY
                                            ? "bg-[#534AB7] text-white rounded-full font-medium"
                                            : "text-[#444]"
                                        }`}
                                >
                                    {day}
                                </div>
                                {eventMap[day]?.map((event, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-[10px] px-[6px] py-[2px] rounded mb-[2px] whitespace-nowrap overflow-hidden text-ellipsis ${pillColors[event.cls]}`}
                                    >
                                        {event.t}
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Next month days */}
                    {nextMonthDays.map((day) => (
                        <div
                            key={`next-${day}`}
                            className="rounded-lg p-[5px_6px] min-h-[68px] cursor-pointer hover:bg-[#f8f5ff]"
                        >
                            <div className="text-xs text-[#ddd] w-[22px] h-[22px] flex items-center justify-center mb-[3px]">
                                {day}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
