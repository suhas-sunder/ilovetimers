# iLoveTimers

Production: https://www.ilovetimers.com

iLoveTimers is a browser-based collection of timers, stopwatches, clocks,
countdowns, converters, and date/time calculators built with React Router.

## Requirements

- Node.js 20.19 or newer (including current 22 and 25 releases)
- npm

## Local development

Install dependencies and start the React Router development server:

```bash
npm install
npm run dev
```

The development server prints its local URL when it starts.

## Production build

Create the fully static production output:

```bash
npm run build
```

React Router prerenders every static route declared in `app/routes.ts`. The
deployable output is written to `build/client`; no runtime server bundle,
Netlify Function, or Netlify Edge Function is required.

Preview the completed static build locally:

```bash
npm start
```

## Netlify

`netlify.toml` publishes only `build/client`. Permanent redirects live in
`public/_redirects`, while security and cache headers live in `netlify.toml`.
Netlify deployment is performed by the repository's normal continuous
deployment workflow; do not run a manual deploy for ordinary changes.

## Validation

Run the core checks:

```bash
npm run typecheck
npm run build
npm run audit:static-deployment
npm run test --if-present
```

Additional product, SEO, accessibility, browser, and release audits are
available through the scripts declared in `package.json`.
