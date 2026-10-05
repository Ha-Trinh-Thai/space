<script setup lang="ts">
import { ref, watch } from 'vue';
import { EditorContent } from '@tiptap/vue-3';
import { useTiptapEditorSetup } from '@/modules/document/composables/useTiptapEditor';

const props = defineProps<{
  modelValue?: any;
  editable?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const { editor, syncContent, setEditable } = useTiptapEditorSetup({
  content: props.modelValue,
  editable: props.editable,
  onUpdate: (content) => emit('update:modelValue', content),
});

watch(() => props.modelValue, syncContent);
watch(
  () => props.editable,
  (val) => setEditable(val !== false),
);

const showTableMenu = ref(false);
const tableMenuTarget = ref<[number, number]>([0, 0]);

function onEditorContextMenu(event: MouseEvent) {
  if (!editor.value) return;
  const cell = (event.target as HTMLElement).closest('td, th');
  if (!cell) return;

  event.preventDefault();

  const coords = editor.value.view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (coords) {
    editor.value.commands.setTextSelection(coords.pos);
  }

  tableMenuTarget.value = [event.clientX, event.clientY];
  showTableMenu.value = true;
}

function runTableCommand(
  command:
    | 'addRowBefore'
    | 'addRowAfter'
    | 'deleteRow'
    | 'addColumnBefore'
    | 'addColumnAfter'
    | 'deleteColumn',
) {
  editor.value?.chain().focus()[command]().run();
  showTableMenu.value = false;
}

defineExpose({ editor });
</script>

<template>
  <div class="flex flex-col h-full border border-vt-on-surface/12 rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div
      v-if="editor && editable !== false"
      class="d-flex flex-wrap align-center ga-2 pa-2 shrink-0 bg-vt-surface shadow-[0_1px_0_color-mix(in_srgb,var(--color-vt-on-surface)_8%,transparent)]"
    >
      <div class="d-flex align-center ga-3 bg-vt-on-surface/[.045] rounded-[10px] p-1">
        <v-btn
          icon="mdi-format-bold"
          size="small"
          :variant="editor.isActive('bold') ? 'tonal' : 'text'"
          :color="editor.isActive('bold') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBold().run()"
        />
        <v-btn
          icon="mdi-format-italic"
          size="small"
          :variant="editor.isActive('italic') ? 'tonal' : 'text'"
          :color="editor.isActive('italic') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleItalic().run()"
        />
        <v-btn
          icon="mdi-format-underline"
          size="small"
          :variant="editor.isActive('underline') ? 'tonal' : 'text'"
          :color="editor.isActive('underline') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleUnderline().run()"
        />
        <v-btn
          icon="mdi-format-strikethrough"
          size="small"
          :variant="editor.isActive('strike') ? 'tonal' : 'text'"
          :color="editor.isActive('strike') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleStrike().run()"
        />
      </div>

      <div class="d-flex align-center ga-3 bg-vt-on-surface/[.045] rounded-[10px] p-1">
        <v-btn
          icon="mdi-format-header-1"
          size="small"
          :variant="editor.isActive('heading', { level: 1 }) ? 'tonal' : 'text'"
          :color="editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        />
        <v-btn
          icon="mdi-format-header-2"
          size="small"
          :variant="editor.isActive('heading', { level: 2 }) ? 'tonal' : 'text'"
          :color="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        />
        <v-btn
          icon="mdi-format-header-3"
          size="small"
          :variant="editor.isActive('heading', { level: 3 }) ? 'tonal' : 'text'"
          :color="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        />
      </div>

      <div class="d-flex align-center ga-3 bg-vt-on-surface/[.045] rounded-[10px] p-1">
        <v-btn
          icon="mdi-format-list-bulleted"
          size="small"
          :variant="editor.isActive('bulletList') ? 'tonal' : 'text'"
          :color="editor.isActive('bulletList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBulletList().run()"
        />
        <v-btn
          icon="mdi-format-list-numbered"
          size="small"
          :variant="editor.isActive('orderedList') ? 'tonal' : 'text'"
          :color="editor.isActive('orderedList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleOrderedList().run()"
        />
        <v-btn
          icon="mdi-format-list-checks"
          size="small"
          :variant="editor.isActive('taskList') ? 'tonal' : 'text'"
          :color="editor.isActive('taskList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleTaskList().run()"
        />
      </div>

      <div class="d-flex align-center ga-3 bg-vt-on-surface/[.045] rounded-[10px] p-1">
        <v-btn
          icon="mdi-format-quote-close"
          size="small"
          :variant="editor.isActive('blockquote') ? 'tonal' : 'text'"
          :color="editor.isActive('blockquote') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBlockquote().run()"
        />
        <v-btn
          icon="mdi-code-tags"
          size="small"
          :variant="editor.isActive('codeBlock') ? 'tonal' : 'text'"
          :color="editor.isActive('codeBlock') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        />
        <v-btn
          icon="mdi-table"
          size="small"
          variant="text"
          @click="
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          "
        />
        <v-btn
          icon="mdi-minus"
          size="small"
          variant="text"
          @click="editor.chain().focus().setHorizontalRule().run()"
        />
      </div>
    </div>

    <!-- Editor Content -->
    <EditorContent
      :editor="editor"
      class="editor-content min-h-0 overflow-y-auto [flex:1_1_auto]"
      @contextmenu="onEditorContextMenu"
    />

    <!-- Table Context Menu -->
    <v-menu v-model="showTableMenu" :target="tableMenuTarget">
      <v-list density="compact">
        <v-list-item
          prepend-icon="mdi-table-row-plus-before"
          title="Add row before"
          @click="runTableCommand('addRowBefore')"
        />
        <v-list-item
          prepend-icon="mdi-table-row-plus-after"
          title="Add row after"
          @click="runTableCommand('addRowAfter')"
        />
        <v-list-item
          prepend-icon="mdi-table-row-remove"
          title="Remove row"
          @click="runTableCommand('deleteRow')"
        />
        <v-divider class="my-1" />
        <v-list-item
          prepend-icon="mdi-table-column-plus-before"
          title="Add column before"
          @click="runTableCommand('addColumnBefore')"
        />
        <v-list-item
          prepend-icon="mdi-table-column-plus-after"
          title="Add column after"
          @click="runTableCommand('addColumnAfter')"
        />
        <v-list-item
          prepend-icon="mdi-table-column-remove"
          title="Remove column"
          @click="runTableCommand('deleteColumn')"
        />
      </v-list>
    </v-menu>
  </div>
</template>

<style lang="scss">
.editor-content {
  .tiptap {
    padding: 16px 24px;
    min-height: 400px;
    outline: none;

    > * + * {
      margin-top: 0.75em;
    }

    h1,
    h2,
    h3 {
      font-weight: 700;
    }
    h1 {
      font-size: 1.75rem;
    }
    h2 {
      font-size: 1.4rem;
    }
    h3 {
      font-size: 1.15rem;
    }

    ul,
    ol {
      padding-left: 1.5rem;
    }

    ul[data-type='taskList'] {
      list-style: none;
      padding-left: 0;

      li {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;

        > label {
          margin-top: 2px;
          user-select: none;
        }

        > div {
          flex: 1 1 auto;
          min-width: 1px;

          p {
            margin: 0;
          }
        }
      }
    }

    blockquote {
      border-left: 3px solid rgb(var(--v-theme-primary));
      padding-left: 1rem;
      color: rgba(var(--v-theme-on-surface), 0.7);
    }

    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: 6px;
      padding: 12px 16px;
      overflow-x: auto;

      code {
        background: none;
      }
    }

    code {
      background: rgba(var(--v-theme-primary), 0.08);
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.9em;
    }

    .tableWrapper {
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      overflow: hidden;

      td,
      th {
        position: relative;
        border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
        padding: 6px 10px;
        min-width: 80px;
        vertical-align: top;
        box-sizing: border-box;
      }

      th {
        background: rgba(var(--v-theme-primary), 0.05);
        font-weight: 600;
      }

      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: '';
        inset: 0;
        background: rgba(var(--v-theme-primary), 0.15);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: -2px;
        width: 4px;
        z-index: 20;
        background-color: rgb(var(--v-theme-primary));
        pointer-events: none;
      }
    }

    &.resize-cursor {
      cursor: col-resize;
    }

    hr {
      border: none;
      border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
      margin: 1.5rem 0;
    }

    p.is-editor-empty:first-child::before {
      color: rgba(var(--v-theme-on-surface), 0.35);
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
}
</style>
