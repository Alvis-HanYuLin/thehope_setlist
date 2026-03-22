# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build
- `npm start` — start production server
- `npm run lint` — run ESLint (flat config, ESLint v9)
- No test framework is configured

## Architecture

This is a church worship team setlist dashboard (敬拜歌單管理系統) built with Next.js 16 App Router, React 19, and Tailwind CSS v4.

The entire application lives in a single client component: `src/app/page.tsx` ("use client"). It contains:

1. **Data constants** at the top of the file: `PERSONNEL`, `DEFAULT_ROSTER`, `INITIAL_SONGS`, `MC_SPOT` — edit these to change team members, default assignments, and songs
2. **Reusable UI components** defined inline: `Card`, `SectionHeader`, `Select`, `SongRow`, `AddSongForm`, `QuickLink`
3. **Main `SetlistDashboard` component** using `useState` hooks for roster and song state — no external state management

Layout is in `src/app/layout.tsx`. Global styles in `src/app/globals.css`.

## Key Conventions

- **Next.js 16 breaking changes**: APIs, conventions, and file structure may differ from older versions. Read docs in `node_modules/next/dist/docs/` before writing new Next.js patterns.
- **Path alias**: `@/*` maps to `./src/*` (tsconfig.json)
- **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin (not the v3 `tailwindcss` PostCSS plugin)
- **Dark theme**: Premium dark UI with glassmorphism and gradient effects — maintain this aesthetic when adding components
- **Language**: README and UI text are in Traditional Chinese (繁體中文)
