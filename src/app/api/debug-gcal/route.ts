import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/debug-gcal
 * Directly calls Google Calendar API and returns raw result.
 * REMOVE THIS BEFORE PRODUCTION.
 */
export async function GET() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    const { data: { user } } = await supabase.auth.getUser();
    const { data: { session } } = await supabase.auth.getSession();

    if (!user) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const accessToken = session?.provider_token ?? null;

    if (!accessToken) {
        return NextResponse.json({
            error: "provider_token is null in this request context",
            hint: "The token exists in the browser session but may not be passed to this server route. Try signing out and back in.",
        }, { status: 403 });
    }

    // Try calling Google Calendar API
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const gcalRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&maxResults=5`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const gcalData = await gcalRes.json();

    return NextResponse.json({
        provider_token_present: true,
        provider_token_prefix: accessToken.slice(0, 20) + "...",
        gcal_status: gcalRes.status,
        gcal_ok: gcalRes.ok,
        gcal_response: gcalData,
    });
}
