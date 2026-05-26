<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDocumentTree } from '@/modules/document/composables/useDocumentTree';

const props = defineProps<{
  workspaceId: string;
}>();

const route = useRoute();
const currentDocId = computed(() => route.params.documentId as string | undefined);

const {
  tree,
  favorites,
  expandedIds,
  searchQuery,
  searchResults,
  toggle,
  openDocument,
  createPage,
} = useDocumentTree(() => props.workspaceId);
</script>

<template>
  <div class="doc-tree">
    <!-- Search -->
    <v-text-field
      v-model="searchQuery"
      density="compact"
      variant="solo-filled"
      flat
      placeholder="Search pages..."
      prepend-inner-icon="mdi-magnify"
      hide-details
      clearable
      class="mx-2 mb-2"
    />

    <!-- Search Results -->
    <v-list v-if="searchQuery && searchResults.length" density="compact" nav>
      <v-list-item
        v-for="result in searchResults"
        :key="result.id"
        :title="result.title"
        prepend-icon="mdi-file-document-outline"
        @click="
          openDocument(result.id);
          searchQuery = '';
        "
      />
    </v-list>

    <template v-else-if="!searchQuery">
      <!-- Favorites -->
      <div v-if="favorites.length" class="px-4 py-1">
        <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">
          Favorites
        </span>
      </div>
      <v-list v-if="favorites.length" density="compact" nav class="py-0">
        <v-list-item
          v-for="fav in favorites"
          :key="fav.id"
          :title="fav.title"
          :prepend-icon="fav.icon || 'mdi-star'"
          :active="currentDocId === fav.id"
          @click="openDocument(fav.id)"
        />
      </v-list>

      <v-divider v-if="favorites.length" class="my-1" />

      <!-- Tree -->
      <div class="d-flex align-center justify-space-between px-4 py-1">
        <span class="text-caption text-medium-emphasis text-uppercase font-weight-medium">
          Pages
        </span>
        <v-btn icon="mdi-plus" size="x-small" variant="text" @click="createPage()" />
      </div>

      <v-list density="compact" nav class="py-0">
        <DocumentTreeItem
          v-for="node in tree"
          :key="node.id"
          :node="node"
          :depth="0"
          :expanded-ids="expandedIds"
          :current-doc-id="currentDocId"
          @toggle="toggle"
          @select="openDocument"
          @create="createPage"
        />
        <v-list-item
          v-if="tree.length === 0"
          title="No pages yet"
          disabled
          class="text-medium-emphasis"
        />
      </v-list>
    </template>
  </div>
</template>
