"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CalendarView from "@/components/CalendarView";
import ChatBox from "@/components/ChatBox";
import TrophyView from "@/components/TrophyView";
import StatsView from "@/components/StatsView";

type Page = "calendar" | "goals" | "trophy" | "stats";

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>("calendar");
    const [sidebarItem, setSidebarItem] = useState("calendar");

    const showChat = currentPage === "calendar" || currentPage === "goals";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <Header currentPage={currentPage} onPageChange={setCurrentPage} />

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <Sidebar
                    activeItem={sidebarItem}
                    onItemChange={setSidebarItem}
                />

                {/* Content area */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    {(currentPage === "calendar" ||
                        currentPage === "goals") && <CalendarView />}
                    {currentPage === "trophy" && <TrophyView />}
                    {currentPage === "stats" && <StatsView />}
                </div>

                {/* AI Chat Panel — shown only on calendar/goals pages */}
                {showChat && <ChatBox />}
            </div>
        </div>
    );
}
