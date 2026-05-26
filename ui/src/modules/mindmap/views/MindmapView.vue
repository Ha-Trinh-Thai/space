<template>
  <div class="mindmap-view d-flex flex-column h-100" tabindex="0" @keydown="handleKeydown">
    <!-- Toolbar -->
    <div class="mindmap-toolbar d-flex align-center ga-1 pa-2 border-b">
      <v-text-field
        v-if="currentMindmap"
        v-model="titleEdit"
        variant="plain"
        density="compact"
        hide-details
        class="font-bold"
        style="max-width: 300px"
        @blur="saveTitle"
        @keydown.enter="($event.target as HTMLInputElement)?.blur()"
      />
      <v-spacer />
      <v-tooltip text="Add child (Tab)" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            size="small"
            variant="tonal"
            icon="mdi-plus"
            :disabled="!selectedNodeId"
            @click="addChildToSelected"
          />
        </template>
      </v-tooltip>
      <v-tooltip text="Rename (F2)" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            size="small"
            variant="tonal"
            icon="mdi-pencil-outline"
            :disabled="!selectedNodeId"
            @click="editSelected"
          />
        </template>
      </v-tooltip>
      <v-tooltip text="Delete (Del)" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            size="small"
            variant="tonal"
            color="error"
            icon="mdi-delete-outline"
            :disabled="!selectedNodeId || isRoot"
            @click="deleteSelected"
          />
        </template>
      </v-tooltip>
      <v-divider vertical class="mx-1" />
      <MindmapColorPicker
        v-if="selectedNodeId"
        :node-id="selectedNodeId"
        :current-color="selectedColor"
        @update="updateColor"
      />
    </div>

    <!-- SVG Canvas -->
    <div ref="canvasRef" class="mindmap-canvas flex-grow-1 overflow-auto position-relative">
      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <svg
        v-if="layout.nodes.length"
        :viewBox="viewBox"
        class="mindmap-svg"
        :width="svgWidth"
        :height="svgHeight"
        @click.self="selectNode(null)"
      >
        <!-- Edges -->
        <path
          v-for="edge in layout.edges"
          :key="`${edge.from}-${edge.to}`"
          :d="edgePath(edge)"
          fill="none"
          stroke="#999"
          stroke-width="2"
        />

        <!-- Nodes -->
        <g
          v-for="node in layout.nodes"
          :key="node.id"
          :transform="`translate(${node.x}, ${node.y})`"
          class="mindmap-node"
          :class="{ selected: node.id === selectedNodeId }"
          @click.stop="selectNode(node.id)"
          @dblclick.stop="startEditing(node.id)"
        >
          <rect
            :width="node.width"
            :height="node.height"
            rx="8"
            :fill="node.color"
            :stroke="node.id === selectedNodeId ? '#000' : 'transparent'"
            stroke-width="2"
          />

          <!-- Collapse indicator -->
          <g
            v-if="node.collapsed"
            :transform="`translate(${node.width - 8}, ${node.height / 2})`"
            class="collapse-indicator"
          >
            <circle r="6" fill="#fff" stroke="#999" stroke-width="1" />
            <text text-anchor="middle" dy="4" font-size="10" fill="#666">+</text>
          </g>

          <!-- Label or edit input -->
          <foreignObject
            v-if="editingNodeId === node.id"
            :width="node.width - 16"
            :height="node.height - 8"
            x="8"
            y="4"
          >
            <input
              class="node-edit-input"
              :value="node.label"
              autofocus
              @blur="onEditBlur($event, node.id)"
              @keydown.enter="($event.target as HTMLInputElement)?.blur()"
              @keydown.escape="editingNodeId = null"
            />
          </foreignObject>
          <text
            v-else
            :x="node.width / 2"
            :y="node.height / 2"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#fff"
            font-size="13"
            font-weight="500"
          >
            {{ truncate(node.label, 20) }}
          </text>
        </g>
      </svg>

      <!-- Empty state -->
      <div v-else-if="!loading" class="d-flex align-center justify-center h-100">
        <p class="text-grey">Loading mindmap...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMindmap, type LayoutEdge } from '@/modules/mindmap/composables/useMindmap';
