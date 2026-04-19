import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

// ─── Google Calendar API helpers ──────────────────────────────────────────────

const GCAL_BASE = "https://www.googleapis.com/calendar/v3";

interface GCalEvent {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
}

async function pushToGoogleCalendar(
    accessToken: string,
    events: GCalEvent[]
): Promise<{ id: string; htmlLink: string }[]> {
    const results: { id: string; htmlLink: string }[] = [];

    for (const ev of events) {
        const res = await fetch(`${GCAL_BASE}/calendars/primary/events`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ev),
        });

        if (!res.ok) {
            const err = await res.json();
            console.error("[UniCal] Google Calendar insert error:", err);
            continue;
        }

        const data = await res.json();
        results.push({ id: data.id, htmlLink: data.htmlLink });
    }

    return results;
}

// ─── POST /api/google-calendar ────────────────────────────────────────────────
// Push one or more UniCal events to the user's primary Google Calendar.
// Body: { events: Array<{ id, title, start_time, end_time, timezone, description? }> }

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

    // Get authenticated user + provider token
    // NOTE: getSession() alone does NOT return provider_token on the server side
    // because Supabase SSR only stores the Supabase JWT in cookies, not the raw
    // Google OAuth token. We must read it from the user's identity data instead.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized — please sign in with Google" }, { status: 401 });
    }

    // provider_token is stored in the session cookie by Supabase SSR
    // but getSession() is needed to retrieve it (getUser() doesn't expose it)
    const { data: { session } } = await supabase.auth.getSession();
    let accessToken: string | null = session?.provider_token ?? null;

    // Fallback for POST: also try DB token
    if (!accessToken) {
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const adminClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: tokenRow } = await adminClient
            .from("user_google_tokens")
            .select("access_token")
            .eq("user_id", user.id)
            .maybeSingle();
        accessToken = tokenRow?.access_token ?? null;
    }

    if (!accessToken) {
        return NextResponse.json(
            {
                error: "Google access token not available. Please sign out and sign in again to reconnect Google Calendar.",
                code: "PROVIDER_TOKEN_MISSING",
            },
            { status: 403 }
        );
    }

    const body = await req.json();
    const { events } = body as {
        events: {
            id?: string;
            title: string;
            start_time: string;
            end_time: string;
            timezone: string;
            description?: string;
        }[];
    };

    if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json({ error: "No events provided" }, { status: 400 });
    }

    // Map to Google Calendar event format
    const gcalEvents: GCalEvent[] = events.map(ev => ({
        summary: ev.title,
        description: ev.description ?? "Created by UniCal AI",
        start: { dateTime: ev.start_time, timeZone: ev.timezone },
        end: { dateTime: ev.end_time, timeZone: ev.timezone },
    }));

    const pushed = await pushToGoogleCalendar(accessToken, gcalEvents);

    // Optionally update google_event_id in Supabase for each event
    for (let i = 0; i < pushed.length; i++) {
        const sourceId = events[i]?.id;
        if (sourceId && pushed[i]) {
            await supabase
                .from("events" as never)
                .update({ google_event_id: pushed[i].id } as never)
                .eq("id", sourceId)
                .eq("user_id", user.id);
        }
    }

    return NextResponse.json({
        pushed: pushed.length,
        events: pushed,
    });
}

// ─── GET /api/google-calendar ─────────────────────────────────────────────────
// Fetch upcoming events from the user's primary Google Calendar and return them.
// Reads the Google access token from the user_google_tokens table (persisted at
// OAuth callback time) so it works across page reloads.

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

    // Try session cookie first (available immediately after OAuth login)
    const { data: { session } } = await supabase.auth.getSession();
    let accessToken: string | null = session?.provider_token ?? null;

    console.log("[UniCal] GET /api/google-calendar — session provider_token:", accessToken ? "✅ present" : "❌ null");

    // Fallback: read from user_google_tokens table (persisted at OAuth callback)
    if (!accessToken) {
        console.log("[UniCal] Falling back to DB token lookup for user", user.id);
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const adminClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        // Use maybeSingle() instead of single() to avoid "Cannot coerce to single JSON object" error
        // when there are 0 rows (single() throws on 0 rows, maybeSingle() returns null)
        const { data: tokenRow, error: tokenErr } = await adminClient
            .from("user_google_tokens")
            .select("access_token")
            .eq("user_id", user.id)
            .maybeSingle();

        if (tokenErr) {
            console.warn("[UniCal] DB token lookup error:", tokenErr.message);
        } else {
            accessToken = tokenRow?.access_token ?? null;
            console.log("[UniCal] DB token lookup:", accessToken ? "✅ found" : "❌ not found (no row)");
        }
    }

    if (!accessToken) {
        return NextResponse.json(
            {
                error: "Google Calendar not connected. Please sign out and sign in again with Google to grant Calendar access.",
                code: "PROVIDER_TOKEN_MISSING",
            },
            { status: 403 }
        );
    }

    // Fetch events from ALL user calendars (not just primary)
    // First get the list of calendars
    const calListRes = await fetch(
        `${GCAL_BASE}/users/me/calendarList?minAccessRole=reader`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    let calendarIds: string[] = ["primary"];
    if (calListRes.ok) {
        const calListData = await calListRes.json();
        calendarIds = (calListData.items ?? []).map((c: { id: string }) => c.id);
        console.log("[UniCal] Calendars found:", calendarIds.length, calendarIds.slice(0, 5));
    }

    // Fetch next 60 days of events from all calendars
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch from all calendars in parallel
    const allFetches = calendarIds.map(calId =>
        fetch(
            `${GCAL_BASE}/calendars/${encodeURIComponent(calId)}/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=50`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        ).then(r => r.ok ? r.json() : null).catch(() => null)
    );

    const allResults = await Promise.all(allFetches);
    const allItems = allResults.flatMap(r => r?.items ?? []);

    console.log("[UniCal] Total events fetched:", allItems.length);

    // Deduplicate by event id
    const seen = new Set<string>();
    const uniqueItems = allItems.filter((item: { id: string }) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });

    // Sort by start time
    uniqueItems.sort((a: { start?: { dateTime?: string; date?: string } }, b: { start?: { dateTime?: string; date?: string } }) => {
        const aTime = a.start?.dateTime ?? a.start?.date ?? "";
        const bTime = b.start?.dateTime ?? b.start?.date ?? "";
        return aTime.localeCompare(bTime);
    });

    const items = uniqueItems.map((item: {
        id: string;
        summary?: string;
        description?: string;
        start?: { dateTime?: string; date?: string; timeZone?: string };
        end?: { dateTime?: string; date?: string; timeZone?: string };
        htmlLink?: string;
    }) => ({
        google_event_id: item.id,
        title: item.summary ?? "(No title)",
        description: item.description ?? null,
        start_time: item.start?.dateTime ?? item.start?.date ?? "",
        end_time: item.end?.dateTime ?? item.end?.date ?? "",
        timezone: item.start?.timeZone ?? "UTC",
        html_link: item.htmlLink,
    }));

    return NextResponse.json({ events: items });
}
