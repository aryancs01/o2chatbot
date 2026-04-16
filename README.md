# O2Chat (Built on t3-chat)

A modern, multi-modal AI assistant and sandbox application built with Next.js 16. It offers real-time conversational AI streaming, secure identity management, and an on-demand cloud IDE for UI generation.

## Features

- **Multi-Modal AI Chat**: Engage in fast, real-time streaming conversations using a variety of cutting-edge AI models routed through OpenRouter.
- **AI UI Sandbox (v0 Clone)**: Instantly generate, preview, and extract fully functional Tailwind UI components using Google's Gemini 2.5 Flash and E2B Code Interpreter cloud environments.
- **Secure Authentication**: Includes seamless GitHub OAuth and an elegant Email & Password flow, powered and protected by Better Auth.
- **Rate Limit Protection**: Built-in rolling memory architecture protects API limits, preventing spam across both Chat and Sandbox execution endpoints.
- **Database Persistence**: Your chat history, UI prompts, and model preferences are permanently stored securely via PostgreSQL and Prisma ORM.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **AI Engine**: Vercel AI SDK, OpenRouter, Google Gemini
- **Cloud Sandboxing**: E2B Code Interpreter
- **Database**: PostgreSQL (Neon), Prisma ORM
- **Auth**: Better Auth
- **Styling & Components**: Tailwind CSS, shadcn/ui, Zustand

## Local Setup

1. Install dependencies using `npm install`.
2. Configure your `.env` variables with required API keys (`OPENROUTER_API`, `GOOGLE_GENERATIVE_AI_API_KEY`, `E2B_API_KEY`, `DATABASE_URL`).
3. Push your database schema using `npx prisma db push`.
4. Run the development server with `npm run dev`.