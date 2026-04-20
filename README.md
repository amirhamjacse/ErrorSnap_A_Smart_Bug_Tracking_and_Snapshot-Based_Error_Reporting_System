# ErrorSnap

ErrorSnap is a full-stack error monitoring and incident workflow platform for web applications. It combines a client-side SDK, a Node.js/Express API, and a React dashboard so teams can capture runtime errors, enrich them with browser and OS context, inspect screenshots and stack traces, assign issues to teammates, upload source maps, and receive Slack notifications.

## Overview

This repository is structured as a small monorepo with three main parts:

- `backend` - Express API, MySQL schema, authentication, team management, Slack integration, and source-map handling.
- `frontend` - React + TypeScript dashboard used to manage projects, inspect logged errors, assign work, and manage integrations.
- `sdk` - Browser SDK that you embed into customer applications to detect JavaScript errors and send them to ErrorSnap.

The system is designed for production observability workflows, especially for teams that want a lightweight alternative to generic error tracking tools with project-level ownership and collaboration.

## How It Works

1. A developer creates a project in the dashboard and copies the project ID.
2. The ErrorSnap SDK is installed in the target web app and initialized with that project ID.
3. The SDK listens for `window.onerror` and `unhandledrejection`, collects stack traces, browser and OS details, and captures a screenshot of the current page.
4. The SDK sends the error payload to the backend API.
5. The backend stores the error in MySQL, associates it with the relevant project, and exposes it through the dashboard.
6. Team members can filter errors, view details, assign owners, mark issues as resolved, upload source maps, and connect Slack for notifications.

## Key Features

- User authentication with login and registration.
- Project creation and management.
- Real-time error ingestion from the SDK.
- Error details including message, stack trace, source, line, column, browser, OS, screenshot, and status.
- Error assignment and resolution workflow.
- Team invitations and member approval flow.
- Slack OAuth integration and channel binding.
- Source-map upload history for symbolicated production stack traces.
- Dashboard views for projects, project errors, assigned errors, invitations, and settings.

## Tech Stack

### Backend

- Node.js
- Express
- MySQL
- JSON Web Tokens
- Multer
- Nodemailer
- Slack Web API
- Source Map processing

### Frontend

- React
- TypeScript
- Vite
- Material UI
- Redux Toolkit
- TanStack Query
- React Hook Form
- Zod
- Axios

### SDK

- TypeScript
- Webpack
- html-to-image for screenshot capture

## Repository Structure

```text
error-snap/
├── backend/
│   ├── app.js
│   ├── env.example
│   ├── classes/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── tables/
│   ├── temp-uploads/
│   └── utils/
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── icons/
│   │   ├── Layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── store/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   └── public/
├── sdk/
│   ├── src/
│   │   └── errorSnap.ts
│   ├── webpack.config.js
│   └── README.md
├── package-lock.json
└── README.md
```

## Backend Architecture

The backend boots through `backend/app.js`, loads environment variables, applies JSON/body parsing, CORS, and cookie middleware, then mounts the API router.

### Route Groups

- Authentication
  - `POST /auth/login`
  - `POST /auth/register`
  - `GET /auth/get-loggedIn-user`
  - `GET /auth/invitation/:token`
- Error logs
  - `POST /error-logs`
  - `GET /error-logs/:projectId`
  - `GET /error-logs/:projectId/export`
  - `GET /errors/:errorId`
  - `POST /assign-error`
  - `POST /resolve-error`
  - `GET /assigned-errors`
- Projects
  - `POST /project`
  - `POST /delete-project/:projectId`
  - `GET /user-projects`
  - `GET /project/:projectId`
  - `GET /user-project/:projectId`
- Team management
  - `POST /invite-member`
  - `POST /approve-member/:memberId`
  - `POST /cancel-invitation/:memberId`
  - `POST /remove-member/:memberId`
  - `GET /pending-members/:projectId`
  - `GET /all-invitation`
  - `GET /team-members/:projectId`
  - `GET /has-invitations`
- Slack integration
  - `GET /slack/oauth/start`
  - `GET /slack/callback`
  - `GET /slack/details/:projectId`
  - `POST /slack/add-channel`
- Source maps
  - `POST /upload`
  - `GET /sourcemap-history/:projectId`

### Important Backend Folders

- `controllers` contains the request handlers for auth, logs, projects, teams, Slack, and source maps.
- `classes` contains reusable service objects such as token handling, mail sending, Slack helpers, and database-backed domain models.
- `database` contains the MySQL connection and automatic table creation bootstrap.
- `tables` contains the schema definitions executed on startup.
- `middleware` contains auth and request guard logic.
- `utils` contains shared helpers such as CORS, date formatting, token helpers, and table execution utilities.

