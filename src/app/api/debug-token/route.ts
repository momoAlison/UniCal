import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/debug-token
 * Diagnostic endpoint — shows what tokens are available for the current user.
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

    // Check DB for stored token
    const adminClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: tokenRow, error: tokenError } = await adminClient
        .from("user_google_tokens")
        .select("access_token, refresh_token, updated_at")
        .eq("user_id", user.id)
        .single();

    return NextResponse.json({
        user_id: user.id,
        email: user.email,
        session_provider_token: session?.provider_token ? "✅ present" : "❌ null",
        session_provider_refresh_token: session?.provider_refresh_token ? "✅ present" : "❌ null",
        db_token_row: tokenRow
            ? {
                access_token: tokenRow.access_token ? `✅ ${tokenRow.access_token.slice(0, 20)}...` : "❌ null",
                refresh_token: tokenRow.refresh_token ? "✅ present" : "❌ null",
                updated_at: tokenRow.updated_at,
            }
            : null,
        db_token_error: tokenError?.message ?? null,
    });
}
