import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDocumentStore } from '@/modules/document/store';
import { useRouteParam } from '@/shared/composables/useRouteParam';
import { useAutoSave } from '@/shared/composables/useAutoSave';

export function useDocument() {
  const router = useRouter();
  const documentStore = useDocumentStore();

  const { currentDocument, tree, loading } = storeToRefs(documentStore);

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
    loading,
    saving,
    autoSaveContent,
    updateTitle,
    navigateToDocument,
    createPage,
  };
}
