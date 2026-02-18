import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import suggestion from "./suggestion";

const SlashCommands = Extension.create({
  name: "slash-commands",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        ...suggestion,
      }),
    ];
  },
});

export default SlashCommands;
