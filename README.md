# SidePlanner

![SidePlanner](public/SidePlanner-bow.png)

A web-based personal side projects management application that combines traditional task board functionality with AI assistance for intelligent project planning. The system helps individuals organize their development workflow while leveraging AI to suggest sub and related tasks.

### Core Features:

- Personal Board Management

  - Customizable board view (Kanban-style)
  - Standard columns: Backlog, To Do, In Progress, Done
  - Task cards with title, description, priority, and labels
  - Drag-and-drop functionality for task management

- AI Task Enhancement

  - AI analysis of existing tasks to suggest related subtasks
  - Complexity estimation suggestions based on task complexity

This project is based on a template built with Next.js, Shadcn/ui, and Drizzle.

#### Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

#### Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
npm install
```

#### Running Locally

Use the included setup script to create your `.env` file:

```bash
npm db:setup
```

Then, run the database migrations and seed the database with a default user and team:

```bash
npm db:migrate
npm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can, of course, create new users as well through `/sign-up`.

Finally, run the Next.js development server:

```bash
npm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

#### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `POSTGRES_URL`: Set this to your production database URL.
3. `AUTH_SECRET`: Set this to a random string. `openssl rand -base64 32` will generate one.
