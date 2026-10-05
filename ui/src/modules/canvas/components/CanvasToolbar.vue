<script setup lang="ts">
import { inject } from 'vue';
import type { CanvasTool } from '@/modules/canvas/composables/useCanvas';

const canvas = inject<any>('canvas');

interface ToolDef {
  id: CanvasTool;
  icon: string;
  label: string;
}

const tools: ToolDef[] = [
  { id: 'select', icon: 'mdi-cursor-default-outline', label: 'Select' },
  { id: 'rectangle', icon: 'mdi-rectangle-outline', label: 'Rectangle' },
  { id: 'ellipse', icon: 'mdi-circle-outline', label: 'Ellipse' },
  { id: 'arrow', icon: 'mdi-arrow-top-right', label: 'Arrow' },
  { id: 'line', icon: 'mdi-minus', label: 'Line' },
  { id: 'text', icon: 'mdi-format-text', label: 'Text' },
  { id: 'sticky_note', icon: 'mdi-note-outline', label: 'Sticky Note' },
  { id: 'pencil', icon: 'mdi-pencil-outline', label: 'Pencil' },
];
</script>

<template>
  <div
    class="position-absolute d-flex align-center ga-3 pa-2 rounded-pill bg-surface elevation-3 top-4 left-1/2 -translate-x-1/2 z-10"
  >
    <div class="d-flex align-center ga-2">
      <!-- v-btn's flat variant doesn't paint a background for icon-only buttons
           in this Vuetify build, so the active-tool highlight is applied directly. -->
      <v-btn
        v-for="tool in tools"
        :key="tool.id"
        :icon="tool.icon"
        size="small"
        rounded="lg"
        variant="text"
        :color="canvas.activeTool.value === tool.id ? 'primary' : 'default'"
        :class="{
          'bg-vt-primary! text-vt-on-primary!': canvas.activeTool.value === tool.id,
        }"
        @click="canvas.activeTool.value = tool.id"
      >
        <v-icon :icon="tool.icon" />
        <v-tooltip activator="parent" location="bottom">{{ tool.label }}</v-tooltip>
      </v-btn>
    </div>

    <v-divider vertical class="mx-1" />

    <v-btn
      icon="mdi-delete-outline"
      size="small"
      rounded="lg"
      variant="text"
      :disabled="canvas.selectedIds.value.size === 0"
      @click="canvas.deleteSelected()"
    >
      <v-icon icon="mdi-delete-outline" />
      <v-tooltip activator="parent" location="bottom">Delete Selected</v-tooltip>
    </v-btn>
  </div>
</template>
