export const CLASS_COLORS = [
  '#22c55e', // green
  '#eab308', // yellow
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
];

export interface TreeNode {
  id: number;
  feature: number;
  threshold: number;
  left: number;
  right: number;
  value: number[];
}

export interface LayoutNode {
  id: number;
  x: number;
  y: number;
  node: TreeNode;
}

export interface LayoutEdge {
  fromId: number;
  toId: number;
  direction: 'left' | 'right';
}

export function isLeaf(node: TreeNode) {
  return node.feature === -2;
}

export function computeTreeLayout(nodes: TreeNode[]): { layoutNodes: LayoutNode[], edges: LayoutEdge[] } {
  const layoutNodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const NODE_Y_GAP = 100;
  const MIN_X_GAP = 70;

  let xCounter = 0;

  function inOrder(nodeId: number, depth: number) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (!isLeaf(node)) {
      inOrder(node.left, depth + 1);
    }

    layoutNodes.push({
      id: node.id,
      x: xCounter * MIN_X_GAP,
      y: depth * NODE_Y_GAP,
      node,
    });
    xCounter++;

    if (!isLeaf(node)) {
      edges.push({ fromId: node.id, toId: node.left, direction: 'left' });
      edges.push({ fromId: node.id, toId: node.right, direction: 'right' });
      inOrder(node.right, depth + 1);
    }
  }

  inOrder(0, 0);

  return { layoutNodes, edges };
}
