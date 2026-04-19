import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

// Typed Supabase client helper
type SupabaseClient = ReturnType<typeof createServerClient<Database>>;

// ─── POST /api/events ─────────────────────────────────────────────────────────
// Insert one or more events into the Supabase events table.
// Body: { events: Array<{ title, start_time, end_time, timezone, is_ai_task }> }

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { events } = body as {
        events: {
            title: string;
            start_time: string;
            end_time: string;
            timezone: string;
            is_ai_task: boolean;
            description?: string;
        }[];
    };

    if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json({ error: "No events provided" }, { status: 400 });
    }

    const rows = events.map(ev => ({
        user_id: user.id,
        title: ev.title,
        description: ev.description ?? null,
        start_time: ev.start_time,
        end_time: ev.end_time,
        timezone: ev.timezone,
        is_ai_task: ev.is_ai_task,
        status: "pending" as const,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("events")
        .insert(rows)
        .select();

    if (error) {
        console.error("[UniCal] Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inserted: data?.length ?? 0, events: data });
}

// ─── PATCH /api/events ────────────────────────────────────────────────────────
// Update event status (e.g. pending → completed)
// Body: { id: string, status: "pending" | "completed" | "cancelled" }

export async function PATCH(req: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json() as { id: string; status: "pending" | "completed" | "cancelled" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("events")
        .update({ status })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data });
}

// ─── GET /api/events ──────────────────────────────────────────────────────────
// Fetch all events for the authenticated user (for calendar hydration on load)

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("start_time", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data });
}
