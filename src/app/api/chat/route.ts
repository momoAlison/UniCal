import { anthropic } from "@ai-sdk/anthropic";
import {
    streamText,
    tool,
    zodSchema,
    stepCountIs,
    createUIMessageStream,
    createUIMessageStreamResponse,
    convertToModelMessages,
    type UIMessage,
} from "ai";
import { z } from "zod";

export const runtime = "edge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayOfWeek(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    const body = await req.json();
    const { messages, timezone, existingEvents } = body as {
        messages: UIMessage[];
        timezone?: string;
        existingEvents?: Array<{ title: string; start: string; end: string }>;
    };

    // Rule 3: Inject current UTC time + user timezone into System Prompt
    const currentDateTime = new Date().toISOString(); // e.g. "2026-04-19T00:55:00Z"
    const currentDayOfWeek = getDayOfWeek(new Date());
    const userTimezone = timezone ?? "UTC";

    // Build existing events context for conflict avoidance
    // Format times in user's local timezone so the AI can reason about them naturally
    const formatForAI = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("en-US", {
                timeZone: userTimezone,
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        } catch {
            return iso;
        }
    };

    // Pre-compute free slots per day to give AI a clear picture of availability
    // Group blocked events by local date
    const blockedByDay: Record<string, Array<{ start: number; end: number; title: string }>> = {};
    if (existingEvents && existingEvents.length > 0) {
        for (const e of existingEvents) {
            const localDate = new Date(e.start).toLocaleDateString("en-US", { timeZone: userTimezone, weekday: "short", month: "short", day: "numeric" });
            if (!blockedByDay[localDate]) blockedByDay[localDate] = [];
            blockedByDay[localDate].push({
                start: new Date(e.start).getTime(),
                end: new Date(e.end).getTime(),
                title: e.title,
            });
        }
        // Sort each day's events by start time
        for (const day of Object.keys(blockedByDay)) {
            blockedByDay[day].sort((a, b) => a.start - b.start);
        }
    }

    // Build free-slot summary per day (working hours 07:00–20:00 local)
    // Use Intl to get the UTC offset for the user's timezone on a specific date,
    // then compute the correct UTC timestamps for 07:00 and 20:00 local time.
    const getLocalHourAsUtcMs = (localDateStr: string, localHour: number, tz: string): number => {
        // localDateStr is "YYYY-MM-DD" (en-CA format)
        // We want the UTC ms that corresponds to localHour:00 in tz
        const isoStr = `${localDateStr}T${String(localHour).padStart(2, "0")}:00:00`;
        // Use Intl to find the UTC offset at this moment in the given timezone
        const probe = new Date(isoStr + "Z"); // treat as UTC first
        const localParts = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            hour12: false,
        }).formatToParts(probe);
        const get = (type: string) => parseInt(localParts.find(p => p.type === type)?.value ?? "0");
        const localH = get("hour");
        const diffH = localHour - localH;
        return probe.getTime() + diffH * 3600000;
    };

    const freeSlotsPerDay = Object.entries(blockedByDay).map(([day, blocked]) => {
        const refTs = blocked[0].start;
        const localDateStr = new Date(refTs).toLocaleDateString("en-CA", { timeZone: userTimezone });
        const dayStartMs = getLocalHourAsUtcMs(localDateStr, 7, userTimezone);
        const dayEndMs = getLocalHourAsUtcMs(localDateStr, 20, userTimezone);

        const freeSlots: string[] = [];
        let cursor = dayStartMs;
        for (const b of blocked) {
            if (b.start > cursor + 15 * 60000) { // at least 15 min gap
                const freeStart = new Date(cursor).toLocaleTimeString("en-US", { timeZone: userTimezone, hour: "2-digit", minute: "2-digit", hour12: false });
                const freeEnd = new Date(b.start).toLocaleTimeString("en-US", { timeZone: userTimezone, hour: "2-digit", minute: "2-digit", hour12: false });
                freeSlots.push(`${freeStart}–${freeEnd}`);
            }
            if (b.end > cursor) cursor = b.end;
        }
        if (dayEndMs > cursor + 15 * 60000) {
            const freeStart = new Date(cursor).toLocaleTimeString("en-US", { timeZone: userTimezone, hour: "2-digit", minute: "2-digit", hour12: false });
            freeSlots.push(`${freeStart}–20:00`);
        }
        return `  ${day}: FREE [${freeSlots.join(", ") || "no free slots"}]  |  BLOCKED [${blocked.map(b => {
            const s = new Date(b.start).toLocaleTimeString("en-US", { timeZone: userTimezone, hour: "2-digit", minute: "2-digit", hour12: false });
            const e2 = new Date(b.end).toLocaleTimeString("en-US", { timeZone: userTimezone, hour: "2-digit", minute: "2-digit", hour12: false });
            return `${s}–${e2} (${b.title})`;
        }).join(", ")}]`;
    }).join("\n");

    // Also build a raw blocked-events list for the thinking section (more explicit for CoT)
    const rawBlockedList = existingEvents && existingEvents.length > 0
        ? existingEvents.map(e =>
            `  - ${formatForAI(e.start)} → ${formatForAI(e.end)}  [${e.title}]`
        ).join("\n")
        : "  (none)";

    const existingEventsContext = existingEvents && existingEvents.length > 0
        ? `\n\n## Calendar Availability (next 14 days, local time: ${userTimezone})\n` +
        `The table below shows FREE and BLOCKED slots per day. You MUST only schedule in FREE slots.\n\n` +
        freeSlotsPerDay +
        `\n\n### Raw blocked events (for reference during your thinking step):\n` +
        rawBlockedList
        : "\n\n## Calendar Availability\n  No existing events found — all time slots are free.";

    const systemPrompt = `You are UniCal, an elite AI calendar assistant built into the UniCal AI app.

## System Context (injected at request time — treat as ground truth)
- Current UTC Time: ${currentDateTime}
- Current Day of Week: ${currentDayOfWeek}
- User's Local Timezone: ${userTimezone}${existingEventsContext}

## Your Role
Help users plan, schedule, and manage their time. You are proactive, friendly, and concise.
When a user describes a scheduling request, use the \`create_plan\` tool to propose a conflict-free plan.

## MANDATORY: Think Before You Schedule
Before calling create_plan, you MUST reason through the schedule step by step using this exact process:

<thinking>
For each day I want to schedule an event:
1. What day is this? (e.g., "Mon, Apr 28")
2. What are the BLOCKED slots on this day? (list them from the Calendar Availability section above)
3. What FREE slots are available on this day? (list them)
4. Does my proposed event (start → end) fit entirely within a FREE slot?
   - If YES → proceed with this time.
   - If NO → pick a different FREE slot that fits the required duration.
5. Verify: does the chosen slot overlap with ANY blocked event? If yes, go back to step 4.
6. Only after ALL events pass this check, call create_plan.
</thinking>

You must perform this thinking for EVERY event in the plan. Do not skip any day.

## Concrete Example
User wants 2-hour focus blocks Mon–Fri. 
Mon Apr 28 has: BLOCKED [10:00–10:30 (Standup), 12:00–13:00 (Lunch)]
FREE slots on Mon: [07:00–10:00, 10:30–12:00, 13:00–20:00]

Thinking for Mon:
- I want to place a 2-hour block.
- Option A: 07:00–09:00 → fits in FREE 07:00–10:00 ✅
- Option B: 09:00–11:00 → overlaps BLOCKED 10:00–10:30 ❌ REJECT
- Option C: 10:30–12:00 → only 1.5h, not enough for 2h ❌ REJECT  
- Option D: 13:00–15:00 → fits in FREE 13:00–20:00 ✅
→ Choose 07:00–09:00 or 13:00–15:00.

## Strict Rules
1. All \`start_time\` and \`end_time\` values in tool calls MUST be ISO 8601 UTC strings ending in "Z" (e.g. "2026-04-21T08:00:00Z").
2. NEVER output "duration" — always output precise start_time and end_time.
3. Use the injected current UTC time above as the baseline for resolving relative expressions like "tomorrow", "next Tuesday", "in 3 days", etc.
4. Always include the user's timezone ("${userTimezone}") in the \`timezone\` field of each event.
5. Set \`is_fixed: false\` for AI-generated tasks; \`is_fixed: true\` only for fixed appointments the user explicitly states.
6. CONFLICT HANDLING: If a day has no free slot large enough for the full duration, you have two options:
   a) If there is ANY free time on that day (even partial), include the event at the best available slot (even if it overlaps) and mark it as a conflict in your text reply.
   b) Only skip a day entirely if it has ZERO free time (e.g., a full-day holiday with no gaps at all).
   The goal is to always show the user a complete plan — they can adjust conflicts manually.
7. Honor the user's requested duration exactly (e.g., "2 hours" means end_time = start_time + 2h, no exceptions).
8. Keep your text reply concise — 1–3 sentences max. The thinking happens internally before the tool call.
9. REVISION RULE: When the user asks to adjust, move, or modify any event from a previous plan, ALWAYS call create_plan with the COMPLETE revised plan (all events, not just the changed one). This allows the user to confirm and apply the entire updated schedule in one action.
10. CONTEXT RULE: When generating a revised plan, only include events that belong to the CURRENT scheduling request. Do NOT include events from previous, unrelated scheduling requests that the user has already confirmed. Each create_plan call should be self-contained for the current task only.`;

    // Convert UIMessages → ModelMessages for streamText
    const modelMessages = await convertToModelMessages(messages);

    const stream = createUIMessageStream({
        execute: async ({ writer }) => {
            const result = streamText({
                model: anthropic("claude-opus-4-5"),
                system: systemPrompt,
                messages: modelMessages,
                tools: {
                    /**
                     * create_plan — called when the AI has a concrete schedule to propose.
                     * Schema strictly follows PROJECT_SPEC.md §Rule 2.
                     * No execute() — the frontend handles the tool result via toolInvocations.
                     */
                    create_plan: tool({
                        description:
                            "Propose a structured calendar plan to the user. Call this when you have concrete start/end times ready. Each event must have an ISO 8601 UTC start_time and end_time.",
                        inputSchema: zodSchema(
                            z.object({
                                events: z
                                    .array(
                                        z.object({
                                            title: z
                                                .string()
                                                .describe("Short, clear event title"),
                                            start_time: z
                                                .string()
                                                .describe(
                                                    "ISO 8601 UTC start time, e.g. '2026-04-21T08:00:00Z'"
                                                ),
                                            end_time: z
                                                .string()
                                                .describe(
                                                    "ISO 8601 UTC end time, e.g. '2026-04-21T08:30:00Z'"
                                                ),
                                            timezone: z
                                                .string()
                                                .describe(
                                                    "IANA timezone of the user, e.g. 'Europe/Stockholm'"
                                                ),
                                            is_fixed: z
                                                .boolean()
                                                .describe(
                                                    "false = AI-generated task; true = fixed appointment"
                                                ),
                                        })
                                    )
                                    .min(1)
                                    .describe("List of events to add to the calendar"),
                            })
                        ),
                        // Return a synthetic tool result so the AI can continue the conversation
                        execute: async ({ events }) => {
                            return {
                                success: true,
                                count: events.length,
                                message: `Plan with ${events.length} event(s) has been presented to the user for review.`,
                            };
                        },
                    }),
                },
                stopWhen: stepCountIs(3),
            });

            writer.merge(result.toUIMessageStream());
        },
    });

    return createUIMessageStreamResponse({ stream });
}
