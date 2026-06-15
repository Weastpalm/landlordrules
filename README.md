# LandlordRules.com

A fast, SEO-friendly React site covering U.S. landlord–tenant law: state-by-state rules,
a notice-letter generator, and plain-English answers to the most common tenant questions.
Built with **Vite + React + Tailwind CSS** and deployed as a static site (great for Netlify,
Vercel, Cloudflare Pages, etc.).

## Run it locally

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into /dist
npm run preview  # preview the production build locally
```

## ⚠️ Verify the legal data before you publish

`src/App.jsx` contains a `STATES` array with security-deposit limits, notice-to-enter,
notice-to-vacate, and late-fee rules for all 50 states, plus a `QA` array of tenant answers.
These values are a **researched starting point, not legal advice, and laws change.**
Before this site goes live and earns ad revenue, confirm each state's numbers against the
current statute (each card links out to the relevant code) and update the array. The app
shows "not legal advice / verify current statutes" disclaimers on every page — keep them.

## Where Google AdSense goes

Every page renders an **"Ad"** placeholder banner (see the `AdBanner` / `AdBannerOnDark`
components in `src/App.jsx`). Once your AdSense account is approved:

1. Paste your account script tag into `index.html` (there's a commented placeholder in `<head>`).
2. Replace the placeholder banners' inner markup with your real `<ins class="adsbygoogle">` units.

## Deploy to Netlify (free)

This repo includes `netlify.toml` and `public/_redirects` already configured
(build command `npm run build`, publish directory `dist`, SPA fallback). See the chat
instructions for the full step-by-step, including pointing `landlordrules.com` at Netlify.

## Project structure

```
landlordrules/
├─ index.html            # HTML shell + SEO meta + Google Fonts + AdSense placeholder
├─ src/
│  ├─ App.jsx            # entire app (entry screen, both paths, all data) — single source of truth
│  ├─ main.jsx           # React entry point
│  └─ index.css          # Tailwind directives + base styles
├─ public/
│  ├─ _redirects         # SPA fallback for drag-and-drop deploys
│  └─ favicon.svg
├─ netlify.toml
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
└─ package.json
```

## A note on SEO

This is a client-rendered single-page app. It will be indexed (Google runs JavaScript), but
for the strongest SEO on a content site you may later want pre-rendered/static HTML per page.
Easiest upgrade paths: add a prerender step (e.g. `vite-plugin-prerender`/`react-snap`) or port
the content to a static framework like **Astro**. The content and component structure here
transfer directly.
