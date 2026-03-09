# NovaTex

A modern web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Routing:** React Router DOM
- **State Management:** TanStack React Query

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/hiimnew100/NovaTex.git
cd NovaTex

# Install dependencies
npm install

# Copy the environment template and fill in your Supabase credentials
cp .env.example .env

# Start the development server
npm run dev
```

The app will be running at `http://localhost:8080`.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `VITE_SUPABASE_URL` | Your Supabase project URL |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

## Deployment

This project deploys as a **static site**. Run `npm run build` to generate the `dist/` folder, then serve it with any static hosting provider (GitHub Pages, Vercel, Netlify, etc.).

See the deployment guide for step-by-step GitHub Pages instructions.

## License

MIT
