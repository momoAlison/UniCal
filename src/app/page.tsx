"use client";

import { useState, useCallback } from "react";
import { AppContext, AppState, Page, CalView, CalEvent } from "@/lib/store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CalendarView from "@/components/CalendarView";
import ChatBox from "@/components/ChatBox";
import GoalsView from "@/components/GoalsView";
import StatsView from "@/components/StatsView";
import TrophyView from "@/components/TrophyView";

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>("calendar");
    const [calView, setCalView] = useState<CalView>("month");
    const [events, setEvents] = useState<CalEvent[]>([]);

    const addEvents = useCallback((evs: CalEvent[]) => {
        setEvents(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newEvs = evs.filter(e => !existingIds.has(e.id));
            return [...prev, ...newEvs];
        });
    }, []);

    const toggleEventDone = useCallback((id: string) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, done: !("done" in e) } : e));
    }, []);

    const ctx: AppState = {
        currentPage,
        calView,
        events,
        setPage: setCurrentPage,
        setCalView,
        addEvents,
        toggleEventDone,
    };

    return (
        <AppContext.Provider value={ctx}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    overflow: "hidden",
                }}
            >
                <Header />

                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    <Sidebar />

                    {/* Main content */}
                    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                        {currentPage === "calendar" && <CalendarView />}
                        {currentPage === "goals" && <GoalsView />}
                        {currentPage === "stats" && <StatsView />}
                        {currentPage === "trophy" && <TrophyView />}
                    </div>

                    {/* ChatPanel — always visible (Chat-First) */}
                    <ChatBox />
                </div>
            </div>
        </AppContext.Provider>
    );
}
