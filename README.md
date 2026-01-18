# BrainStorm Cafe

An AI-powered brainstorming workspace with interactive voice mode, real-time document collaboration, and multi-agent coordination.

## Features

- **Multi-Provider Voice Integration**: Choose between OpenAI Realtime API, ElevenLabs Conversational AI, or Web Speech API
- **Real-time Document Collaboration**: Live markdown editing with automatic version control
- **Multi-Agent System**: Discussion, Document, and Research agents working together
- **Model-Agnostic AI**: Switch between OpenAI GPT-4, Claude, and other models seamlessly
- **Version Timeline**: Scrub through document history and view diffs
- **Interactive Voice**: Natural conversation with interruption support

## Architecture

```
┌─────────────┬──────────────────────────┬─────────────────┐
│   Config    │      Discussion          │    Documents    │
│   Panel     │      Panel (Voice)       │    Panel        │
│             │                          │                 │
│ - Voices    │  ┌──────────────────┐   │  ┌───────────┐  │
│ - Templates │  │  Transcript      │   │  │ spec.md   │  │
│ - AI Models │  │  Display         │   │  │           │  │
│             │  └──────────────────┘   │  │ [Live     │  │
│             │                          │  │  Edit]    │  │
│             │  [Voice Controls]        │  └───────────┘  │
│             │  [Interrupt Button]      │                 │
│             │                          │  Version        │
│             │  ┌──────────────────┐   │  Timeline       │
│             │  │ Research Agents  │   │  [=====●====]   │
│             │  │ ● Agent 1: Done  │   │                 │
│             │  │ ○ Agent 2: Work  │   │  [Diff View]    │
│             │  │ [Inject Findings]│   │                 │
│             │  └──────────────────┘   │                 │
└─────────────┴──────────────────────────┴─────────────────┘
```

## Technology Stack

### Frontend
- Next.js 14+ (App Router) with TypeScript
- React 18 + shadcn/ui + Tailwind CSS
- Zustand (UI state) + React Query (server state)
- Socket.io client

### Backend
- Node.js with Express + TypeScript
- Socket.io server
- PostgreSQL with Prisma ORM
- Redis with BullMQ

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker and Docker Compose

## Quick Start

1. **Clone and install dependencies**
   ```bash
   pnpm install
   ```

2. **Start infrastructure services**
   ```bash
   pnpm docker:up
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

5. **Start development servers**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Project Structure

```
brainstorm-cafe/
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Express backend
├── packages/
│   └── shared/       # Shared types and utilities
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Development Commands

```bash
# Development
pnpm dev              # Run all services in parallel
pnpm dev:web          # Run only frontend
pnpm dev:server       # Run only backend

# Database
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Prisma Studio

# Docker
pnpm docker:up        # Start PostgreSQL and Redis
pnpm docker:down      # Stop all containers

# Build
pnpm build            # Build all packages
pnpm build:web        # Build frontend
pnpm build:server     # Build backend

# Utilities
pnpm lint             # Lint all packages
pnpm type-check       # Type check all packages
pnpm clean            # Clean all build artifacts
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: At least one AI provider

Optional:
- `ELEVENLABS_API_KEY`: For ElevenLabs voice service
- `TAVILY_API_KEY`: For web search in research agents

## License

MIT