import MindmapColorPicker from '@/modules/mindmap/components/MindmapColorPicker.vue';
import { useMindmapStore } from '@/modules/mindmap/store';

const {
  currentMindmap,
  loading,
  layout,
  selectedNodeId,
  editingNodeId,
  selectNode,
  startEditing,
  addChild,
  updateLabel,
  updateColor,
  deleteNode,
  handleKeydown,
} = useMindmap();

const canvasRef = ref<HTMLElement | null>(null);
const titleEdit = ref('');

watch(
  () => currentMindmap.value?.title,
  (t) => {
    titleEdit.value = t ?? '';
  },
  { immediate: true },
);

// ─── SVG sizing ─────────────────────────────────────

const PADDING = 60;

const svgWidth = computed(() => {
  if (!layout.value.nodes.length) return 800;
  const maxX = Math.max(...layout.value.nodes.map((n) => n.x + n.width));
  return maxX + PADDING;
});

const svgHeight = computed(() => {
  if (!layout.value.nodes.length) return 600;
  const maxY = Math.max(...layout.value.nodes.map((n) => n.y + n.height));
  return maxY + PADDING;
});

const viewBox = computed(() => {
  const minX = layout.value.nodes.length ? Math.min(...layout.value.nodes.map((n) => n.x)) - 20 : 0;
  const minY = layout.value.nodes.length ? Math.min(...layout.value.nodes.map((n) => n.y)) - 20 : 0;
  return `${minX} ${minY} ${svgWidth.value - minX} ${svgHeight.value - minY}`;
});

// ─── Edge path ──────────────────────────────────────

function edgePath(edge: LayoutEdge): string {
  const pts = edge.points;
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) {
    d += ` L ${pts[1].x} ${pts[1].y}`;
  } else {
    // Use cubic bezier through points
    for (let i = 1; i < pts.length - 1; i += 2) {
      const cp = pts[i];
      const end = pts[i + 1] ?? pts[i];
      d += ` Q ${cp.x} ${cp.y} ${end.x} ${end.y}`;
    }
  }
  return d;
}

// ─── Helpers ────────────────────────────────────────

const selectedColor = computed(() => {
  const node = layout.value.nodes.find((n) => n.id === selectedNodeId.value);
  return node?.color ?? '#1976d2';
});

const isRoot = computed(() => {
  const node = layout.value.nodes.find((n) => n.id === selectedNodeId.value);
  return !node?.parentId;
});

function addChildToSelected() {
  if (selectedNodeId.value) addChild(selectedNodeId.value);
}

function editSelected() {
  if (selectedNodeId.value) startEditing(selectedNodeId.value);
}

function deleteSelected() {
  if (selectedNodeId.value && !isRoot.value) deleteNode(selectedNodeId.value);
}

function saveTitle() {
  if (currentMindmap.value && titleEdit.value !== currentMindmap.value.title) {
    useMindmapStore().updateMindmap(currentMindmap.value.id, { title: titleEdit.value });
  }
}

function onEditBlur(e: Event, nodeId: string) {
  const value = (e.target as HTMLInputElement).value.trim();
  if (value) updateLabel(nodeId, value);
  editingNodeId.value = null;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}
</script>

<style scoped>
.mindmap-view:focus {
  outline: none;
}
.mindmap-toolbar {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.mindmap-canvas {
  background-color: #f8fafc;
  background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
  background-size: 24px 24px;
}
.mindmap-node {
  cursor: pointer;
  transition: all 0.15s ease;
}
.mindmap-node:hover {
  filter: brightness(1.1);
}
.mindmap-node.selected rect {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.4));
}
.collapse-indicator {
  cursor: pointer;
}
.node-edit-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 13px;
  text-align: center;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.3);
}
</style>
