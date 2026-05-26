import { ref, watch } from 'vue';
import { api } from '@/shared/lib/api';
import { useAuthStore } from '@/modules/auth/store';

interface CommentAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  resolved: boolean;
  anchorId: string | null;
  authorId: string;
  author: CommentAuthor;
  createdAt: string;
  replies: Comment[];
}

export function useComments(documentId: () => string) {
  const auth = useAuthStore();
  const comments = ref<Comment[]>([]);
  const loading = ref(false);
  const newComment = ref('');
  const replyingTo = ref<string | null>(null);
  const replyContent = ref('');

  async function fetchComments() {
    loading.value = true;
    try {
      const res = await api.get<Comment[]>(`/comments/document/${documentId()}`);
      comments.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  watch(documentId, fetchComments, { immediate: true });

  async function addComment() {
    if (!newComment.value.trim()) return;
    await api.post('/comments', {
      content: newComment.value,
      documentId: documentId(),
    });
    newComment.value = '';
    await fetchComments();
  }

  async function addReply(parentId: string) {
    if (!replyContent.value.trim()) return;
    await api.post('/comments', {
      content: replyContent.value,
      documentId: documentId(),
      parentId,
    });
    replyContent.value = '';
    replyingTo.value = null;
    await fetchComments();
  }

  async function resolveComment(id: string) {
    await api.patch(`/comments/${id}`, { resolved: true });
    await fetchComments();
  }

  async function deleteComment(id: string) {
    await api.delete(`/comments/${id}`);
    await fetchComments();
  }

  function isAuthor(comment: Comment) {
    return comment.authorId === auth.user?.id;
  }

  return {
    comments,
    loading,
    newComment,
    replyingTo,
    replyContent,
    addComment,
    addReply,
    resolveComment,
    deleteComment,
    isAuthor,
  };
}
