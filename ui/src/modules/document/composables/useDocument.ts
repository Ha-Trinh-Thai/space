import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDocumentStore } from '@/modules/document/store';
import { useRouteParam } from '@/shared/composables/useRouteParam';
import { useAutoSave } from '@/shared/composables/useAutoSave';
import { useToastStore } from '@/shared/stores/toast';

export function useDocument() {
  const router = useRouter();
  const documentStore = useDocumentStore();
  const toast = useToastStore();

  const { currentDocument, tree, favorites, loading } = storeToRefs(documentStore);

  const documentId = useRouteParam('documentId');
  const workspaceId = useRouteParam('workspaceId');

  watch(
    documentId,
    (id) => {
      if (id) documentStore.fetchDocument(id);
    },
    { immediate: true },
  );

  const { saving, trigger: autoSaveContent } = useAutoSave(async (content: any) => {
    if (documentId.value) {
      await documentStore.updateDocument(documentId.value, { content });
    }
  });

  async function updateTitle(title: string) {
    if (!documentId.value) return;
    if (title !== currentDocument.value?.title) {
      await documentStore.updateDocument(documentId.value, { title });
    }
  }

  async function toggleFavorite() {
    if (!currentDocument.value || !documentId.value) return;
    const isFavorite = !currentDocument.value.isFavorite;
    await documentStore.updateDocument(documentId.value, { isFavorite });
    toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
  }

  function navigateToDocument(id: string) {
    router.push({
      name: 'document',
      params: { workspaceId: workspaceId.value, documentId: id },
    });
  }

  async function createPage(parentId?: string) {
    if (!workspaceId.value) return;
    const doc = await documentStore.createDocument(workspaceId.value, parentId);
    navigateToDocument(doc.id);
  }

  return {
    documentId,
    workspaceId,
    currentDocument,
    tree,
    favorites,
    loading,
    saving,
    autoSaveContent,
    updateTitle,
    toggleFavorite,
    navigateToDocument,
    createPage,
  };
}
