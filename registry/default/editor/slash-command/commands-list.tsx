import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Editor } from "@tiptap/core";

export type SlashItem = {
  title: string;
  command: (params: { editor: Editor; range: { from: number; to: number } }) => void;
};

type CommandsListProps = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

export type CommandsListHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

const CommandsList = forwardRef<CommandsListHandle, CommandsListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (!items.length) return false;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => (current + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div>
      {items.length ? (
        items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            aria-selected={selectedIndex === index}
          >
            {item.title}
          </button>
        ))
      ) : (
        <div>No results</div>
      )}
    </div>
  );
});

CommandsList.displayName = "CommandsList";

export default CommandsList;
