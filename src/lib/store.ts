"use client";

import { createContext, useContext } from "react";

export type Page = "calendar" | "goals" | "stats" | "trophy";
export type CalView = "month" | "week" | "day";
export type EventType = "fixed" | "ai";

export interface CalEvent {
    id: string;
    day: number; // day of month
    text: string;
    color: string; // chip color key
    type: EventType;
    isNew?: boolean; // for animation
}

export interface AppState {
    currentPage: Page;
    calView: CalView;
    events: CalEvent[];
    // actions
    setPage: (p: Page) => void;
    setCalView: (v: CalView) => void;
    addEvents: (evs: CalEvent[]) => void;
    toggleEventDone: (id: string) => void;
}

export const AppContext = createContext<AppState>({
    currentPage: "calendar",
    calView: "month",
    events: [],
    setPage: () => { },
    setCalView: () => { },
    addEvents: () => { },
    toggleEventDone: () => { },
});

export const useApp = () => useContext(AppContext);
