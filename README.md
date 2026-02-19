# Editor

`Editor` is a format-aware TipTap component (`HTML` or `Markdown`) with:
- Bubble menu formatting controls
- Slash commands
- Source mode
- Links, images (including ALT editing), and tables

Component export:
- `Editor` from `src/components/ui/editor.tsx`

## Local Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run registry:build
```

`npm run build` now:
- builds client assets
- builds SSR entry
- prerenders `/` into `dist/index.html`

## Styling Model

- Uses shadcn-style Tailwind utility classes and semantic tokens.
- Uses local shadcn component files where needed (`button`, `tabs`).
- Demo/base styles live in `src/index.css`.

## Registry

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

## Install In Another Project

Install this component directly from GitHub:

```bash
npx shadcn@latest add https://editor.pagescms.org/r/editor.json
```

## Basic Usage

```tsx
import { useState } from "react";
import { Editor } from "@/components/ui/editor";

export function Example() {
  const [value, setValue] = useState("");

  return (
    <Editor
      value={value}
      onChange={setValue}
    />
  );
}
```

Notes:
- Default `format` is `"html"`.
- `format` supports `"markdown"` and `"html"`.
- `mode` supports `"wysiwyg"` and `"source"`.
- `className` applies classes to the root wrapper (`cn-editor`).
- `editorClassName` applies classes to the WYSIWYG surface only.
- `sourceClassName` applies classes to the source textarea only.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Current editor content. |
| `onChange` | `(value: string) => void` | - | Called whenever content changes. |
| `format` | `"markdown" \| "html"` | `"html"` | Parsing and output format. |
| `mode` | `"wysiwyg" \| "source"` | `"wysiwyg"` | Active editor mode. |
| `disabled` | `boolean` | `false` | Disables editing and toolbar actions. |
| `sourceDebounceMs` | `number` | `500` | Debounce for source text synchronization. |
| `className` | `string` | - | Extra classes for the root wrapper (`cn-editor`). |
| `editorClassName` | `string` | - | Extra classes for the WYSIWYG surface. |
| `sourceClassName` | `string` | - | Extra classes for the source textarea. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | Forwarded to the root container. |

## Hooks

| Hook | Type | When |
| --- | --- | --- |
| `onSwitchToSource` | `(value: string, format: "markdown" \| "html") => string \| Promise<string>` | Runs when switching to source mode. |
| `onSwitchToEditor` | `(value: string, format: "markdown" \| "html") => string \| Promise<string>` | Runs when switching back to WYSIWYG mode. |

## Optional Mode Switch

```tsx
import { useState } from "react";
import { Editor } from "@/components/ui/editor";

export function Example() {
  const [mode, setMode] = useState<"wysiwyg" | "source">("wysiwyg");
  const [value, setValue] = useState("");

  return (
    <>
      <button type="button" onClick={() => setMode("wysiwyg")}>Editor</button>
      <button type="button" onClick={() => setMode("source")}>Source</button>
      <Editor
        value={value}
        onChange={setValue}
        format="markdown"
        mode={mode}
      />
    </>
  );
}
```

## Deploy (Cloudflare Pages)

Use Git integration with these settings:
- Framework preset: `None`
- Root directory: `editor`
- Build command: `npm run build`
- Build output directory: `dist`

This deploys the prerendered static HTML + hydrated React demo.
