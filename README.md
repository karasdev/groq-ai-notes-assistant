# Groq AI Notes Assistant

A small **Next.js** app for saving notes and asking **Groq**-powered questions grounded in your own content. Notes live in a **SQLite** database via **Prisma**; the assistant retrieves relevant notes with lightweight keyword scoring, then answers using only that context.

## Features

- **Notes** — Create, list, and delete notes with title, body, and creation date.
- **Ask AI** — Submit a question; the app ranks notes by word overlap with your question, passes the top matches to Groq, and returns an answer plus source references.
- **Grounded answers** — System prompts instruct the model to use only the provided notes and to admit when information is missing.

## Tech stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 16 (App Router)                     |
| UI           | React 19, Tailwind CSS 4                    |
| Database     | SQLite (`DATABASE_URL` in Prisma)           |
| ORM          | Prisma 6                                    |
| AI           | [Groq API](https://console.groq.com/) via `groq-sdk` |

## How it works

1. On **Ask**, all notes are loaded and scored by how often meaningful terms from the question appear as whole words in the combined title and body.
2. The highest-scoring notes are formatted as context and sent to Groq chat completions.
3. The UI shows the model answer and the notes used as sources.

This is a simple retrieval step (not embeddings or a vector DB), which keeps the project easy to run locally.

## Prerequisites

- **Node.js** 20+ (recommended; aligns with `@types/node` in the project)
- A **Groq API key** from [Groq Console → API Keys](https://console.groq.com/keys)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the sample file and set your Groq key:

```bash
cp env.example .env
```

Edit `.env` (do not commit it). The template includes:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | SQLite path (see `env.example`; default `file:./dev.db`) |
| `GROQ_API_KEY` | Yes | From [Groq Console → API Keys](https://console.groq.com/keys) |
| `GROQ_CHAT_MODEL` | No | Chat model id; defaults to `llama-3.1-8b-instant` in code if unset |

To list models your key can use:

```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
```

### 3. Database

Generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

For a fresh named migration after schema changes:

```bash
npx prisma migrate dev --name your_migration_name
```

Optional — open Prisma Studio to inspect data:

```bash
npx prisma studio
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Notes** to add content, then **Ask AI** to query it.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | Run ESLint               |

## HTTP API (summary)

| Method & path        | Description                              |
| -------------------- | ---------------------------------------- |
| `GET /api/notes`     | List all notes (newest first)            |
| `POST /api/notes`    | Create a note (`title`, `content` JSON)  |
| `DELETE /api/notes/:id` | Delete a note by id                   |
| `POST /api/ask`      | Ask a question (`question` JSON); uses stored notes + Groq |

Successful responses generally include a `success` boolean where applicable; validation errors use `4xx` with a `message` field.

## Project structure (high level)

```
app/
  api/ask/route.ts      # Groq + note retrieval
  api/notes/            # CRUD API for notes
  ask/page.tsx          # Ask UI
  notes/page.tsx        # Notes UI
  page.tsx              # Landing
lib/
  prisma.ts             # Singleton Prisma client
prisma/
  schema.prisma         # Note model
  migrations/           # SQL migrations
```

## Deployment notes

- Set `DATABASE_URL` to a persistent SQLite path or switch Prisma to another [supported database](https://www.prisma.io/docs/orm/reference/supported-databases) for production.
- Configure `GROQ_API_KEY` (and optionally `GROQ_CHAT_MODEL`) in your host’s environment; never expose the key in client-side code.
- Run `npx prisma migrate deploy` in CI or release pipelines when using migrate-based workflows.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)
- [Groq API](https://console.groq.com/docs)
