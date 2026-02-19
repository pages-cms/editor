import { ArrowUpRight, Check, Copy, Github, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml, type BundledLanguage } from "shiki";
import { type EditorMode, Editor } from "./components/ui/editor";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";

const THEME_STORAGE_KEY = "pages-editor-theme";
const COPY_FEEDBACK_MS = 1500;
const DEFAULT_EDITOR_CONTENT_CSS = `.cn-editor .tiptap > :first-child {
  margin-top: 0;
}

.cn-editor .tiptap > :last-child {
  margin-bottom: 0;
}

.cn-editor .tiptap h1 {
  margin: 2rem 0 0.75rem;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.cn-editor .tiptap h2 {
  margin: 2rem 0 0.75rem;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 0.5rem;
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.3;
}

.cn-editor .tiptap h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.35;
}

.cn-editor .tiptap p {
  line-height: 1.75;
}

.cn-editor .tiptap p + p {
  margin-top: 1rem;
}

.cn-editor .tiptap ul,
.cn-editor .tiptap ol {
  margin: 1rem 0;
  margin-left: 1.5rem;
}

.cn-editor .tiptap ul {
  list-style: disc;
}

.cn-editor .tiptap ol {
  list-style: decimal;
}

.cn-editor .tiptap blockquote {
  margin-top: 1.5rem;
  border-left: 2px solid hsl(var(--border));
  padding-left: 1.5rem;
  font-style: italic;
}

.cn-editor .tiptap a {
  color: hsl(var(--primary));
  font-weight: 500;
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-underline-offset: 4px;
}

.cn-editor .tiptap code {
  border-radius: calc(var(--radius) - 4px);
  background: hsl(var(--muted));
  padding: 0.2rem 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.cn-editor .tiptap pre {
  margin: 1rem 0;
  overflow-x: auto;
  border-radius: var(--radius);
  background: rgb(9 9 11 / 0.95);
  padding: 1rem;
}

.cn-editor .tiptap pre code {
  background: transparent;
  padding: 0;
  color: rgb(250 250 250);
}

.cn-editor .tiptap table {
  margin: 1rem 0;
  width: 100%;
  border-collapse: collapse;
}

.cn-editor .tiptap th,
.cn-editor .tiptap td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.cn-editor .tiptap th {
  background: hsl(var(--muted));
  font-weight: 500;
}
`;

const INITIAL_MARKDOWN_VALUE = `Start writing in Markdown or use the bubble menu in editor mode.

- Inline styles: **bold**, *italic*, <u>underline</u>, ~~strike~~, \`inline code\`
- Block styles: text, headings, lists, quote, code block
- Type "/" for slash commands (image, table, and more)

> Built for Pages CMS and extracted as a reusable shadcn/ui component.

\`\`\`ts
export function hello(name: string) {
  return \`Hello, \${name}\`
}
\`\`\`

![Demo image](https://images.unsplash.com/photo-1542114740389-9b46fb1e5be7?w=1920)
`;

type ThemePreference = "light" | "dark" | null;

type HighlightedCodeProps = {
  code: string;
  lang: BundledLanguage;
  dark: boolean;
};

