# 🦄 UniCal AI

> Your AI-powered, Chat-First calendar and goal management assistant.

🚀 **Built with passion during the 2025 Buildathon\!**

## 📖 Overview

**UniCal AI** reimagines how we manage our time. Instead of the traditional, tedious process of manually filling out calendar forms, UniCal introduces a **"Chat-First"** paradigm. Powered by state-of-the-art LLMs, your personal Unicorn AI assistant listens to your goals, breaks them down into actionable tasks, and intelligently schedules them into your free time—while automatically avoiding conflicts with your existing meetings.

Whether you are planning a 3-day trip, dedicating 10 hours to a research report, or just trying to maintain a daily morning run, UniCal AI makes scheduling feel like a conversation with a smart friend.

## ✨ Key Features

  * 💬 **Chat-First Scheduling:** Tell the AI what you want to achieve and your constraints. The AI generates a detailed plan and visualizes it instantly.
  * ⚡ **One-Click to Calendar:** Review the AI's proposed schedule and add all tasks to your timeline with a single click.
  * 🛡️ **Smart Conflict Resolver:** Seamlessly integrates with your fixed schedule (e.g., Google Calendar). If a new task overlaps with a meeting, the AI detects the conflict and suggests the optimal alternative slot.
  * 🎯 **Dynamic Goal Tracking:** Separates "Fixed Events" (meetings) from "AI Tasks" (actions). The dashboard tracks your daily task completion progress cleanly without the noise.
  * 🏆 **Gamification & Trophies:** Stay motivated with our built-in streak tracker and unlockable trophies in the "Trophy Room" as you crush your productivity milestones.

## 🛠️ Tech Stack

This project is built on the modern AI stack for maximum performance and reliability:

  * **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React, TypeScript
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Glassmorphism UI
  * **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
  * **Authentication:** Supabase Auth (Google OAuth + Calendar API scopes)
  * **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/docs) using Tool Calling
  * **LLM:** Anthropic Claude 3.5 Sonnet (for precise time calculation and JSON structuring)
  * **Deployment:** Vercel

## 🚀 Getting Started

Follow these steps to run UniCal AI locally:

**1. Clone the repository**

```bash
git clone https://github.com/YourUsername/unical-ai.git
cd unical-ai
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up Environment Variables**
Copy the template to create your local environment file:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials and Anthropic API key in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to meet your AI Unicorn\!

## 💡 About the Buildathon

UniCal AI was conceptualized and developed as a submission for the recent Buildathon. It was born out of the frustration with rigid calendar apps and the desire to create a proactive, empathetic, and intelligent time-management companion.

-----

*If you like this project, please consider giving it a ⭐\!*
