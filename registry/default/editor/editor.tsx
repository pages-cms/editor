import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Markdown } from "@tiptap/markdown";
import {
  Bold,
  Check,
  ChevronDownIcon,
  Code,
  RemoveFormatting,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  Underline as UnderlineIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import SlashCommands from "./slash-command/commands";

export type EditorFormat = "html" | "markdown";
export type EditorMode = "wysiwyg" | "source";

type EditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  format?: EditorFormat;
  mode?: EditorMode;
  sourceDebounceMs?: number;
  onSwitchToSource?: (value: string, format: EditorFormat) => string | Promise<string>;
  onSwitchToEditor?: (value: string, format: EditorFormat) => string | Promise<string>;
} & Omit<HTMLAttributes<HTMLDivElement>, "onChange">;

type ToggleAction = {
  label: string;
  icon: LucideIcon;
  isActive: () => boolean;
  run: () => void;
  toggle: true;
};

type PlainAction = {
  label: string;
  icon: LucideIcon;
  run: () => void;
  toggle?: false;
};

type MenuAction = ToggleAction | PlainAction;

type IconButtonOptions = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled: boolean;
  toggle?: boolean;
  pressed?: boolean;
  className?: string;
};

type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock";

const blockOptions: Array<{ value: BlockType; label: string }> = [
  { value: "paragraph", label: "Text" },
  { value: "heading1", label: "Heading 1" },
  { value: "heading2", label: "Heading 2" },
  { value: "heading3", label: "Heading 3" },
  { value: "bulletList", label: "Bulleted list" },
  { value: "orderedList", label: "Numbered list" },
  { value: "blockquote", label: "Quote" },
  { value: "codeBlock", label: "Code block" },
];

