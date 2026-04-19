import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

/**
 * OAuth callback handler.
 * Supabase redirects here after Google OAuth completes.
 * Exchanges the `code` for a session and redirects to the app.
 *
 * IMPORTANT: We also persist the provider_token (Google access token) into
 * the `user_google_tokens` table so it survives page reloads.
 * Supabase SSR does NOT store provider_token in cookies across requests —
 * it is only available immediately after exchangeCodeForSession().
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    // ── Persist Google provider_token to DB ───────────────────────────────────
    // provider_token is only available right here, immediately after exchange.
    // We store it in a dedicated table so /api/google-calendar can retrieve it later.
    const providerToken = data.session.provider_token;
    const providerRefreshToken = data.session.provider_refresh_token;
    const userId = data.session.user.id;

    if (providerToken) {
        console.log("[UniCal] OAuth callback: provider_token received, persisting to DB for user", userId);

        // Use the service-role key so we bypass RLS for this server-side write
        const { createClient: createServiceClient } = await import("@supabase/supabase-js");
        const adminClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: upsertError } = await adminClient
            .from("user_google_tokens")
            .upsert({
                user_id: userId,
                access_token: providerToken,
                refresh_token: providerRefreshToken ?? null,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

        if (upsertError) {
            console.error("[UniCal] Failed to persist Google token:", upsertError.message);
        } else {
            console.log("[UniCal] Google token persisted successfully.");
        }
    } else {
        console.warn("[UniCal] OAuth callback: NO provider_token in session. Calendar sync will not work.");
        console.warn("[UniCal] Make sure 'calendar' scope is requested and Google OAuth is configured in Supabase.");
    }

    return NextResponse.redirect(`${origin}${next}`);
}
