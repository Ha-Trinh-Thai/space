<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDocumentStore } from '@/modules/document/store';
import { useDebouncedRef } from '@/shared/composables/useDebounce';

const router = useRouter();
const route = useRoute();
const documentStore = useDocumentStore();

const query = ref('');
const results = ref<{ id: string; title: string; workspaceId: string }[]>([]);
const searching = ref(false);
const showResults = ref(false);

const debouncedQuery = useDebouncedRef(query, 300);

watch(debouncedQuery, async (val) => {
  const workspaceId = route.params.workspaceId as string;
  if (!val || val.length < 2 || !workspaceId) {
    results.value = [];
    return;
  }
  searching.value = true;
  try {
    results.value = await documentStore.searchDocuments(workspaceId, val);
  } finally {
    searching.value = false;
  }
});

function openResult(doc: { id: string; workspaceId: string }) {
  router.push({
    name: 'document',
    params: { workspaceId: doc.workspaceId, documentId: doc.id },
  });
  query.value = '';
  results.value = [];
  showResults.value = false;
}

function onFocus() {
  if (results.value.length) showResults.value = true;
}

function onBlur() {
  setTimeout(() => {
    showResults.value = false;
  }, 200);
}
</script>

<template>
  <div class="app-search" style="position: relative; max-width: 400px; width: 100%">
    <v-text-field
      v-model="query"
      density="compact"
      variant="outlined"
      placeholder="Search documents..."
      prepend-inner-icon="mdi-magnify"
      hide-details
      rounded="lg"
      class="search-input"
      @focus="onFocus"
      @blur="onBlur"
    />

    <v-card
      v-if="showResults && (results.length || searching)"
      class="search-results"
      elevation="8"
      rounded="lg"
    >
      <v-progress-linear v-if="searching" indeterminate color="primary" height="2" />
      <v-list v-if="results.length" density="compact" class="py-1">
        <v-list-item
          v-for="doc in results"
          :key="doc.id"
          :title="doc.title || 'Untitled'"
          prepend-icon="mdi-file-document-outline"
          rounded="lg"
          class="mx-1"
          @click="openResult(doc)"
        />
      </v-list>
      <div
        v-else-if="!searching && query.length >= 2"
        class="pa-4 text-center text-medium-emphasis text-body-2"
      >
        No results found
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  z-index: 100;
  max-height: 320px;
  overflow-y: auto;
}
</style>
