# GSE Fleet Status 2025

A stylized control-room inventory for ground support equipment. The app delivers a bird's-eye view of
which assets are operational, under observation, or offline so launch teams can triage in seconds.

## Features

- **Command deck hero** summarizing fleet readiness, average system health, and critical watch counts.
- **Mission pulse cards** with breakdowns by status, location heat bars, and upcoming maintenance windows.
- **Interactive inventory list** with searching, filtering by status or location, and a quick toggle for
  critical assets.
- **Deep dive panel** that surfaces owner notes, utilization mix, live issue timeline, and scheduled work.
- **Immersive neon-inspired UI** built with handcrafted CSS glassmorphism, gradients, and responsive layouts.

## Getting started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build the production bundle
npm run build
```

Then visit the local address reported in the terminal (usually `http://localhost:5173`).

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for rapid development
- Custom CSS for theming and layout – no component framework required