## Frontend Architecture

The frontend is a React dashboard built with Vite and TypeScript. It uses a protected route layout for authenticated users, a separate auth flow for login and registration, and dashboard pages for project and error management.

### Main Pages

- `Projects` - project list, creation, filtering, and usage guide.
- `ProjectErrors` - error table and filters for a selected project.
- `ProjectErrorDetails` - detailed error inspection with metadata and assignee controls.
- `ProjectSettings` - general settings, team management, and integration settings.
- `AssignedErrors` - errors assigned to the current user.
- `Invitations` - incoming project invitations.
- `Login` and `Register` - authentication screens.

### Frontend Support Layers

- `routes` defines public and authenticated routes.
- `store` contains the Redux store and auth state.
- `hooks` contains data-fetching and form helpers.
- `components` contains shared UI building blocks such as loaders, dialogs, navbar, tabs, and auth guards.
- `theme` centralizes Material UI theming.
- `utils` contains API, token, time, and formatting helpers.

## SDK Architecture

The SDK is the browser-side collector. Its main job is to intercept runtime failures and package them into a payload that the backend can persist.

### SDK Behavior

- Listens to global JavaScript errors via `window.onerror`.
- Listens to promise failures via `window.onunhandledrejection`.
- Extracts message, source, line, column, stack trace, browser, and OS information.
- Captures a screenshot of the current page using `html-to-image`.
- Sends the payload to the configured error logging API endpoint.

### SDK Usage

```html
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = 'https://errorsnap-sdk.netlify.app/';
    script.onload = () => {
      const app = new ErrorSnap({
        projectId: 'your-project-id'
      });
      app.initialize();
    };
    document.body.appendChild(script);
  });
</script>
```

## Database Schema

The backend auto-creates the schema on startup. The main tables are:

### `users`

Stores registered dashboard users.

- `id` - auto-increment primary key
- `username` - display name
- `email` - unique login email
- `password` - hashed password
- `created_at` - creation timestamp

### `project`

Stores monitored projects owned by a user.

- `id` - project identifier
- `user_id` - project owner
- `name` - project name
- `description` - project description
- `last_error_at` - timestamp of the most recent error
- `created_at` - creation timestamp

### `errorlogs`

Stores captured runtime errors.

- `id` - error identifier
- `message` - error message
- `project_id` - linked project
- `source` - source file or origin
- `lineno` - line number
- `colno` - column number
- `stack` - stack trace text
- `browser` - browser name and version
- `os` - operating system
- `image` - captured screenshot data or URL
- `status` - `0` unresolved, `1` pending, `2` resolved
- `created_at` - creation timestamp
- `assignee_id` - assigned user

### `project_team`

Stores team membership for a project.

- `id` - auto-increment primary key
- `project_id` - linked project
- `user_id` - team member user ID
- `invited_by` - user who sent the invite
- `is_approved` - approval state

### `project_invitation_links`

Stores invitation tokens for team onboarding.

- `id` - auto-increment primary key
- `project_id` - linked project
- `email` - invited email address
- `invited_by` - inviter user ID
- `token` - unique invitation token
- `expires_at` - expiry timestamp
- `is_used` - whether the invite was consumed
- `created_at` - creation timestamp

### `slack_integration`

Stores Slack OAuth and channel binding details.

- `id` - auto-increment primary key
- `team_id` - Slack team identifier
- `team_name` - Slack team name
- `access_token` - OAuth token
- `scope` - granted OAuth scope
- `project_id` - linked project
- `bot_user_id` - Slack bot user identifier
- `created_at` - creation timestamp
- `channel_id` - target Slack channel

### `sourcemap_history`

Tracks source-map upload history for a project.

- `id` - auto-increment primary key
- `project_id` - linked project
- `uploaded_at` - upload timestamp

## Environment Variables

Backend configuration is driven by environment variables. The example file in `backend/env.example` includes:

- `DB_HOST`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `PRIVATE_KEY`

The codebase also references these optional runtime variables:

- `PORT`
- `FRONTEND_LINK`
- `FRONTEND_URL`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_REDIRECT_URI`
- `SLACK_SCOPE`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`

## Local Development

Install dependencies separately inside each package directory.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### SDK

```bash
cd sdk
npm install
npm run dev
```

## Notes

- The frontend API client is currently configured to talk to `http://127.0.0.1:3000/` during local development.
- The SDK can be hosted independently and consumed from a production URL.
- Source maps are optional but strongly recommended if you want production stack traces to resolve back to original source lines.

## License

No explicit license file is included in the repository.