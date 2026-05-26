<script setup lang="ts">
import { useComments } from '@/modules/document/composables/useComments';
import { useTimeAgo } from '@/shared/composables/useTimeAgo';

const props = defineProps<{
  documentId: string;
}>();

const { timeAgo } = useTimeAgo();

const {
  comments,
  newComment,
  replyingTo,
  replyContent,
  addComment,
  addReply,
  resolveComment,
  deleteComment,
  isAuthor,
} = useComments(() => props.documentId);
</script>

<template>
  <v-card variant="outlined">
    <v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
      Comments
      <v-chip size="small">{{ comments.length }}</v-chip>
    </v-card-title>

    <v-divider />

    <!-- New Comment -->
    <div class="pa-3">
      <v-textarea
        v-model="newComment"
        variant="outlined"
        density="compact"
        placeholder="Add a comment..."
        rows="2"
        hide-details
        auto-grow
      />
      <div class="d-flex justify-end mt-2">
        <v-btn size="small" color="primary" :disabled="!newComment.trim()" @click="addComment">
          Comment
        </v-btn>
      </div>
    </div>

    <v-divider />

    <!-- Comment List -->
    <v-list v-if="comments.length" class="pa-0">
      <template v-for="comment in comments" :key="comment.id">
        <div class="pa-3" :class="{ 'bg-grey-lighten-4': comment.resolved }">
          <div class="d-flex align-start ga-2">
            <v-avatar color="primary" size="28">
              <span class="text-caption text-white">{{ comment.author.name.charAt(0) }}</span>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="d-flex align-center ga-2">
                <span class="text-body-2 font-weight-medium">{{ comment.author.name }}</span>
                <span class="text-caption text-medium-emphasis">{{
                  timeAgo(comment.createdAt)
                }}</span>
                <v-chip v-if="comment.resolved" size="x-small" color="success" variant="tonal">
                  Resolved
                </v-chip>
              </div>
              <p class="text-body-2 mt-1">{{ comment.content }}</p>

              <!-- Actions -->
              <div class="d-flex ga-2 mt-1">
                <v-btn
                  size="x-small"
                  variant="text"
                  @click="replyingTo = replyingTo === comment.id ? null : comment.id"
                >
                  Reply
                </v-btn>
                <v-btn
                  v-if="!comment.resolved"
                  size="x-small"
                  variant="text"
                  color="success"
                  @click="resolveComment(comment.id)"
                >
                  Resolve
                </v-btn>
                <v-btn
                  v-if="isAuthor(comment)"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="deleteComment(comment.id)"
                >
                  Delete
                </v-btn>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies.length" class="ml-4 mt-2 border-s pl-3">
                <div v-for="reply in comment.replies" :key="reply.id" class="mb-2">
                  <div class="d-flex align-center ga-2">
                    <span class="text-body-2 font-weight-medium">{{ reply.author.name }}</span>
                    <span class="text-caption text-medium-emphasis">{{
                      timeAgo(reply.createdAt)
                    }}</span>
                  </div>
                  <p class="text-body-2">{{ reply.content }}</p>
                </div>
              </div>

              <!-- Reply Input -->
              <div v-if="replyingTo === comment.id" class="mt-2">
                <v-text-field
                  v-model="replyContent"
                  variant="outlined"
                  density="compact"
                  placeholder="Write a reply..."
                  hide-details
                  @keyup.enter="addReply(comment.id)"
                >
                  <template #append-inner>
                    <v-btn
                      icon="mdi-send"
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click="addReply(comment.id)"
                    />
                  </template>
                </v-text-field>
              </div>
            </div>
          </div>
        </div>
        <v-divider />
      </template>
    </v-list>

    <div v-else class="pa-4 text-center text-medium-emphasis text-body-2">No comments yet</div>
  </v-card>
</template>
