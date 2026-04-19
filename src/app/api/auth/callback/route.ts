import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback handler.
 * Supabase redirects here after Google OAuth completes.
 * Exchanges the `code` for a session and redirects to the app.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // `next` lets us redirect to a specific page after login (optional)
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Something went wrong — redirect to login with an error hint
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
