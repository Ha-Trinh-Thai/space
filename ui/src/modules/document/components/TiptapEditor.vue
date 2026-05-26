<script setup lang="ts">
import { watch } from 'vue';
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

defineExpose({ editor });
</script>

<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div
      v-if="editor && editable !== false"
      class="tiptap-toolbar d-flex flex-wrap align-center ga-1 pa-2 border-b"
    >
      <v-btn-group density="compact" variant="text" divided>
        <v-btn
          icon="mdi-format-bold"
          size="small"
          :color="editor.isActive('bold') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBold().run()"
        />
        <v-btn
          icon="mdi-format-italic"
          size="small"
          :color="editor.isActive('italic') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleItalic().run()"
        />
        <v-btn
          icon="mdi-format-underline"
          size="small"
          :color="editor.isActive('underline') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleUnderline().run()"
        />
        <v-btn
          icon="mdi-format-strikethrough"
          size="small"
          :color="editor.isActive('strike') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleStrike().run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn
          icon="mdi-format-header-1"
          size="small"
          :color="editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        />
        <v-btn
          icon="mdi-format-header-2"
          size="small"
          :color="editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        />
        <v-btn
          icon="mdi-format-header-3"
          size="small"
          :color="editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn
          icon="mdi-format-list-bulleted"
          size="small"
          :color="editor.isActive('bulletList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBulletList().run()"
        />
        <v-btn
          icon="mdi-format-list-numbered"
          size="small"
          :color="editor.isActive('orderedList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleOrderedList().run()"
        />
        <v-btn
          icon="mdi-format-list-checks"
          size="small"
          :color="editor.isActive('taskList') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleTaskList().run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn
          icon="mdi-format-quote-close"
          size="small"
          :color="editor.isActive('blockquote') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleBlockquote().run()"
        />
        <v-btn
          icon="mdi-code-tags"
          size="small"
          :color="editor.isActive('codeBlock') ? 'primary' : 'default'"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        />
        <v-btn
          icon="mdi-table"
          size="small"
          @click="
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          "
        />
        <v-btn
          icon="mdi-minus"
          size="small"
          @click="editor.chain().focus().setHorizontalRule().run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn
          icon="mdi-undo"
          size="small"
          :disabled="!editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
        />
        <v-btn
          icon="mdi-redo"
          size="small"
          :disabled="!editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
        />
      </v-btn-group>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="tiptap-content" />
  </div>
</template>

<style lang="scss">
.tiptap-editor {
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  overflow: hidden;
}

.tiptap-toolbar {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.tiptap-content {
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

        label {
          margin-top: 2px;
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

    table {
      border-collapse: collapse;
      width: 100%;

      td,
      th {
        border: 1px solid rgb(var(--v-theme-outline-variant));
        padding: 6px 10px;
        min-width: 80px;
      }

      th {
        background: rgba(var(--v-theme-primary), 0.05);
        font-weight: 600;
      }
    }

    hr {
      border: none;
      border-top: 1px solid rgb(var(--v-theme-outline-variant));
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
