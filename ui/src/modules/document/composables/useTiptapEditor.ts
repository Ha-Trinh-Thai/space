import { onBeforeUnmount } from 'vue';
import { useEditor as useTiptapEditor } from '@tiptap/vue-3';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import { TableKit } from '@tiptap/extension-table/kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

const INDENT_STEP = 24;
const MAX_INDENT = 8;

// Tab/Shift-Tab indent a plain paragraph or heading (Google Docs style), rendered
// as margin-left. List items, task items and table cells already own Tab via
// their own extensions, so this backs off (returns false) inside those.
const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const margin = parseInt(element.style.marginLeft, 10);
              return Number.isNaN(margin) ? 0 : Math.round(margin / INDENT_STEP);
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return { style: `margin-left: ${attributes.indent * INDENT_STEP}px` };
            },
          },
        },
      },
    ];
  },

  addKeyboardShortcuts() {
    const changeIndent = (delta: number) => () => {
      if (this.editor.isActive('listItem') || this.editor.isActive('taskItem')) return false;
      if (this.editor.isActive('tableCell') || this.editor.isActive('tableHeader')) return false;

      const node = this.editor.state.selection.$from.parent;
      if (!['paragraph', 'heading'].includes(node.type.name)) return false;

      const current = node.attrs.indent || 0;
      const next = Math.min(MAX_INDENT, Math.max(0, current + delta));
      if (next !== current) {
        this.editor.commands.updateAttributes(node.type.name, { indent: next });
      }
      return true;
    };

    return {
      Tab: changeIndent(1),
      'Shift-Tab': changeIndent(-1),
    };
  },
});

interface EditorOptions {
  content?: any;
  editable?: boolean;
  onUpdate?: (content: any) => void;
}

export function useTiptapEditorSetup(options: EditorOptions) {
  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({
        placeholder: 'Start typing or press / for commands...',
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      TableKit.configure({ table: { resizable: true } }),
      CodeBlockLowlight.configure({ lowlight }),
      Indent,
    ],
    editable: options.editable !== false,
    content: options.content || '',
    onUpdate: ({ editor: e }) => {
      options.onUpdate?.(e.getJSON());
    },
  });

  function syncContent(val: any) {
    if (!editor.value) return;
    // Skip while focused: an incoming update here is just our own edit echoing back
    // through the autosave round-trip, and replacing content would reset the cursor.
    if (editor.value.isFocused) return;
    const current = JSON.stringify(editor.value.getJSON());
    const incoming = JSON.stringify(val);
    if (current !== incoming) {
      editor.value.commands.setContent(val || '');
    }
  }

  function setEditable(val: boolean) {
    editor.value?.setEditable(val);
  }

  onBeforeUnmount(() => {
    editor.value?.destroy();
  });

  return { editor, syncContent, setEditable };
}
