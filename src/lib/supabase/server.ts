import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server-side Supabase client.
 * Use this in Server Components, Route Handlers, and Server Actions.
 * Reads/writes cookies via next/headers so the session is always fresh.
 */
export function createClient() {
    const cookieStore = cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // setAll is called from a Server Component — cookies can only
                        // be mutated in middleware or Route Handlers. Safe to ignore here.
                    }
                },
            },
        }
    );
}
