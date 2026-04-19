"use client";

import { useState, useCallback } from "react";
import { AppContext, AppState, Page, CalView, CalEvent, Goal } from "@/lib/store";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CalendarView from "@/components/CalendarView";
import ChatBox from "@/components/ChatBox";
import GoalsView from "@/components/GoalsView";
import StatsView from "@/components/StatsView";
import TrophyView from "@/components/TrophyView";
import UnicornConfetti from "@/components/UnicornConfetti";

export default function Home() {
    const [currentPage, setCurrentPage] = useState<Page>("calendar");
    const [calView, setCalView] = useState<CalView>("month");
    const [events, setEvents] = useState<CalEvent[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [streakDays, setStreakDays] = useState(7); // seed with 7
    const [confettiTrigger, setConfettiTrigger] = useState(false);

    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonthState] = useState(now.getMonth());

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

    const setViewMonth = useCallback((year: number, month: number) => {
        setViewYear(year);
        setViewMonthState(month);
    }, []);

    const confirmEvents = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setEvents(prev => prev.map(e => idSet.has(e.id) ? { ...e, status: "confirmed" as const, isNew: false } : e));
    }, []);

    const removeEvents = useCallback((ids: string[]) => {
        const idSet = new Set(ids);
        setEvents(prev => prev.filter(e => !idSet.has(e.id)));
    }, []);

    const upsertGoals = useCallback((incoming: Goal[]) => {
        setGoals(prev => {
            const map = new Map(prev.map(g => [g.id, g]));
            for (const g of incoming) {
                const existing = map.get(g.id);
                if (existing) {
                    // Merge: keep existing tasks, update counts
                    map.set(g.id, {
                        ...existing,
                        ...g,
                        tasks: [
                            ...existing.tasks,
                            ...g.tasks.filter(t => !existing.tasks.find(et => et.id === t.id)),
                        ],
                        totalSessions: existing.totalSessions + g.totalSessions,
                        lastActivity: g.lastActivity ?? existing.lastActivity,
                    });
                } else {
                    map.set(g.id, g);
                }
            }
            return Array.from(map.values());
        });
    }, []);

    const toggleGoalTask = useCallback((goalId: string, taskId: string) => {
        let wasUndone = false;
        setGoals(prev => prev.map(g => {
            if (g.id !== goalId) return g;
            const tasks = g.tasks.map(t => {
                if (t.id !== taskId) return t;
                wasUndone = !t.done; // true = we're marking it done
                return { ...t, done: !t.done };
            });
            return { ...g, tasks };
        }));
        // Fire confetti when marking a task as done
        if (wasUndone) {
            setConfettiTrigger(true);
            setStreakDays(s => s + 1);
        }
    }, []);

    const resetConfetti = useCallback(() => setConfettiTrigger(false), []);
    const incrementStreak = useCallback(() => setStreakDays(s => s + 1), []);

    const ctx: AppState = {
        currentPage,
        calView,
        events,
        goals,
        viewYear,
        viewMonth,
        streakDays,
        confettiTrigger,
        setPage: setCurrentPage,
        setCalView,
        addEvents,
        confirmEvents,
        removeEvents,
        toggleEventDone,
        setViewMonth,
        upsertGoals,
        toggleGoalTask,
        resetConfetti,
        incrementStreak,
    };

    return (
        <AppContext.Provider value={ctx}>
            {/* Global unicorn confetti — fires on task completion */}
            <UnicornConfetti trigger={confettiTrigger} onDone={resetConfetti} />

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
