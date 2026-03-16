# Image Background Remover

Free online image background removal tool powered by [remove.bg](https://www.remove.bg) API.

Built with **Next.js 14** + **Cloudflare Pages**.

## Features

- Drag & drop or click to upload
- Supports JPG, PNG, WebP (max 5MB)
- Instant AI-powered background removal
- Download transparent PNG
- No signup required, no image storage

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Runtime**: Cloudflare Pages + Workers (Edge)
- **AI**: remove.bg API
- **Storage**: None — images processed in memory only

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your REMOVE_BG_API_KEY to .env.local
npm run dev
```

## Deploy to Cloudflare Pages

1. Connect this repo to Cloudflare Pages
2. Set build command: `npm run pages:build`
3. Set output directory: `.vercel/output/static`
4. Add environment variable: `REMOVE_BG_API_KEY`

## Environment Variables

| Variable | Description |
|---|---|
| `REMOVE_BG_API_KEY` | Your [remove.bg API key](https://www.remove.bg/api) |
