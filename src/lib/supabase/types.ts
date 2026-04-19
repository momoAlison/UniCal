/**
 * Auto-generated Supabase TypeScript types.
 * Run `npx supabase gen types typescript --project-id <id>` to regenerate
 * once the project is linked. For now this provides a typed scaffold.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type EventStatus = "pending" | "completed" | "cancelled";

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    streak_days: number;
                    unicorn_level: number;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    streak_days?: number;
                    unicorn_level?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    streak_days?: number;
                    unicorn_level?: number;
                };
            };
            events: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string | null;
                    /** ISO 8601 UTC string stored as timestamptz */
                    start_time: string;
                    /** ISO 8601 UTC string stored as timestamptz */
                    end_time: string;
                    /** IANA timezone of the user at time of creation */
                    timezone: string;
                    is_ai_task: boolean;
                    status: EventStatus;
                    google_event_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description?: string | null;
                    start_time: string;
                    end_time: string;
                    timezone: string;
                    is_ai_task?: boolean;
                    status?: EventStatus;
                    google_event_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string | null;
                    start_time?: string;
                    end_time?: string;
                    timezone?: string;
                    is_ai_task?: boolean;
                    status?: EventStatus;
                    google_event_id?: string | null;
                };
            };
            trophies: {
                Row: {
                    id: string;
                    user_id: string;
                    trophy_type: string;
                    unlocked_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    trophy_type: string;
                    unlocked_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    trophy_type?: string;
                    unlocked_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            event_status: EventStatus;
        };
    };
}

/** Convenience row types */
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type TrophyRow = Database["public"]["Tables"]["trophies"]["Row"];
