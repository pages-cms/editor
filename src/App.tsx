import { useState } from "react";
import { type EditorFormat, type EditorMode, Editor } from "./components/ui/editor";

const INITIAL_HTML_VALUE = `
<h1>Editor Demo</h1>
<p>This demo includes headings, lists, links, code, quote, image, and table support.</p>
<h2>Formatting</h2>
<ul>
  <li><strong>Bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>, and <code>inline code</code></li>
  <li><a href="https://tiptap.dev">Link support</a></li>
</ul>
<blockquote>Use the BubbleMenu to apply formatting on selected text.</blockquote>
<pre><code>console.log("Code block support");</code></pre>
<h3>Image</h3>
<p><img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop" alt="Landscape demo image"></p>
<h3>Table</h3>
<table>
  <thead>
    <tr><th>Feature</th><th>Status</th></tr>
  </thead>
  <tbody>
    <tr><td>Markdown output</td><td>Enabled</td></tr>
    <tr><td>HTML output</td><td>Enabled</td></tr>
  </tbody>
</table>
`;
const INITIAL_MARKDOWN_VALUE = `
# Editor Demo

This demo includes headings, lists, links, code, quote, image, and table support.

## Formatting

- **Bold**, *italic*, <u>underline</u>, ~~strike~~, and \`inline code\`
- [Link support](https://tiptap.dev)

> Use the BubbleMenu to apply formatting on selected text.

\`\`\`ts
console.log("Code block support")
\`\`\`

### Image

![Landscape demo image](https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop)

### Table

| Feature | Status |
| --- | --- |
| Markdown output | Enabled |
| HTML output | Enabled |
`;

export default function App() {
  const [format, setFormat] = useState<EditorFormat>("markdown");
  const [mode, setMode] = useState<EditorMode>("wysiwyg");
  const [htmlValue, setHtmlValue] = useState<string>(INITIAL_HTML_VALUE);
  const [markdownValue, setMarkdownValue] = useState<string>(INITIAL_MARKDOWN_VALUE);

  const value = format === "markdown" ? markdownValue : htmlValue;
  const onChange = format === "markdown" ? setMarkdownValue : setHtmlValue;

  return (
    <main className="min-h-screen py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="format-select" className="text-sm font-medium">
            Format
          </label>
          <select
            id="format-select"
            value={format}
            onChange={(event) => setFormat(event.target.value as EditorFormat)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs outline-none"
          >
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
          </select>
          <label htmlFor="mode-select" className="text-sm font-medium">
            Mode
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={(event) => setMode(event.target.value as EditorMode)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs outline-none"
          >
            <option value="wysiwyg">WYSIWYG</option>
            <option value="source">Source</option>
          </select>
        </div>
        <div>
          <Editor value={value} onChange={onChange} format={format} mode={mode} />
        </div>
      </div>
    </main>
  );
}
