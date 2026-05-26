<script setup lang="ts">
import { ref } from 'vue';
import { useDocument } from '@/modules/document/composables/useDocument';
import TiptapEditor from '@/modules/document/components/TiptapEditor.vue';
import DocumentComments from '@/modules/document/components/DocumentComments.vue';

const { documentId, currentDocument, loading, autoSaveContent, updateTitle, toggleFavorite } =
  useDocument();

const showComments = ref(false);
const editingTitle = ref(false);
const titleInput = ref('');

function startEditTitle() {
  titleInput.value = currentDocument.value?.title || '';
  editingTitle.value = true;
}

async function saveTitle() {
  editingTitle.value = false;
  await updateTitle(titleInput.value);
}
</script>

<template>
  <div v-if="currentDocument" class="document-page">
    <!-- Document Header -->
    <div class="d-flex align-center justify-space-between pa-4 pb-0">
      <div class="d-flex align-center ga-2 flex-grow-1">
        <div
          v-if="!editingTitle"
          class="d-flex align-center ga-2 cursor-pointer"
          @click="startEditTitle"
        >
          <h1 class="text-h4 font-weight-bold">
            {{ currentDocument.title || 'Untitled' }}
          </h1>
        </div>
        <v-text-field
          v-else
          v-model="titleInput"
          variant="plain"
          density="compact"
          hide-details
          autofocus
          class="text-h4 font-weight-bold"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
        />
      </div>
      <div class="d-flex ga-1">
        <v-btn
          :icon="currentDocument.isFavorite ? 'mdi-star' : 'mdi-star-outline'"
          :color="currentDocument.isFavorite ? 'amber' : 'default'"
          variant="text"
          size="small"
          @click="toggleFavorite"
        />
        <v-btn
          icon="mdi-comment-text-outline"
          variant="text"
          size="small"
          @click="showComments = !showComments"
        />
      </div>
    </div>

    <!-- Editor -->
    <div class="pa-4 d-flex ga-4">
      <div class="flex-grow-1">
        <TiptapEditor
          :model-value="currentDocument.content"
          :editable="true"
          @update:model-value="autoSaveContent"
        />
      </div>

      <!-- Comments Panel -->
      <v-slide-x-reverse-transition>
        <div v-if="showComments && documentId" style="width: 360px; min-width: 360px">
          <DocumentComments :document-id="documentId" />
        </div>
      </v-slide-x-reverse-transition>
    </div>
  </div>

  <div v-else-if="loading" class="d-flex justify-center align-center" style="height: 50vh">
    <v-progress-circular indeterminate color="primary" />
  </div>

  <div v-else class="d-flex justify-center align-center flex-column" style="height: 50vh">
    <v-icon icon="mdi-file-document-outline" size="64" color="grey" />
    <p class="text-body-1 text-medium-emphasis mt-4">Select a document to start editing</p>
  </div>
</template>
