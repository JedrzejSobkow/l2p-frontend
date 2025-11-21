# L2P-Online Frontend

Web client for L2P-Online built with React, TypeScript, Vite, and Tailwind CSS.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Development Setup](#development-setup)
- [Docker](#docker)
- [Scripts](#scripts)

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm (comes with Node.js)
- Docker and Docker Compose (optional, for containerized runs)
- Git

## Quick Start

Run the frontend locally with Node.js:

```bash
# Clone the repository
git clone <repository-url>
cd l2p-frontend

# Install dependencies
npm ci

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173

## Configuration

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit the values as needed.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL of the backend API (versioned) | `http://localhost:8000/v1` |
| `VITE_SOCKET_IO_URL` | Socket.IO server URL | `http://localhost:8000` |

All environment variables exposed to the client must be prefixed with `VITE_`. They are read at build time.

## Development Setup

Install dependencies and run the app locally:

```bash
# Install dependencies (first time)
npm ci

# Start dev server with hot reload
npm run dev
```

Create a production build and preview it:

```bash
# Build for production
npm run build

# Preview the built app
npm run preview
```

## Docker

Run the frontend using Docker Compose:

```bash
# Build and start the container (rebuild image if needed)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at:
- **Frontend (Docker)**: http://localhost:5173

You can also build the image manually and pass environment variables as build arguments:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8000/v1 \
  --build-arg VITE_SOCKET_IO_URL=http://localhost:8000 \
  -t l2p-frontend .
```

## Scripts

Useful npm scripts:

- `npm run dev` – start the development server.
- `npm run build` – type-check and create a production build.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run ESLint on the project.
