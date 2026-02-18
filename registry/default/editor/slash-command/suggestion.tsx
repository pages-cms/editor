import { ReactRenderer } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import CommandsList, { type CommandsListHandle, type SlashItem } from "./commands-list";

type SuggestionProps = {
  editor: Editor;
  range: { from: number; to: number };
  query: string;
  clientRect?: (() => DOMRect | null) | null;
};

const allItems: SlashItem[] = [
  {
    title: "Text",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Image",
    command: ({ editor, range }) => {
      const src = window.prompt("Image URL");
      if (!src) return;
      editor.chain().focus().deleteRange(range).setImage({ src }).run();
    },
  },
  {
    title: "Table",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Quote",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
];

export default {
  items: ({ query }: { query: string }) =>
    allItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10),

  render: () => {
    let component: ReactRenderer<CommandsListHandle> | null = null;
    let popup: TippyInstance | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(CommandsList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;
        const referenceRect = () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0);

        popup = tippy(document.body, {
          getReferenceClientRect: referenceRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate: (props: SuggestionProps) => {
        component?.updateProps(props);
        if (!props.clientRect || !popup) return;
        const referenceRect = () => props.clientRect?.() ?? new DOMRect(0, 0, 0, 0);
        popup.setProps({ getReferenceClientRect: referenceRect });
      },

      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "Escape" && popup) {
          popup.hide();
          return true;
        }

        return component?.ref?.onKeyDown(event) ?? false;
      },

      onExit: () => {
        if (popup) popup.destroy();
        component?.destroy();
      },
    };
  },
};
