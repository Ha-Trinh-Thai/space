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
  { id: 'pan', icon: 'mdi-hand-back-right-outline', label: 'Pan' },
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
  <div class="canvas-toolbar d-flex align-center justify-center ga-1 pa-2 border-b">
    <v-btn-group density="compact" variant="flat">
      <v-btn
        v-for="tool in tools"
        :key="tool.id"
        :icon="tool.icon"
        size="small"
        :color="canvas.activeTool.value === tool.id ? 'primary' : 'default'"
        :variant="canvas.activeTool.value === tool.id ? 'flat' : 'text'"
        @click="canvas.activeTool.value = tool.id"
      >
        <v-icon :icon="tool.icon" />
        <v-tooltip activator="parent" location="bottom">{{ tool.label }}</v-tooltip>
      </v-btn>
    </v-btn-group>

    <v-divider vertical class="mx-2" />

    <v-btn-group density="compact" variant="text">
      <v-btn
        icon="mdi-grid"
        size="small"
        :color="canvas.showGrid.value ? 'primary' : 'default'"
        @click="canvas.showGrid.value = !canvas.showGrid.value"
      >
        <v-icon icon="mdi-grid" />
        <v-tooltip activator="parent" location="bottom">Toggle Grid</v-tooltip>
      </v-btn>
      <v-btn
        icon="mdi-magnet"
        size="small"
        :color="canvas.snapToGrid.value ? 'primary' : 'default'"
        @click="canvas.snapToGrid.value = !canvas.snapToGrid.value"
      >
        <v-icon icon="mdi-magnet" />
        <v-tooltip activator="parent" location="bottom">Snap to Grid</v-tooltip>
      </v-btn>
    </v-btn-group>

    <v-divider vertical class="mx-2" />

    <v-btn
      icon="mdi-delete-outline"
      size="small"
      variant="text"
      :disabled="canvas.selectedIds.value.size === 0"
      @click="canvas.deleteSelected()"
    >
      <v-icon icon="mdi-delete-outline" />
      <v-tooltip activator="parent" location="bottom">Delete Selected</v-tooltip>
    </v-btn>
  </div>
</template>
