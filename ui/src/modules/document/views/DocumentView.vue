<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDocument } from '@/modules/document/composables/useDocument';
import DocumentEditor from '@/modules/document/components/DocumentEditor.vue';
import DocumentComments from '@/modules/document/components/DocumentComments.vue';

const router = useRouter();
const { documentId, workspaceId, currentDocument, loading, autoSaveContent, updateTitle } =
  useDocument();

function goBackToWorkspace() {
  router.push({
    name: 'workspace',
    params: { workspaceId: workspaceId.value },
    query: { tab: 'documents' },
  });
}

const showComments = ref(false);
const titleInput = ref('');
const titleFieldFocused = ref(false);

watch(
  () => currentDocument.value?.title,
  (title) => {
    if (!titleFieldFocused.value) {
      titleInput.value = title || '';
    }
  },
  { immediate: true },
);

function handleTitleBlur() {
  titleFieldFocused.value = false;
  updateTitle(titleInput.value);
}
</script>

<template>
  <div v-if="currentDocument" class="d-flex flex-column h-full">
    <!-- Document Header -->
    <div class="d-flex align-center justify-space-between pa-4 pb-0 flex-shrink-0">
      <div class="d-flex align-center ga-2 flex-grow-1">
        <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="goBackToWorkspace" />
        <v-text-field
          v-model="titleInput"
          variant="plain"
          density="compact"
          hide-details
          placeholder="Untitled"
          class="text-h4 font-weight-bold [&_.v-field__input]:p-0! [&_.v-field__input]:min-h-0! [&_.v-field__input]:leading-[inherit]! [&_.v-field__input]:[font:inherit]! [&_.v-field__input]:tracking-[inherit]! [&_.v-field__field]:min-h-0!"
          @focus="titleFieldFocused = true"
          @blur="handleTitleBlur"
          @keyup.enter="($event.target as HTMLInputElement)?.blur()"
        />
      </div>
      <div class="d-flex ga-1">
        <v-btn
          icon="mdi-comment-text-outline"
          variant="text"
          size="small"
          @click="showComments = !showComments"
        />
      </div>
    </div>

    <!-- Editor -->
    <div class="pa-4 d-flex ga-4 flex-grow-1 min-h-0 min-w-0">
      <div class="flex-grow-1 min-h-0 min-w-0">
        <DocumentEditor
          :model-value="currentDocument.content"
          :editable="true"
          @update:model-value="autoSaveContent"
        />
      </div>

      <!-- Comments Panel -->
      <v-slide-x-reverse-transition>
        <div v-if="showComments && documentId" class="w-[360px] min-w-[360px]">
          <DocumentComments :document-id="documentId" />
        </div>
      </v-slide-x-reverse-transition>
    </div>
  </div>

  <div v-else-if="loading" class="d-flex justify-center align-center h-[50vh]">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <div v-else class="d-flex justify-center align-center flex-column h-[50vh]">
    <v-icon icon="mdi-file-document-outline" size="64" color="grey" />
    <p class="text-body-1 text-medium-emphasis mt-4">Select a document to start editing</p>
  </div>
</template>
