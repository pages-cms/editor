# Editor

`Editor` is a format-aware TipTap component (`HTML` or `Markdown`) with:
- Bubble menu formatting controls
- Slash commands
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
- `className` applies classes to the root wrapper (`cn-editor`).
- `editorClassName` applies classes to the WYSIWYG surface only.

## Implement Your Own Source Toggle

`Editor` is intentionally focused on rich-text editing. If you need a source view, keep a single shared `value` state and switch between `Editor` and your own text input.

```tsx
import { useState } from "react";
import { Editor } from "@/components/ui/editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type View = "editor" | "source";

export function EditorWithSourceToggle() {
  const [view, setView] = useState<View>("editor");
  const [value, setValue] = useState("");

  return (
    <Tabs value={view} onValueChange={(next) => setView(next as View)} className="w-full">
      <TabsList>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="source">Source</TabsTrigger>
      </TabsList>
      <TabsContent value="editor">
        <Editor
          value={value}
          onChange={setValue}
          format="markdown"
        />
      </TabsContent>
      <TabsContent value="source">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-64 font-mono"
        />
      </TabsContent>
    </Tabs>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `""` | Current editor content. |
| `onChange` | `(value: string) => void` | - | Called whenever content changes. |
| `format` | `"markdown" \| "html"` | `"html"` | Parsing and output format. |
| `disabled` | `boolean` | `false` | Disables editing and toolbar actions. |
| `className` | `string` | - | Extra classes for the root wrapper (`cn-editor`). |
| `editorClassName` | `string` | - | Extra classes for the WYSIWYG surface. |
| `...props` | `HTMLAttributes<HTMLDivElement>` | - | Forwarded to the root container. |

## Deploy (Cloudflare Pages)

Use Git integration with these settings:
- Framework preset: `None`
- Root directory: `editor`
- Build command: `npm run build`
- Build output directory: `dist`

This deploys the prerendered static HTML + hydrated React demo.
