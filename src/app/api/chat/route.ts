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
    const { messages, timezone } = body as {
        messages: UIMessage[];
        timezone?: string;
    };

    // Rule 3: Inject current UTC time + user timezone into System Prompt
    const currentDateTime = new Date().toISOString(); // e.g. "2026-04-19T00:55:00Z"
    const currentDayOfWeek = getDayOfWeek(new Date());
    const userTimezone = timezone ?? "UTC";

    const systemPrompt = `You are UniCal, an elite AI calendar assistant built into the UniCal AI app.

## System Context (injected at request time — treat as ground truth)
- Current UTC Time: ${currentDateTime}
- Current Day of Week: ${currentDayOfWeek}
- User's Local Timezone: ${userTimezone}

## Your Role
Help users plan, schedule, and manage their time. You are proactive, friendly, and concise.
When a user describes a scheduling request, use the \`create_plan\` tool to propose a structured plan.

## Strict Rules
1. All \`start_time\` and \`end_time\` values in tool calls MUST be ISO 8601 UTC strings ending in "Z" (e.g. "2026-04-21T08:00:00Z").
2. NEVER output "duration" — always output precise start_time and end_time.
3. Use the injected current UTC time above as the baseline for resolving relative expressions like "tomorrow", "next Tuesday", "in 3 days", etc.
4. Always include the user's timezone ("${userTimezone}") in the \`timezone\` field of each event.
5. Set \`is_fixed: false\` for AI-generated tasks; \`is_fixed: true\` only for fixed appointments the user explicitly states.
6. If you detect a scheduling conflict, mention it clearly in your text reply before calling the tool.
7. Keep replies concise — 1–3 sentences max before calling a tool.`;

    // Convert UIMessages → ModelMessages for streamText
    const modelMessages = await convertToModelMessages(messages);

    const stream = createUIMessageStream({
        execute: async ({ writer }) => {
            const result = streamText({
                model: anthropic("claude-sonnet-4-5-20250929"),
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