function HighlightedCode({ code, lang, dark }: HighlightedCodeProps) {
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const theme = dark ? "github-dark" : "github-light";

    void codeToHtml(code, { lang, theme }).then((nextHtml) => {
      if (isMounted) setHtml(nextHtml);
    });

    return () => {
      isMounted = false;
    };
  }, [code, dark, lang]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  };

  const CopyIcon = copied ? Check : Copy;
  const copyButtonLabel = copied ? "Copied" : "Copy";
  const copyButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={copyCode}
          aria-label={copyButtonLabel}
          className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute top-2 right-2 z-10 inline-flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <CopyIcon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>{copyButtonLabel}</TooltipContent>
    </Tooltip>
  );

  if (!html) {
    return (
      <div className="bg-accent dark:bg-accent/50 relative mt-4 overflow-hidden rounded-lg">
        {copyButton}
        <pre className="p-4 pr-12 text-sm whitespace-pre-wrap break-words">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-accent dark:bg-accent/50 relative mt-4 overflow-hidden rounded-lg">
      {copyButton}
      <div
        className="[&_pre]:m-0 [&_pre]:rounded-[inherit] [&_pre]:bg-accent! dark:[&_pre]:bg-accent/50! [&_pre]:p-4 [&_pre]:pr-12 [&_pre]:text-sm [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default function App() {
  const inlineCodeClass =
    "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none";
  const textLinkClass = "font-medium underline underline-offset-4";
  const [mode, setMode] = useState<EditorMode>("wysiwyg");
  const [markdownValue, setMarkdownValue] = useState<string>(INITIAL_MARKDOWN_VALUE);
  const [themePreference, setThemePreference] = useState<ThemePreference>(null);
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") setThemePreference(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setPrefersDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const resolvedTheme = themePreference ?? (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [themePreference, prefersDark]);

  const resolvedIsDark = (themePreference ?? (prefersDark ? "dark" : "light")) === "dark";
  const nextTheme = resolvedIsDark ? "light" : "dark";
  const ThemeIcon = resolvedIsDark ? Sun : Moon;

  const toggleTheme = () => {
    const next = nextTheme;
    setThemePreference(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <TooltipProvider>
      <main className="min-h-screen text-sm">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-8 md:px-6">
        <section className="space-y-2">
          <header className="flex items-center justify-between">
            <Button asChild variant="secondary" size="sm">
              <a href="https://pagescms.org" target="_blank" rel="noreferrer">
                Pages CMS
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <a href="https://github.com/pages-cms/editor" target="_blank" rel="noreferrer">
                  <Github className="size-4" />
                  GitHub
                </a>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label={`Switch to ${nextTheme} theme`}
                title={`Switch to ${nextTheme} theme`}
                onClick={toggleTheme}
                className="size-8 px-0"
              >
                <ThemeIcon className="size-4" />
              </Button>
            </div>
          </header>
          <h1 className="mt-8 scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">Pages Editor</h1>
          <p className="text-[1.05rem] sm:text-base sm:text-balance md:max-w-[80%] text-muted-foreground">
            A simple, Notion-like WYSIWYG editor component for shadcn/ui. Built with TipTap, ProseMirror, and React.
          </p>
        </section>

        <section id="demo" className="space-y-4">
          <h2 className="font-heading [&+]*:[code]:text-xl mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6! [&+p]:mt-4!">
            Demo
          </h2>

          <Tabs value={mode} onValueChange={(value) => setMode(value as EditorMode)} className="w-full">
            <TabsList>
              <TabsTrigger value="wysiwyg">Editor</TabsTrigger>
              <TabsTrigger value="source">Source</TabsTrigger>
            </TabsList>
            <TabsContent value="wysiwyg">
              <Editor value={markdownValue} onChange={setMarkdownValue} format="markdown" mode="wysiwyg" />
            </TabsContent>
            <TabsContent value="source">
              <Editor value={markdownValue} onChange={setMarkdownValue} format="markdown" mode="source" />
            </TabsContent>
          </Tabs>
        </section>

        <section id="documentation">
          <h2 className="font-heading [&+]*:[code]:text-xl mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:mt-0! [&+.steps>h3]:mt-4! [&+h3]:mt-6! [&+p]:mt-4!">
            Documentation
          </h2>

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Install
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            Install this specific component directly from its JSON URL.
          </p>
          <HighlightedCode
            dark={resolvedIsDark}
            lang="bash"
            code={"npx shadcn@latest add https://editor.pagescms.org/r/editor.json"}
          />

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Usage
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            Use controlled state and pass <code className={inlineCodeClass}>format="markdown"</code> or{" "}
            <code className={inlineCodeClass}>format="html"</code> depending on how you store content.
          </p>
          <HighlightedCode
            dark={resolvedIsDark}
            lang="tsx"
            code={`import { useState } from "react"
import { Editor } from "@/components/ui/editor"

export function Example() {
  const [value, setValue] = useState("")

  return (
    <Editor
      value={value}
      onChange={setValue}
    />
  )
}`}
          />
          <p className="mt-4">
            The default format is <code className={inlineCodeClass}>"html"</code>. Set{" "}
            <code className={inlineCodeClass}>format="markdown"</code> if your application stores Markdown.
          </p>

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Optional Mode Switch
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            If you want source mode, control <code className={inlineCodeClass}>mode</code> from your own UI.
          </p>
          <HighlightedCode
            dark={resolvedIsDark}
            lang="tsx"
            code={`import { useState } from "react"
import { Editor } from "@/components/ui/editor"

export function Example() {
  const [mode, setMode] = useState<"wysiwyg" | "source">("wysiwyg")
  const [value, setValue] = useState("")

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
  )
}`}
          />

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Default Content Styles
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            The editor works without these styles, but you can copy this baseline stylesheet to get the same content
            typography as the demo.
          </p>
          <HighlightedCode dark={resolvedIsDark} lang="css" code={DEFAULT_EDITOR_CONTENT_CSS} />

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Options
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            <code className={inlineCodeClass}>Editor</code> is a controlled component. The props below define content
            format, mode, and source synchronization behavior.
          </p>
          <div className="my-6 w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-10 px-2 text-left font-medium">Prop</th>
                  <th className="h-10 px-2 text-left font-medium">Type</th>
                  <th className="h-10 px-2 text-left font-medium">Default</th>
                  <th className="h-10 px-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>value</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>string</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>""</code>
                  </td>
                  <td className="p-2 align-top">Current editor content.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>onChange</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>(value: string) =&gt; void</code>
                  </td>
                  <td className="p-2 align-top">-</td>
                  <td className="p-2 align-top">Called whenever content changes.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>format</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>"markdown" | "html"</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>"html"</code>
                  </td>
                  <td className="p-2 align-top">Parsing and output format.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>mode</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>"wysiwyg" | "source"</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>"wysiwyg"</code>
                  </td>
                  <td className="p-2 align-top">Active editor mode.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>disabled</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>boolean</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>false</code>
                  </td>
                  <td className="p-2 align-top">Disables editing and toolbar actions.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>sourceDebounceMs</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>number</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>500</code>
                  </td>
                  <td className="p-2 align-top">Debounce for source text sync.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>className</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>string</code>
                  </td>
                  <td className="p-2 align-top">-</td>
                  <td className="p-2 align-top">Extra classes for the root wrapper.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>editorClassName</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>string</code>
                  </td>
                  <td className="p-2 align-top">-</td>
                  <td className="p-2 align-top">Extra classes for the WYSIWYG surface.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>sourceClassName</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>string</code>
                  </td>
                  <td className="p-2 align-top">-</td>
                  <td className="p-2 align-top">Extra classes for the source textarea.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>...props</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>HTMLAttributes&lt;HTMLDivElement&gt;</code>
                  </td>
                  <td className="p-2 align-top">-</td>
                  <td className="p-2 align-top">Forwarded to the root container.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Hooks
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            Use these hooks when you need to transform content during mode transitions.
          </p>
          <div className="my-6 w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-10 px-2 text-left font-medium">Hook</th>
                  <th className="h-10 px-2 text-left font-medium">Type</th>
                  <th className="h-10 px-2 text-left font-medium">When it runs</th>
                  <th className="h-10 px-2 text-left font-medium">Return</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>onSwitchToSource</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>
                      (value: string, format: "markdown" | "html") =&gt; string | Promise&lt;string&gt;
                    </code>
                  </td>
                  <td className="p-2 align-top">When switching from WYSIWYG to source mode.</td>
                  <td className="p-2 align-top">Transformed source content.</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>onSwitchToEditor</code>
                  </td>
                  <td className="p-2 align-top">
                    <code className={inlineCodeClass}>
                      (value: string, format: "markdown" | "html") =&gt; string | Promise&lt;string&gt;
                    </code>
                  </td>
                  <td className="p-2 align-top">When switching from source mode back to WYSIWYG.</td>
                  <td className="p-2 align-top">Transformed editor content.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Built by{" "}
          <a href="https://ronanberder.com" target="_blank" rel="noreferrer" className={textLinkClass}>
            Ronan Berder
          </a>{" "}
          for{" "}
          <a href="https://pagescms.org" target="_blank" rel="noreferrer" className={textLinkClass}>
            Pages CMS
          </a>
          .
        </p>
      </div>
      </main>
    </TooltipProvider>
  );
}
