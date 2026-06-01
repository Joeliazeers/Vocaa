# Vocaa — Language Learning Platform

Vocaa is an interactive, full-stack language learning application built with Next.js. It features structured learning paths, spaced-repetition flashcards, AI-driven conversations, and writing practice with stroke order animations.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: PostgreSQL (via Prisma ORM)
- **Auth**: Custom JWT session in httpOnly cookie
- **AI Integration**: OpenAI API for conversations and Text-to-Speech

## Local Setup

Follow these steps to run the application locally on your machine.

### 1. Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (you can use local Postgres or a cloud provider like Neon)
- An OpenAI API Key (for conversation and speech features)

### 2. Clone the Repository

```bash
git clone https://github.com/Joeliazeers/Vocaa.git
cd Vocaa
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Database connection
DATABASE_URL="postgres://user:password@localhost:5432/vocaa"
DIRECT_URL="postgres://user:password@localhost:5432/vocaa"

# Auth Secret (Must be 32 characters or more)
AUTH_SECRET="your-super-secret-key-for-local-dev-123!"

# OpenAI API Key (for Chat and TTS)
OPENAI_API_KEY="sk-..."
```

### 5. Database Setup

Run the following commands to create the database schema and populate the initial learning data (languages, skills, modules, and achievements):

```bash
npx prisma db push
npx prisma db seed
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
prisma/
  schema.prisma        # Database schema models
  seed.ts              # Initial seed data for languages and content
src/
  app/                 # Next.js App Router (Pages & API Routes)
  components/          # Reusable UI components
  lib/                 # Core utilities (auth, gamification, spaced-repetition, AI)
```
