# T3 Chat

T3 Chat is a simple AI chat application built with Next.js. It lets users sign in, pick an AI model, and start chatting in a clean chat interface.

## What it does

- Authenticates users with GitHub through Better Auth.
- Lets users choose an AI model from OpenRouter.
- Streams AI responses in real time for a smoother chat experience.
- Sends messages to the AI and shows responses in the chat UI.
- Saves chat history in PostgreSQL through Prisma.
- Supports a responsive sidebar and mobile-friendly layout.

## How it works

- The app loads the user session and chat history on the server.
- Messages are sent to the `/api/chat` route.
- The AI response is streamed back into the conversation using the AI SDK.
- Chat data is stored in the database so conversations can be reopened later.

## Important Tech Used

- Server actions and route handlers for chat and auth flows
- AI SDK streaming for real-time message generation
- OpenRouter model integration
- Prisma ORM with PostgreSQL / Neon
- Better Auth for GitHub login
- Zustand for chat UI state
- shadcn/ui and Tailwind CSS for the interface

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL / Neon
- Better Auth
- AI SDK + OpenRouter
- Tailwind CSS
- shadcn/ui