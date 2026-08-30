# Mira

# Project Context
You are a Senior Frontend Engineer and UX Specialist focused on Gen Z products.
We are building "DreamUp", a gamified webapp helping young people plan major purchases.
Value Prop: "Financial organization speeds up your dreams."

# 1. Visual Identity (The Vibe)
The design must be "Juicy", playful, and modern.
- **References:** Discord, Duolingo, Bento Grids.
- **Style:** Glassmorphism (translucent cards), highly rounded corners (rounded-2xl/3xl), vibrant colors on a clean off-white background.
- **Typography:** Nunito or Poppins (Rounded and friendly).
- **Interactions:** Use Framer Motion for smooth transitions. Everything should feel "clickable" and responsive.

# 2. Core Features & User Flow

## A. Landing Page
- Hero Section with the value prop and a "Start Journey" CTA.
- Visuals: 3D or flat illustrations of young people achieving goals.

## B. Onboarding Wizard (The Setup)
A 5-step form with smooth sliding transitions.
1. **Identity:** Name, Age, Email.
2. **The Dream:** Input for the goal name (e.g., "PS5").
3. **The Cost:** Numeric input (Goal Value).
4. **The Income (Crucial):** Selection Card: "Allowance/Indirect" OR "Work/Own Income". *Save this tag for AI logic.*
5. **Avatar:** Selection of 1 out of 5 starting mascots.

## C. Main Dashboard (The Platform)
Layout based on a Bento Grid.
- **Goal Tracker:** Visual progress bar (Money Saved vs. Goal Cost).
- **Avatar Card:** Displays current mascot + Level + XP Bar.
- **Quick Actions:** "Add Savings" and "Consult Oracle".

## D. Feature: The Oracle (CUI - Conversational UI)
*This is the core feature.* A chat interface replacing the standard "Check Purchase" form.
- **UI:** Chat window (like WhatsApp/iMessage) but branded.
- **Behavior:**
  1. **Initiative:** The AI starts: "Hey [Name]! What are you thinking of buying and why?"
  2. **SMART Method:** The AI asks short, empathetic questions to understand Context, Necessity, and Price.
  3. **Analysis (The Brain):** It calculates `(Item Price / User Monthly Savings)` to find the delay.
  4. **Verdict:** Returns a card in the chat: "Approved", "Warning" or "Denied" with the calculated delay time.
  5. **Damage Control:** If the verdict is bad but the user insists, the AI gives advice (e.g., "Pay cash to get 5% off").

## E. Gamification System
- **Weekly Ranking:** A leaderboard resetting every 7 days. *Rule: Show XP only, NEVER monetary values.*
- **Avatar Shop:** A section to spend "DreamPoints" on accessories for the mascot.

# 3. Technical Architecture (Supabase & AI)

## Database Schema (Supabase)
Create the following tables:
- `profiles`: id, name, age, email, income_type, avatar_id, current_xp, weekly_xp, dream_points.
- `goals`: user_id, title, total_amount, current_amount.
- `transactions`: user_id, amount, type (deposit/expense), is_impulse (boolean).
- `shop_items`: id, name, type (skin/accessory), cost_points, image_url.
- `user_inventory`: user_id, item_id.
- `chat_sessions`: user_id, history (jsonb), created_at.

## Edge Functions (AI Logic)
Setup a Supabase Edge Function `oracle-chat` that uses OpenAI.
- **Input:** User message + User Context (Goal, Savings, Income Type).
- **System Prompt:** Act as a "Financial Buddy". Use Gen Z tone (respectful but casual). Perform math to calculate goal delay. Be empathetic.

# 4. Tech Stack Rules
- Framework: React + Vite.
- Styling: Tailwind CSS.
- Components: Shadcn/UI (Customized for the rounded/playful look).
- Icons: Lucide React.
- Animation: Framer Motion.
- State Management: TanStack Query.

**Execution Plan:**
Start by building the **Onboarding Wizard** and the **Main Dashboard Layout**. Once that is solid, we will implement the Oracle Chat logic.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mirabah.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81e6bb22-9e4e-4072-baa8-9acc66d2a7e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
