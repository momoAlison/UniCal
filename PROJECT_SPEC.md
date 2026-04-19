# 🦄 UniCal AI - Technical Architecture & Implementation Document (Tech Spec)

**To Claude (AI Assistant):**
You are assuming the role of a Senior Full-Stack Engineer. Your objective is to build "UniCal AI," a calendar and goal-management web application, from scratch based on the following technical document. Please strictly adhere to the designated tech stack and architectural design outlined below.

---

### 1. Core Technology Stack (The Stack)
* **Frontend Framework:** Next.js 14+ (App Router), React, TypeScript
* **Styling & UI:** Tailwind CSS, Shadcn UI (for rapid, high-quality component composition), Framer Motion (for fluid UI interactions and unicorn animations)
* **Backend & Database:** Supabase (PostgreSQL Database + Auth + Row Level Security policies)
* **AI Layer:** Vercel AI SDK (`ai` and `@ai-sdk/openai` or `@ai-sdk/anthropic`), utilizing LLM Tool Calling capabilities.
* **Deployment:** Vercel

---

### 2. Database Design (Supabase PostgreSQL Schema)
Please design the following core table structures in Supabase:

* **`users` table** (Extending `auth.users`):
    * `id`: UUID (Primary Key)
    * `email`: String
    * `streak_days`: Integer (Default 0, tracks consecutive login/completion days)
    * `unicorn_level`: Integer (Default 1, tracks the evolutionary level of the user's unicorn avatar)
* **`events` table** (Unified storage for all schedules and tasks):
    * `id`: UUID (Primary Key)
    * `user_id`: UUID (Foreign Key -> `users.id`)
    * `title`: String (Task/Event title)
    * `description`: Text (Optional, details or AI suggestions)
    * `start_time`: `timestamptz` (Timestamp with timezone)
    * `end_time`: `timestamptz` (Timestamp with timezone)
    * `is_ai_task`: Boolean (Differentiates between dynamic AI-generated tasks [True] and fixed schedules [False])
    * `status`: Enum (`'pending'`, `'completed'`, `'cancelled'`)
    * `google_event_id`: String (Optional, for Google Calendar synchronization)
* **`trophies` table** (Gamification and achievements):
    * `id`: UUID (Primary Key)
    * `user_id`: UUID (Foreign Key -> `users.id`)
    * `trophy_type`: String (e.g., `'early_bird'`, `'focus_master'`)
    * `unlocked_at`: `timestamptz`

---

### 3. Core Implementation Logic

#### 3.1 Authentication & Google Calendar Authorization
Utilize Supabase Auth for OAuth login.
* **Crucial Requirement:** During Google OAuth login, you must request the `https://www.googleapis.com/auth/calendar` scope. This is mandatory for syncing fixed schedules to the local database and pushing local tasks to Google Calendar.

#### 3.2 Chatbox Central (AI Conversation & Plan Generation)
Build the frontend conversational interface using the `useChat` hook from the Vercel AI SDK.
* **API Route Design (`/api/chat/route.ts`):** Implement LLM Tool Calling. Define the following Tools for the AI to invoke:
    * `check_availability(date_range)`: Queries the database for the user's existing events within a specific timeframe.
    * `create_plan(tasks: [{title, start_time, end_time}])`: Triggered when the user confirms a proposed plan. The Next.js backend parses the arguments and writes them to the `events` table.
    * `update_event(event_id, new_start_time, new_end_time)`: Used for real-time AI assistance in modifying the schedule.

#### 3.3 Conflict Resolver
* **Logic Flow:**
    1. User inputs a scheduling request.
    2. AI calls `check_availability` to retrieve the current schedule.
    3. If the newly generated `start_time` & `end_time` overlap with existing events, the AI **does not** immediately call `create_plan`.
    4. Instead, the AI replies with text: *"Conflict detected: [Original Event] overlaps with the proposed [New Plan]. I recommend moving the new plan to [Suggested Time]. Or would you prefer to force-insert it?"*
    5. The frontend utilizes `toolInvocations` from the Vercel AI SDK to render a custom UI Card, allowing the user to either "Accept Suggestion" or "Force Insert".

#### 3.4 Gamification (Frontend Representation)
* **Logic:** When an event's `status` changes to `completed`, trigger a callback to evaluate the Streak conditions.
* **Animation:** Use Framer Motion to execute a full-screen confetti animation and/or a unicorn evolution sequence.

---

### 4. The 3 Golden Rules of Timezone Handling
Handling time is the most critical aspect of a calendar application. To prevent AI hallucinations and synchronization errors, strictly adhere to the following rules:

#### Rule 1: The Absolute Standard (ISO 8601 & UTC)
Always use the ISO 8601 format and standardize on UTC (Zero Timezone) for database storage and JSON payloads sent to the AI. Only convert to the user's local timezone on the frontend UI.
*(Example: `2026-04-18T15:35:30Z` — the `Z` denotes Zulu/UTC time).*

#### Rule 2: JSON Schema Structure for AI Interaction
When using Vercel AI SDK Tool Calling, define a flat, explicit structure for time data. **Do not** ask the AI to output "duration" (which requires secondary calculation); only use precise `start_time` and `end_time`.

```json
{
  "events": [
    {
      "title": "Flight to Stockholm",
      "start_time": "2026-04-21T08:00:00Z", 
      "end_time": "2026-04-21T10:30:00Z",
      "timezone": "Europe/Stockholm",
      "is_fixed": true
    },
    {
      "title": "Learn Python (AI Task)",
      "start_time": "2026-04-21T14:00:00Z",
      "end_time": "2026-04-21T16:00:00Z",
      "timezone": "Europe/Stockholm",
      "is_fixed": false
    }
  ]
}
```

#### Rule 3: Dynamic Context Injection (System Prompt)
LLMs have no inherent concept of current time. When querying the AI, you must dynamically inject the exact current time and the user's timezone into the System Prompt at the `/api/chat` route level.

```typescript
// System Prompt Injection Example
const currentUserTimezone = "Europe/Stockholm";
const currentDateTime = new Date().toISOString(); // e.g., "2026-04-18T15:35:30Z"
const currentDayOfWeek = "Saturday";

const systemPrompt = `
You are an elite AI Calendar Assistant named UniCal.
System Context:
- Current UTC Time: ${currentDateTime}
- Current Day of Week: ${currentDayOfWeek}
- User's Local Timezone: ${currentUserTimezone}

Strictly use this context as the baseline for all scheduling logic. 
All time data passed into Tool Calls MUST be in standard ISO 8601 UTC format (ending in Z).
`;
```

#### Rule 4: Database Configuration (`timestamptz`)
In Supabase, `start_time` and `end_time` columns **must** use the `timestamp with time zone` (`timestamptz`) data type. This ensures PostgreSQL correctly parses and stores Next.js UTC strings, eliminating cross-timezone offset errors.

**Architecture Flow Summary:**
`Frontend (User Input)` ➔ `Next.js API (Injects UTC Time & Timezone)` ➔ `Claude LLM (Calculates & returns ISO 8601 UTC via Tool Call)` ➔ `Supabase (Stores as timestamptz)` ➔ `Frontend (Fetches UTC, formats to local browser time for UI)`.

---

### 5. Phased Development Plan
Development must proceed strictly through these 4 phases. Each phase requires testing and validation before advancing.

* **Phase 1: Infrastructure & UI Skeleton**
    * Initialize the Next.js + Tailwind + Shadcn UI project.
    * Build the global layout: a static UI featuring a left-side/floating Chatbox and a right-side Calendar view.
    * Configure the Supabase connection and execute the database Schema.
* **Phase 2: Calendar Basics (CRUD) & OAuth**
    * Implement Supabase Google OAuth login.
    * Render `events` data from the database onto the calendar view. Apply distinct visual styling to differentiate Fixed schedules from AI Tasks.
* **Phase 3: Core AI Integration (Vercel AI SDK)**
    * Develop the `/api/chat` route and connect the LLM.
    * Implement Tool Calling: empower the AI to query user schedules (mock or real DB) and generate a JSON stream containing `title`, `start_time`, and `end_time`.
    * Implement "One-Click to Calendar": Save the AI-generated plan directly to the Supabase `events` table.
* **Phase 4: Conflict Resolution, Sync, & Gamification**
    * Refine the AI's prompts to enable overlapping time analysis (Conflict Resolution).
    * Implement genuine two-way synchronization via the Google Calendar API.
    * Integrate the Streak counting logic and basic Framer Motion unicorn UI feedback.

## 🚨 Core Specification: Timezone & Date Handling

Handling dates and times incorrectly is the most common source of bugs in calendar applications. To ensure accuracy across the frontend, the AI model, and the database, all time-related data must adhere to the following strict guidelines.

### 1. The Absolute Standard: ISO 8601 & UTC Only
Whether storing data in the database or passing JSON payloads to the AI model, **always use the ISO 8601 format and enforce UTC (Zero Timezone) at the backend and database levels.** Time data should only be converted to the user's local timezone on the frontend (client-side) immediately before rendering the UI.

* **ISO 8601 Example:** `2026-04-18T14:47:56Z`
    *(The trailing `Z` stands for Zulu time, indicating UTC).*

### 2. JSON Schema for AI Interaction (Tool Calling)
When utilizing the Vercel AI SDK's Tool Calling feature, define a flat, explicit JSON Schema for the AI to follow. Use the following structure for passing and receiving time data:

```json
{
  "events": [
    {
      "title": "Flight to Stockholm",
      "start_time": "2026-04-21T08:00:00Z", 
      "end_time": "2026-04-21T10:30:00Z",
      "timezone": "Europe/Stockholm", // Record the local timezone of the event
      "is_fixed": true
    },
    {
      "title": "Python Study (AI Task)",
      "start_time": "2026-04-21T14:00:00Z",
      "end_time": "2026-04-21T16:00:00Z",
      "timezone": "Europe/Stockholm",
      "is_fixed": false
    }
  ]
}
```
**Crucial Rule:** Instruct the AI to output only precise `start_time` and `end_time` values. **Do not** ask it to output "duration". Forcing the AI to perform secondary time calculations drastically increases the probability of logical hallucinations.

### 3. Mandatory AI Context: System Prompt Injection
Large Language Models have no inherent concept of current time. If a user says "schedule this for tomorrow afternoon," the AI cannot resolve "tomorrow" without external context.

In your `/api/chat` route, you **must** dynamically inject the exact current time and the user's timezone into the System Prompt:

```typescript
// Example Implementation
const currentUserTimezone = "Europe/Stockholm"; 
const currentDateTime = new Date().toISOString(); // e.g., "2026-04-18T14:47:56Z"
const currentDayOfWeek = "Saturday";

const systemPrompt = `
You are an elite AI calendar assistant named UniCal.
Current system context:
- Current UTC Time: ${currentDateTime}
- Current Day of Week: ${currentDayOfWeek}
- User's Local Timezone: ${currentUserTimezone}

When processing scheduling requests, strictly base your calculations on this timezone and current time.
All time parameters passed into Tool Calls MUST be formatted as standard ISO 8601 UTC strings ending in 'Z'.
`;
```

### 4. Database Schema (Supabase / PostgreSQL)
When defining the `events` table in Supabase, any time-related column must be set to `timestamp with time zone` (shorthand: `timestamptz`), not a standard `timestamp`.

```sql
-- Database Column Definition
start_time timestamptz NOT NULL,
end_time timestamptz NOT NULL,
```
By enforcing this schema, when the Next.js backend writes an ISO 8601 string containing `Z` (UTC) to the database, PostgreSQL will automatically parse and store it correctly, eliminating cross-timezone offset errors.

### Summary: The Architecture Data Flow
1.  **Frontend (User Input):** User says, "Meeting tomorrow at 2 PM."
2.  **Next.js (API Route):** Captures the current UTC time and the user's local timezone, injects them into the System Prompt, and sends the payload to Claude.
3.  **Claude (AI Model):** Calculates exactly what "tomorrow at 2 PM" is in UTC, formats it as an ISO 8601 string, and returns it via a JSON Tool Call.
4.  **Supabase (Database):** Receives the UTC string and securely stores it in a `timestamptz` column.
5.  **Frontend (UI Render):** Fetches the UTC time from the database and uses the browser's native Date API (or a library like date-fns) to format and display it in the user's local time on the calendar grid.