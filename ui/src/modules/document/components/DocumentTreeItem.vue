<script setup lang="ts">
import type { DocTreeNode } from '@/modules/document/store';

defineProps<{
  node: DocTreeNode;
  depth: number;
  expandedIds: Set<string>;
  currentDocId?: string;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  select: [id: string];
  create: [parentId: string];
}>();
</script>

<template>
  <div>
    <v-list-item
      :active="currentDocId === node.id"
      :style="{ paddingLeft: `${12 + depth * 16}px` }"
      density="compact"
      @click="emit('select', node.id)"
    >
      <template #prepend>
        <v-btn
          v-if="node.children.length"
          :icon="expandedIds.has(node.id) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
          size="x-small"
          variant="text"
          @click.stop="emit('toggle', node.id)"
        />
        <v-icon v-else icon="mdi-file-document-outline" size="small" class="ml-1" />
      </template>
      <v-list-item-title class="text-body-2">
        {{ node.title || 'Untitled' }}
      </v-list-item-title>
      <template #append>
        <v-btn
          icon="mdi-plus"
          size="x-small"
          variant="text"
          class="opacity-0 tree-item-action"
          @click.stop="emit('create', node.id)"
        />
      </template>
    </v-list-item>

    <!-- Children -->
    <div v-if="expandedIds.has(node.id) && node.children.length">
      <DocumentTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :expanded-ids="expandedIds"
        :current-doc-id="currentDocId"
        @toggle="emit('toggle', $event)"
        @select="emit('select', $event)"
        @create="emit('create', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.v-list-item:hover .tree-item-action {
  opacity: 1 !important;
}
</style>
