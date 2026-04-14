# Project Management & Team Collaboration Tool

A modern, production-ready platform for managing work, coordinating teams, and collaborating in real time. Built with a focus on multi-tenant workspaces and a flexible Kanban-style board.

What this repo contains
- A full-featured backend (API, auth, storage, sockets)
- A responsive React client with Redux Toolkit state
- Integrations for file uploads, notifications, and OAuth

Highlights
- Multi-tenant workspace support for separate teams and clients
- Kanban boards with drag-and-drop task organization
- Live updates and presence via Socket.io
- Rich task features: comments, attachments, and notifications

Core technologies
- Backend: Node.js, TypeScript, Express
- Frontend: React 18, Vite, Redux Toolkit, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Real-time: Socket.io
- Authentication: JWT and Google OAuth

Repository layout (top-level)
```
client/      # React frontend
server/      # Express backend and API
ai-service/  # optional AI helpers and services
ui-demo/     # UI examples and prototypes
```

Quick start (development)
1. Install backend deps and run server

```bash
cd server
npm install
npm run dev
```

2. Start the frontend

```bash
cd client
npm install
npm run dev
```

Where to look first
- Backend entry: server/src/index.ts
- Frontend entry: client/src/main.tsx

Contributing and status
- This project is maintained and ready for production use. Contributions and issue reports are welcome.

License
- See the repository license for details.

If you want, I can also expand this README with deploy instructions, env variables, or architecture diagrams.