export function Editor({
  value = "",
  onChange = () => undefined,
  disabled = false,
  format = "html",
  mode = "wysiwyg",
  sourceDebounceMs = 500,
  onSwitchToSource,
  onSwitchToEditor,
  ...props
}: EditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [sourceValue, setSourceValue] = useState("");
  const bubbleMenuRef = useRef<HTMLDivElement>(null);
  const prevModeRef = useRef<EditorMode>(mode);
  const sourceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSourceMode = mode === "source";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        enableClickSelection: true,
        HTMLAttributes: {
          rel: null,
          target: null,
        },
      }),
      Image,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Markdown,
      SlashCommands,
    ],
    content: value || (format === "markdown" ? "" : "<p></p>"),
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: nextEditor }) => {
      onChange(format === "markdown" ? nextEditor.getMarkdown() : nextEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = format === "markdown" ? editor.getMarkdown() : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || (format === "markdown" ? "" : "<p></p>"), {
        emitUpdate: false,
        contentType: format,
      });
    }
  }, [editor, value, format]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !isSourceMode);
  }, [editor, disabled, isSourceMode]);

  useEffect(() => {
    if (!editor) return;

    const wasSource = prevModeRef.current === "source";
    const nowSource = mode === "source";
    prevModeRef.current = mode;

    if (!wasSource && nowSource) {
      const enterSourceMode = async () => {
        const currentValue = format === "markdown" ? editor.getMarkdown() : editor.getHTML();
        const sourceModeValue = onSwitchToSource
          ? await onSwitchToSource(currentValue, format)
          : currentValue;
        setShowLinkInput(false);
        setSourceValue(sourceModeValue);
      };
      void enterSourceMode();
    }

    if (wasSource && !nowSource) {
      const exitSourceMode = async () => {
        if (sourceDebounceRef.current) {
          clearTimeout(sourceDebounceRef.current);
          sourceDebounceRef.current = null;
        }

        const editorModeValue = onSwitchToEditor
          ? await onSwitchToEditor(sourceValue, format)
          : sourceValue;

        if (editorModeValue !== sourceValue) setSourceValue(editorModeValue);
        editor.commands.setContent(editorModeValue, { contentType: format });
      };
      void exitSourceMode();
    }
  }, [editor, mode, format, onSwitchToSource, onSwitchToEditor, sourceValue]);

  useEffect(() => {
    return () => {
      if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showLinkInput || !editor) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const insideBubble = bubbleMenuRef.current?.contains(target) ?? false;
      if (!insideBubble) {
        setShowLinkInput(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [showLinkInput, editor]);

  if (!editor) return null;

  const getBlockType = (): BlockType => {
    if (editor.isActive("heading", { level: 1 })) return "heading1";
    if (editor.isActive("heading", { level: 2 })) return "heading2";
    if (editor.isActive("heading", { level: 3 })) return "heading3";
    if (editor.isActive("bulletList")) return "bulletList";
    if (editor.isActive("orderedList")) return "orderedList";
    if (editor.isActive("blockquote")) return "blockquote";
    if (editor.isActive("codeBlock")) return "codeBlock";
    return "paragraph";
  };

  const setBlockType = (next: BlockType) => {
    const chain = editor.chain().focus();

    switch (next) {
      case "paragraph":
        chain.setParagraph().run();
        break;
      case "heading1":
        chain.setHeading({ level: 1 }).run();
        break;
      case "heading2":
        chain.setHeading({ level: 2 }).run();
        break;
      case "heading3":
        chain.setHeading({ level: 3 }).run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "blockquote":
        chain.toggleBlockquote().run();
        break;
      case "codeBlock":
        chain.toggleCodeBlock().run();
        break;
      default:
        break;
    }
  };

  const inlineActions: MenuAction[] = [
    {
      label: "Bold",
      icon: Bold,
      isActive: () => editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
      toggle: true,
    },
    {
      label: "Italic",
      icon: Italic,
      isActive: () => editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
      toggle: true,
    },
    {
      label: "Underline",
      icon: UnderlineIcon,
      isActive: () => editor.isActive("underline"),
      run: () => editor.chain().focus().toggleUnderline().run(),
      toggle: true,
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      isActive: () => editor.isActive("strike"),
      run: () => editor.chain().focus().toggleStrike().run(),
      toggle: true,
    },
    {
      label: "Code",
      icon: Code,
      isActive: () => editor.isActive("code"),
      run: () => editor.chain().focus().toggleCode().run(),
      toggle: true,
    },
    {
      label: "Remove formatting",
      icon: RemoveFormatting,
      run: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ];

  const openLinkInput = () => {
    if (showLinkInput) {
      setShowLinkInput(false);
      return;
    }
    setLinkUrl(editor.isActive("link") ? (editor.getAttributes("link").href as string) || "" : "");
    setShowLinkInput(true);
  };

  const applyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    setShowLinkInput(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const confirmOrRemoveLink = () => {
    const trimmed = linkUrl.trim();
    if (trimmed || editor.isActive("link")) {
      removeLink();
      return;
    }

    setShowLinkInput(false);
  };

  const onSourceChange = (nextValue: string) => {
    setSourceValue(nextValue);

    if (sourceDebounceRef.current) clearTimeout(sourceDebounceRef.current);
    sourceDebounceRef.current = setTimeout(() => {
      editor.commands.setContent(nextValue, { contentType: format });
      sourceDebounceRef.current = null;
    }, sourceDebounceMs);
  };

  const toolbarButtonClass =
    "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const toolbarToggleButtonClass = `${toolbarButtonClass} aria-pressed:bg-accent aria-pressed:text-accent-foreground`;
  const toolbarSelectClass =
    "border-input bg-background text-foreground h-7 rounded-md border px-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
  const sourceTextareaClass =
    "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-h-16 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

  const renderIconButton = ({
    label,
    icon: Icon,
    onClick,
    disabled,
    toggle = false,
    pressed = false,
    className,
  }: IconButtonOptions) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={toggle ? pressed : undefined}
      className={`${toggle ? toolbarToggleButtonClass : toolbarButtonClass}${className ? ` ${className}` : ""}`}
      title={label}
    >
      <Icon className="size-4" />
    </button>
  );

  return (
    <div {...props}>
      <div>
        {isSourceMode ? (
          <div>
            <label htmlFor="source-editor">Source ({format.toUpperCase()})</label>
            <textarea
              id="source-editor"
              value={sourceValue}
              onChange={(event) => onSourceChange(event.target.value)}
              rows={12}
              disabled={disabled}
              className={sourceTextareaClass}
            />
          </div>
        ) : null}
      </div>
      <BubbleMenu
        pluginKey="editor-bubble"
        ref={bubbleMenuRef}
        editor={editor}
        className="z-50 w-fit max-w-[95vw] text-popover-foreground outline-hidden"
        options={{
          placement: "top",
          offset: 10,
          flip: { padding: 8 },
          shift: { padding: 8 },
        }}
        shouldShow={({ editor: bubbleEditor, from, to, view, element }) => {
          const hasEditorFocus = view.hasFocus() || element.contains(document.activeElement);
          if (!hasEditorFocus) return false;
          return !isSourceMode && (showLinkInput || (!bubbleEditor.state.selection.empty && from !== to));
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="border-border bg-popover flex flex-nowrap items-center gap-0.5 overflow-x-auto rounded-md border p-1 shadow-sm whitespace-nowrap">
            <div className="group/native-select relative w-fit">
              <select
                id="block-style"
                value={getBlockType()}
                onChange={(event) => setBlockType(event.target.value as BlockType)}
                disabled={disabled}
                aria-label="Block style"
                className="h-7 w-full appearance-none rounded-md border border-transparent bg-transparent px-2 pr-8 text-sm shadow-none outline-none hover:bg-accent focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {blockOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 opacity-50"
                aria-hidden="true"
              />
            </div>
            {inlineActions.map((action) =>
              renderIconButton({
                label: action.label,
                icon: action.icon,
                onClick: action.run,
                disabled,
                toggle: Boolean(action.toggle),
                pressed: action.toggle ? action.isActive() : false,
              }),
            )}
            {renderIconButton({
              label: "Link",
              icon: LinkIcon,
              onClick: openLinkInput,
              disabled,
              toggle: true,
              pressed: editor.isActive("link"),
            })}
          </div>
          {showLinkInput ? (
            <div className="border-border bg-popover flex flex-nowrap items-center gap-0.5 overflow-x-auto rounded-md border p-1 shadow-sm whitespace-nowrap">
              <input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                disabled={disabled}
                className={`${toolbarSelectClass} min-w-56 flex-1`}
              />
              {renderIconButton({
                label: "Set link",
                icon: Check,
                onClick: applyLink,
                disabled: disabled || !linkUrl.trim(),
              })}
              {renderIconButton({
                label: "Remove link",
                icon: X,
                onClick: confirmOrRemoveLink,
                disabled,
                className: "ml-auto",
              })}
            </div>
          ) : null}
        </div>
      </BubbleMenu>
      {!isSourceMode ? <EditorContent editor={editor} className="cn-editor" /> : null}
    </div>
  );
}
