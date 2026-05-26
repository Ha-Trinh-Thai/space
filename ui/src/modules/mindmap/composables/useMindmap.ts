import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import dagre from 'dagre';
import { useMindmapStore, type MindmapNodeData } from '@/modules/mindmap/store';
import { useRouteParam } from '@/shared/composables/useRouteParam';

export interface LayoutNode {
  id: string;
  label: string;
  color: string;
  icon: string | null;
  collapsed: boolean;
  parentId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
  points: { x: number; y: number }[];
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;

export function useMindmap() {
  const mindmapStore = useMindmapStore();
  const { currentMindmap, loading } = storeToRefs(mindmapStore);

  const mindmapId = useRouteParam('mindmapId');
  const workspaceId = useRouteParam('workspaceId');

  const selectedNodeId = ref<string | null>(null);
  const editingNodeId = ref<string | null>(null);

  watch(
    mindmapId,
    (id) => {
      if (id) {
        mindmapStore.fetchMindmap(id);
        selectedNodeId.value = null;
        editingNodeId.value = null;
      }
    },
    { immediate: true },
  );

  // ─── Dagre layout ────────────────────────────────────

  const layout = computed(() => {
    const tree = currentMindmap.value?.tree;
    if (!tree || tree.length === 0) return { nodes: [], edges: [] };

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 20, ranksep: 80, marginx: 40, marginy: 40 });
    g.setDefaultEdgeLabel(() => ({}));

    // Flatten tree and add nodes/edges
    const flatNodes: MindmapNodeData[] = [];
    function flatten(nodes: MindmapNodeData[]) {
      for (const node of nodes) {
        flatNodes.push(node);
        const w = Math.max(NODE_WIDTH, node.label.length * 9 + 32);
        g.setNode(node.id, { width: w, height: NODE_HEIGHT });
        if (node.parentId) {
          g.setEdge(node.parentId, node.id);
        }
        if (!node.collapsed && node.children.length) {
          flatten(node.children);
        }
      }
    }
    flatten(tree);

    dagre.layout(g);

    const layoutNodes: LayoutNode[] = flatNodes.map((n) => {
      const pos = g.node(n.id);
      return {
        id: n.id,
        label: n.label,
        color: n.color,
        icon: n.icon,
        collapsed: n.collapsed,
        parentId: n.parentId,
        x: pos.x - pos.width / 2,
        y: pos.y - pos.height / 2,
        width: pos.width,
        height: pos.height,
      };
    });

    const layoutEdges: LayoutEdge[] = g.edges().map((e) => {
      const edge = g.edge(e);
      return {
        from: e.v,
        to: e.w,
        points: edge.points,
      };
    });

    return { nodes: layoutNodes, edges: layoutEdges };
  });

  // ─── Selection ────────────────────────────────────────

  function selectNode(id: string | null) {
    selectedNodeId.value = id;
    editingNodeId.value = null;
  }

  function startEditing(id: string) {
    selectedNodeId.value = id;
    editingNodeId.value = id;
  }

  // ─── Node operations ─────────────────────────────────

  async function addChild(parentId: string) {
    if (!mindmapId.value) return;
    const node = await mindmapStore.addNode(mindmapId.value, { parentId });
    selectedNodeId.value = node.id;
    editingNodeId.value = node.id;
  }

  async function addSibling(nodeId: string) {
    const node = findNodeInTree(currentMindmap.value?.tree ?? [], nodeId);
    if (!node || !node.parentId || !mindmapId.value) return;
    const newNode = await mindmapStore.addNode(mindmapId.value, { parentId: node.parentId });
    selectedNodeId.value = newNode.id;
    editingNodeId.value = newNode.id;
  }

  async function updateLabel(nodeId: string, label: string) {
    await mindmapStore.updateNode(nodeId, { label });
    editingNodeId.value = null;
  }

  async function updateColor(nodeId: string, color: string) {
    await mindmapStore.updateNode(nodeId, { color });
  }

  async function toggleCollapse(nodeId: string) {
    const node = findNodeInTree(currentMindmap.value?.tree ?? [], nodeId);
    if (node) {
      await mindmapStore.updateNode(nodeId, { collapsed: !node.collapsed });
    }
  }

  async function deleteNode(nodeId: string) {
    await mindmapStore.deleteNode(nodeId);
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null;
    }
  }

  // ─── Keyboard navigation ─────────────────────────────

  function handleKeydown(e: KeyboardEvent) {
    if (editingNodeId.value) return; // Don't handle when editing

    const nodes = layout.value.nodes;
    const selected = selectedNodeId.value;
    if (!selected && nodes.length) {
      // Select root
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
        selectNode(nodes[0].id);
        e.preventDefault();
      }
      return;
    }
    if (!selected) return;

    const current = findNodeInTree(currentMindmap.value?.tree ?? [], selected);
    if (!current) return;

    switch (e.key) {
      case 'Tab': {
        e.preventDefault();
        addChild(selected);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (current.parentId) {
          addSibling(selected);
        }
        break;
      }
      case 'F2': {
        e.preventDefault();
        startEditing(selected);
        break;
      }
      case 'Delete':
      case 'Backspace': {
        if (current.parentId) {
          e.preventDefault();
          deleteNode(selected);
        }
        break;
      }
      case ' ': {
        e.preventDefault();
        toggleCollapse(selected);
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        // Go to first child
        if (!current.collapsed && current.children.length) {
          selectNode(current.children[0].id);
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        // Go to parent
        if (current.parentId) {
          selectNode(current.parentId);
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        navigateSibling(current, 1);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        navigateSibling(current, -1);
        break;
      }
    }
  }

  function navigateSibling(node: MindmapNodeData, direction: number) {
    if (!node.parentId) return;
    const parent = findNodeInTree(currentMindmap.value?.tree ?? [], node.parentId);
    if (!parent) return;
    const idx = parent.children.findIndex((c) => c.id === node.id);
    const next = parent.children[idx + direction];
    if (next) selectNode(next.id);
  }

  // ─── Helpers ──────────────────────────────────────────

  function findNodeInTree(nodes: MindmapNodeData[], id: string): MindmapNodeData | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length) {
        const found = findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  return {
    mindmapId,
    workspaceId,
    currentMindmap,
    loading,
    layout,
    selectedNodeId,
    editingNodeId,
    selectNode,
    startEditing,
    addChild,
    addSibling,
    updateLabel,
    updateColor,
    toggleCollapse,
    deleteNode,
    handleKeydown,
  };
}
