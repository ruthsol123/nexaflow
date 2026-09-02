# NexaFlow

A modern full-stack SaaS platform for team and project management.

## Project Overview

NexaFlow is being built as a focused workspace for teams to plan projects, manage tasks, collaborate, and understand progress. The current release is the responsive product landing page and visual dashboard foundation for the application.

## Features

The current implementation includes:

- Responsive NexaFlow product landing page
- Product dashboard preview with project metrics, tasks, team members, and velocity chart
- Feature, workflow, social proof, call-to-action, and footer sections
- Responsive navigation with an accessible mobile menu
- Dark navy interface with cyan and blue accents
- Reduced-motion support for animated presentation elements

Application features such as persistent projects, real-time collaboration, notifications, analytics data, permissions, authentication, and backend APIs are not implemented yet.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React icons
- ESLint

## Current Development Status

NexaFlow is in early development. The frontend landing experience is implemented, while product functionality and the backend platform are planned for future iterations.

## Planned Features

- Authentication and team workspaces
- Persistent projects, tasks, priorities, and assignments
- Team collaboration and activity updates
- Notifications and integrations
- Project analytics and reporting
- Role-based access control
- Backend APIs and database persistence

## Project Structure

```text
app/                  App Router pages, layout, and global styles
components/landing/  Reusable landing page sections
components/ui/       Shared UI component location
hooks/               Shared React hooks
lib/                 Shared utilities
types/               Shared TypeScript types
```

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in a browser.

## Environment Variables

No environment variables are required by the current frontend implementation. Local environment files such as `.env` and `.env.local` are ignored by Git and must never contain committed secrets.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Future Improvements

The next focus is turning the dashboard preview into the authenticated product workspace, backed by a secure API and persistent data model. Deployment, automated testing, observability, and CI checks will be added as the core product workflows take shape.
