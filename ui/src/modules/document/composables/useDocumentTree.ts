import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDocumentStore } from '@/modules/document/store';
import { useDebounceFn } from '@/shared/composables/useDebounce';

export function useDocumentTree(workspaceId: () => string) {
  const router = useRouter();
  const documentStore = useDocumentStore();
  const { tree, favorites } = storeToRefs(documentStore);

  const expandedIds = ref<Set<string>>(new Set());
  const searchQuery = ref('');
  const searchResults = ref<any[]>([]);
  const searching = ref(false);

  watch(
    workspaceId,
    (id) => {
      if (id) {
        documentStore.fetchTree(id);
        documentStore.fetchFavorites(id);
      }
    },
    { immediate: true },
  );

  const { debounced: performSearch } = useDebounceFn(async (query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      searching.value = false;
      return;
    }
    searchResults.value = await documentStore.searchDocuments(workspaceId(), query);
    searching.value = false;
  }, 300);

  watch(searchQuery, (q) => {
    if (!q.trim()) {
      searchResults.value = [];
      searching.value = false;
      return;
    }
    searching.value = true;
    performSearch(q);
  });

  function toggle(id: string) {
    if (expandedIds.value.has(id)) {
      expandedIds.value.delete(id);
    } else {
      expandedIds.value.add(id);
    }
  }

  function openDocument(id: string) {
    router.push({
      name: 'document',
      params: { workspaceId: workspaceId(), documentId: id },
    });
  }

  async function createPage(parentId?: string) {
    const doc = await documentStore.createDocument(workspaceId(), parentId);
    openDocument(doc.id);
  }

  return {
    tree,
    favorites,
    expandedIds,
    searchQuery,
    searchResults,
    searching,
    toggle,
    openDocument,
    createPage,
  };
}
