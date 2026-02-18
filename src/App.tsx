import { Github, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml, type BundledLanguage } from "shiki";
import { type EditorMode, Editor } from "./components/ui/editor";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

const THEME_STORAGE_KEY = "page-editor-theme";

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

  if (!html) {
    return (
      <pre className="bg-accent dark:bg-accent/50 relative mt-4 rounded-lg p-4 text-sm whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="bg-accent dark:bg-accent/50 mt-4 overflow-hidden rounded-lg [&_pre]:m-0 [&_pre]:rounded-[inherit] [&_pre]:bg-accent! dark:[&_pre]:bg-accent/50! [&_pre]:p-4 [&_pre]:text-sm [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function App() {
  const inlineCodeClass =
    "bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none";
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
    <main className="min-h-screen text-sm">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-12 md:px-6">
        <section className="space-y-2">
          <div className="flex flex-wrap items-start gap-2">
            <h1 className="order-2 w-full scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl md:order-1 md:w-auto">
              Page Editor
            </h1>
            <div className="order-1 ml-auto flex items-center gap-2 md:order-2">
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
          </div>
          <p className="text-[1.05rem] sm:text-base sm:text-balance md:max-w-[80%] text-muted-foreground">
            A simple, Notion-like WYSIWYG editor component for shadcn/ui. Built with TipTap, ProseMirror, and React,
            and originally developed for Pages CMS.
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
            code={"npx shadcn@latest add https://raw.githubusercontent.com/pages-cms/editor/main/public/r/editor.json"}
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
      format="markdown"
      mode="wysiwyg"
    />
  )
}`}
          />
          <p className="mt-4">
            The demo uses Markdown by default. Set <code className={inlineCodeClass}>format="html"</code> if your
            application stores HTML.
          </p>

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Options
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            <code className={inlineCodeClass}>Editor</code> is a controlled component. The props below define content
            format, mode, and source synchronization behavior.
          </p>
          <ul className="my-4 ml-6 list-disc [&>li]:mt-3">
            <li>
              <code className={inlineCodeClass}>value?: string</code> current editor content. Defaults to{" "}
              <code className={inlineCodeClass}>""</code>.
            </li>
            <li>
              <code className={inlineCodeClass}>onChange?: (value: string) =&gt; void</code> called whenever content
              changes.
            </li>
            <li>
              <code className={inlineCodeClass}>format?: "markdown" | "html"</code> parsing and output format. Defaults
              to <code className={inlineCodeClass}>"html"</code>.
            </li>
            <li>
              <code className={inlineCodeClass}>mode?: "wysiwyg" | "source"</code> active editor mode. Defaults to{" "}
              <code className={inlineCodeClass}>"wysiwyg"</code>.
            </li>
            <li>
              <code className={inlineCodeClass}>disabled?: boolean</code> disables editing and toolbar interactions.
            </li>
            <li>
              <code className={inlineCodeClass}>sourceDebounceMs?: number</code> debounce delay for source text
              synchronization. Defaults to <code className={inlineCodeClass}>500</code>.
            </li>
            <li>
              Standard <code className={inlineCodeClass}>div</code> attributes are also accepted via{" "}
              <code className={inlineCodeClass}>HTMLAttributes&lt;HTMLDivElement&gt;</code>.
            </li>
          </ul>

          <h3 className="font-heading mt-12 scroll-m-28 text-lg font-medium tracking-tight [&+p]:mt-4! *:[code]:text-xl">
            Hooks
          </h3>
          <p className="leading-relaxed [&:not(:first-child)]:mt-6">
            Use these hooks when you need to transform content during mode transitions.
          </p>
          <ul className="my-4 ml-6 list-disc [&>li]:mt-3">
            <li>
              <code className={inlineCodeClass}>
                onSwitchToSource?: (value, format) =&gt; string | Promise&lt;string&gt;
              </code>{" "}
              runs when entering source mode.
            </li>
            <li>
              <code className={inlineCodeClass}>
                onSwitchToEditor?: (value, format) =&gt; string | Promise&lt;string&gt;
              </code>{" "}
              runs when returning to WYSIWYG mode.
            </li>
            <li>
              Both hooks receive the current <code className={inlineCodeClass}>value</code> and{" "}
              <code className={inlineCodeClass}>format</code> and can return transformed content (sync or async).
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
