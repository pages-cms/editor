# Editor

Format-aware TipTap editor component (`HTML` or `Markdown`) with BubbleMenu controls, slash commands, source mode, links, images, and tables.

Component name:
- `Editor` (exported from `src/components/ui/editor.tsx`)

## Local Demo

```bash
npm install
npm run dev
```

Build checks:

```bash
npx tsc --noEmit
npm run build
```

## Styling Model

- Uses shadcn-style Tailwind utility classes and token variables.
- Does not depend on shadcn React wrapper components.
- Demo token/base styles are in `src/globals.css`.

## Registry Build (shadcn)

Registry source:
- `registry.json`
- `registry/default/editor/*`

Build registry artifacts:

```bash
npm run registry:build
```

Generated files:
- `public/r/registry.json`
- `public/r/editor.json`

## Consumer Install

From a consumer app, install via registry item URL:

```bash
npx shadcn@latest add https://<your-host>/r/editor.json
```

For local testing, serve this repo and point to your local URL:

```bash
npm run dev
# then use the local /r/editor.json URL exposed by your server
```
