"use client";

import { createContext, useContext } from "react";

export type Page = "calendar" | "goals" | "stats" | "trophy";
export type CalView = "month" | "week" | "day";
export type EventType = "fixed" | "ai";
export type GoalCategory = "Fitness" | "Work" | "Learning" | "Travel" | "Other";

export interface CalEvent {
    id: string;
    /** ISO 8601 UTC date string, e.g. "2026-04-20T14:00:00Z" */
    isoDate: string;
    /** Day of month (kept for backward compat with seed data) */
    day: number;
    text: string;
    color: string; // chip color key
    type: EventType;
    isNew?: boolean; // for animation
    /** ISO 8601 UTC end time */
    isoEnd?: string;
    /**
     * preview = shown on calendar with dashed border (not yet confirmed)
     * confirmed = solid border (user clicked "Add to Calendar")
     */
    status?: "preview" | "confirmed";
    /** Goal this event belongs to (auto-detected by AI) */
    goalId?: string;
    /** AI-detected category label */
    category?: GoalCategory;
    /** AI-detected goal name (e.g. "Daily Morning Run") */
    goalName?: string;
}

export interface GoalTask {
    id: string;
    text: string;
    done: boolean;
    time: string;
}

export interface Goal {
    id: string;
    icon: string;
    name: string;
    category: GoalCategory;
    color: string;
    bgColor: string;
    borderColor: string;
    totalSessions: number;   // total planned sessions/hours
    doneSessions: number;    // completed sessions
    unit: string;            // "h" | "days" | "sessions"
    aiHint: string;
    aiHintType: "warn" | "ok" | "great";
    tasks: GoalTask[];
    /** ISO date of last activity */
    lastActivity?: string;
}

export interface AppState {
    currentPage: Page;
    calView: CalView;
    events: CalEvent[];
    goals: Goal[];
    /** The month/year the calendar is currently showing (for navigation) */
    viewYear: number;
    viewMonth: number; // 0-indexed
    /** actions */
    setPage: (p: Page) => void;
    setCalView: (v: CalView) => void;
    addEvents: (evs: CalEvent[]) => void;
    /** Upgrade preview events to confirmed (solid border) */
    confirmEvents: (ids: string[]) => void;
    /** Remove events by id (e.g. cancel preview) */
    removeEvents: (ids: string[]) => void;
    toggleEventDone: (id: string) => void;
    setViewMonth: (year: number, month: number) => void;
    /** Upsert goals (merge by id) */
    upsertGoals: (goals: Goal[]) => void;
    /** Mark a goal task done */
    toggleGoalTask: (goalId: string, taskId: string) => void;
}

const now = new Date();

export const AppContext = createContext<AppState>({
    currentPage: "calendar",
    calView: "month",
    events: [],
    goals: [],
    viewYear: now.getFullYear(),
    viewMonth: now.getMonth(),
    setPage: () => { },
    setCalView: () => { },
    addEvents: () => { },
    confirmEvents: () => { },
    removeEvents: () => { },
    toggleEventDone: () => { },
    setViewMonth: () => { },
    upsertGoals: () => { },
    toggleGoalTask: () => { },
});

export const useApp = () => useContext(AppContext);

// ── Category detection helpers ────────────────────────────────────────────────

const FITNESS_KEYWORDS = ["run", "workout", "gym", "exercise", "yoga", "swim", "bike", "walk", "fitness", "sport", "train", "jog", "跑", "健身", "运动", "锻炼"];
const WORK_KEYWORDS = ["meeting", "standup", "review", "report", "analysis", "project", "presentation", "会议", "汇报", "分析", "项目", "工作"];
const LEARNING_KEYWORDS = ["study", "learn", "read", "course", "chapter", "practice", "python", "code", "book", "学习", "阅读", "课程", "练习"];
const TRAVEL_KEYWORDS = ["trip", "travel", "flight", "hotel", "旅行", "出差", "旅游"];

export function detectCategory(text: string): GoalCategory {
    const lower = text.toLowerCase();
    if (FITNESS_KEYWORDS.some(k => lower.includes(k))) return "Fitness";
    if (WORK_KEYWORDS.some(k => lower.includes(k))) return "Work";
    if (LEARNING_KEYWORDS.some(k => lower.includes(k))) return "Learning";
    if (TRAVEL_KEYWORDS.some(k => lower.includes(k))) return "Travel";
    return "Other";
}

export const CATEGORY_COLORS: Record<GoalCategory, { color: string; bgColor: string; borderColor: string; icon: string }> = {
    Fitness: { color: "#4bbfa8", bgColor: "#e0f7f3", borderColor: "#4bbfa8", icon: "🏃" },
    Work: { color: "#e784b0", bgColor: "#fce9f3", borderColor: "#e784b0", icon: "💼" },
    Learning: { color: "#5ba4e5", bgColor: "#e6f1fb", borderColor: "#5ba4e5", icon: "📚" },
    Travel: { color: "#7c6fcd", bgColor: "#ede9fb", borderColor: "#7c6fcd", icon: "✈️" },
    Other: { color: "#f0a653", bgColor: "#fef3e2", borderColor: "#f0a653", icon: "⭐" },
};
