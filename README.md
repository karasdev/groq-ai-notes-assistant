# Groq AI Notes Assistant

![Groq AI Notes Assistant overview](docs/images/readme-banner.svg)

A Next.js notes application with a Groq-powered question-answering workflow. Users can save notes, ask questions about their saved content, and receive grounded answers with source references.

The app stores notes in SQLite through Prisma, retrieves relevant notes with lightweight keyword matching, and sends the selected note context to Groq for answer generation.

## Preview

| Notes | Ask AI |
| ----- | ------ |
| ![Notes management screen](docs/images/notes-screen.svg) | ![Ask AI screen](docs/images/ask-screen.svg) |

## Features

- **Note management** - Create, list, and delete notes with a title, content, and creation date.
- **Question answering** - Ask a question and receive an answer generated from the most relevant saved notes.
- **Source references** - View the notes that were used as context for each AI answer.
- **Grounded responses** - The system prompt instructs the model to answer only from provided notes and acknowledge when information is missing.

## Tech stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 16 (App Router)                     |
| UI           | React 19, Tailwind CSS 4                    |
| Database     | SQLite (`DATABASE_URL` in Prisma)           |
| ORM          | Prisma 6                                    |
| AI           | [Groq API](https://console.groq.com/) via `groq-sdk` |

## How it works

1. When a question is submitted, the API loads all saved notes from SQLite.
2. Each note is scored by whole-word overlap between the question terms and the combined note title/content.
3. The highest-scoring notes are formatted as context and sent to Groq chat completions.
4. The response includes the generated answer and the notes used as sources.

This intentionally uses simple keyword retrieval rather than embeddings or a vector database, keeping the project easy to understand and run locally.

## Prerequisites

- **Node.js** 20+
- A **Groq API key** from [Groq Console → API Keys](https://console.groq.com/keys)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the sample environment file and set your Groq API key:

```bash
cp env.example .env
```

Edit `.env` locally. Do not commit secrets.

The template includes:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | SQLite path (see `env.example`; default `file:./dev.db`) |
| `GROQ_API_KEY` | Yes | From [Groq Console → API Keys](https://console.groq.com/keys) |
| `GROQ_CHAT_MODEL` | No | Chat model ID; defaults to `llama-3.1-8b-instant` in code if unset |

To list the models available to your Groq API key:

```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
```

### 3. Set up the database

Generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

After schema changes, create a named migration:

```bash
npx prisma migrate dev --name your_migration_name
```

Optional: open Prisma Studio to inspect local data.

```bash
npx prisma studio
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Notes** to add content, then use **Ask AI** to query your saved notes.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint`  | Run ESLint               |

## HTTP API

| Method | Path              | Description                                  |
| ------ | ----------------- | -------------------------------------------- |
| `GET`  | `/api/notes`      | List all notes, newest first                 |
| `POST` | `/api/notes`      | Create a note from `title` and `content`     |
| `DELETE` | `/api/notes/{id}` | Delete a note by ID                        |
| `POST` | `/api/ask`        | Ask a question using saved notes and Groq    |

Successful responses generally include a `success` boolean where applicable; validation errors use `4xx` with a `message` field.

## Project structure

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

## Limitations

- Retrieval is based on keyword overlap, not semantic similarity.
- Notes with relevant meaning but different wording may not be selected as sources.
- The app does not currently include authentication or per-user note separation.
- The AI response quality depends on the retrieved notes and the configured Groq model.

## Deployment notes

- Set `DATABASE_URL` to a persistent database location. Many serverless hosts do not provide durable local SQLite storage by default.
- For production deployments, consider switching Prisma to another [supported database](https://www.prisma.io/docs/orm/reference/supported-databases).
- Configure `GROQ_API_KEY` and optionally `GROQ_CHAT_MODEL` in your hosting environment. Never expose the Groq API key in client-side code.
- Run `npx prisma migrate deploy` in CI or release pipelines when using Prisma migrations.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)
- [Groq API](https://console.groq.com/docs)
