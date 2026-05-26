import { onBeforeUnmount } from 'vue';
import { useEditor as useTiptapEditor } from '@tiptap/vue-3';
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
    ],
    editable: options.editable !== false,
    content: options.content || '',
    onUpdate: ({ editor: e }) => {
      options.onUpdate?.(e.getJSON());
    },
  });

  function syncContent(val: any) {
    if (!editor.value) return;
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
