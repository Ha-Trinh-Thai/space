<template>
  <v-menu :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-btn v-bind="props" size="small" variant="text" icon>
        <v-icon :color="currentColor">mdi-palette</v-icon>
      </v-btn>
    </template>
    <v-card class="pa-2">
      <div class="d-flex flex-wrap gap-1" style="max-width: 200px">
        <v-btn
          v-for="color in colors"
          :key="color"
          size="x-small"
          icon
          :style="{ backgroundColor: color }"
          class="color-swatch"
          @click="$emit('update', nodeId, color)"
        />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
defineProps<{
  nodeId: string;
  currentColor: string;
}>();

defineEmits<{
  update: [nodeId: string, color: string];
}>();

const colors = [
  '#1976d2',
  '#388e3c',
  '#d32f2f',
  '#f57c00',
  '#7b1fa2',
  '#0097a7',
  '#455a64',
  '#c2185b',
  '#512da8',
  '#00796b',
  '#e64a19',
  '#5d4037',
];
</script>

<style scoped>
.color-swatch {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  border-radius: 50%;
  border: 2px solid transparent;
}
.color-swatch:hover {
  border-color: #333;
}
</style>
