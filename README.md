# GSE Fleet Status 2025

A glass cockpit view of the deice operation. The dashboard tracks the four DS-series trucks alongside
the Type I and Type IV bulk tanks so ramp leaders can validate readiness at a glance, and it now ships
with a mobile-friendly portal so crews can edit the data on the ramp.

## Features

- **Command deck hero** summarizing running trucks, heater posture, and combined fluid reserves.
- **Fluid availability tiles** that stack truck loads against bulk storage for both Type I and Type IV.
- **Deice truck cards** showing real-time fluid levels, fuel reserves, heater status, and operator notes
  for assets DS032 through DS035.
- **Bulk tank monitors** outlining remaining gallons, percentage full, and last gauge checks for each
  storage tank.
- **Field update portal** with sliders, toggles, and text inputs to refresh fluid levels, fuel, statuses,
  assignments, and notes directly from a phone.
- **Neon glass aesthetic** with responsive layout tuned for tablets on the ramp.

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
