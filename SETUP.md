# BrainStorm Cafe - Setup Guide

This guide will help you set up the BrainStorm Cafe development environment.

## Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with: `npm install -g pnpm`
- **Docker** and **Docker Compose** - [Download here](https://www.docker.com/products/docker-desktop/)

## Installation Steps

### 1. Install Dependencies

From the root of the project, run:

```bash
pnpm install
```

This will install all dependencies for the workspace (frontend, backend, and shared packages).

### 2. Start Infrastructure Services

Start PostgreSQL and Redis using Docker Compose:

```bash
pnpm docker:up
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

To verify they're running:
```bash
docker ps
```

You should see two containers:
- `brainstorm-postgres`
- `brainstorm-redis`

### 3. Set Up Environment Variables

The `.env` files have been created with default development values:

- `/apps/server/.env` - Backend environment variables
- `/apps/web/.env.local` - Frontend environment variables

**Important**: If you want to use AI features, you'll need to add your API keys to `/apps/server/.env`:

```bash
# Add your API keys
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
ELEVENLABS_API_KEY="..."
```

### 4. Initialize the Database

Generate Prisma client and run migrations:

```bash
cd apps/server
pnpm db:generate
pnpm db:push
cd ../..
```

This will:
- Generate the Prisma client
- Create the database schema in PostgreSQL

### 5. Build Shared Package

Build the shared types package:

```bash
cd packages/shared
pnpm build
cd ../..
```

### 6. Start Development Servers

From the root directory, start both frontend and backend:

```bash
pnpm dev
```

This will start:
- **Frontend (Next.js)**: http://localhost:3000
- **Backend (Express)**: http://localhost:3001

You should see:
- The three-panel layout in your browser
- A green "● Connected to server" status bar at the top

## Verification

### Check the Frontend

1. Open http://localhost:3000 in your browser
2. You should see:
   - A green connection status at the top: "● Connected to server"
   - Three panels: Config (left), Discussion (center), Documents (right)

### Check the Backend

1. Open http://localhost:3001/health in your browser
2. You should see: `{"status":"ok","timestamp":"..."}`

3. Open http://localhost:3001/api/status
4. You should see: `{"status":"running","version":"0.1.0","timestamp":"..."}`

### Check Database Connection

Run Prisma Studio to view your database:

```bash
pnpm db:studio
```

This will open http://localhost:5555 where you can view and edit database records.

## Troubleshooting

### Docker containers not starting

```bash
# Check Docker is running
docker --version

# Check container logs
docker logs brainstorm-postgres
docker logs brainstorm-redis

# Restart containers
pnpm docker:down
pnpm docker:up
```

### Port conflicts

If ports 3000, 3001, 5432, or 6379 are already in use:

1. Stop the services using those ports, OR
2. Change the ports in:
   - `docker-compose.yml` (PostgreSQL and Redis)
   - `apps/server/.env` (PORT)
   - `apps/web/.env.local` (NEXT_PUBLIC_WS_URL, NEXT_PUBLIC_API_URL)

### Dependencies not installing

```bash
# Clear all node_modules and reinstall
pnpm clean
pnpm install
```

### Database connection errors

1. Verify PostgreSQL is running: `docker ps`
2. Check connection string in `apps/server/.env`
3. Try resetting the database:
   ```bash
   pnpm docker:down
   pnpm docker:up
   cd apps/server
   pnpm db:push
   ```

### WebSocket not connecting

1. Check backend is running on port 3001
2. Verify CORS settings in `apps/server/.env`
3. Check browser console for connection errors

## Development Workflow

### Running Specific Services

```bash
# Run only frontend
pnpm dev:web

# Run only backend
pnpm dev:server
```

### Database Operations

```bash
# Generate Prisma client after schema changes
cd apps/server
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create a migration
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

### Type Checking

```bash
# Type check all packages
pnpm type-check
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:web
pnpm build:server
```

## What's Next?

Phase 1 is complete! The foundation is ready. Next steps:

- **Phase 2**: Document System with version control
- **Phase 3**: Voice Integration (OpenAI, ElevenLabs, Web Speech API)
- **Phase 4**: AI Provider Abstraction
- **Phase 5**: Basic Agent System
- **Phase 6**: Research Agents
- **Phase 7**: Configuration & Templates
- **Phase 8**: Polish & Error Handling
- **Phase 9**: Production Deployment

## Need Help?

- Check the main [README.md](./README.md) for architecture overview
- Review the implementation plan for detailed phase breakdowns
- Check Docker logs for infrastructure issues
- Review browser console for frontend errors
- Check terminal output for backend errors
