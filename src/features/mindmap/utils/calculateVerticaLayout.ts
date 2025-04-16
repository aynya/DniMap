import { useMindmapStore } from '../store/useMindmapStore';

interface TreeNode {
  id: string;
  position: [number, number];
  size: [number, number];
  children: string[];
  collapsed: boolean;
}

// 辅助函数
const getNodeWidth = (node: TreeNode) => node.size[0];
const getNodeHeight = (node: TreeNode) => node.size[1];
const horizontalSpacing = 30;  // 父子节点水平间距
const verticalSpacing = 100;    // 兄弟节点垂直间距
/**
 * 计算整个树的布局
 * 
 */
const calculateVerticaLayout = () => {
  const { nodes } = useMindmapStore.getState();
  const rootNode = nodes['root'];
  const originalRootX = rootNode.position[0];
  const originalRootY = rootNode.position[1];

  // 1. 创建临时位置存储对象
  const newPositions: Record<string, [number, number]> = {};

  // 2. 修改清空位置的方式
  Object.keys(nodes).forEach(id => {
    newPositions[id] = [0, 0];
  });

  // 计算子树尺寸
  const subtreeSizes = new Map<string, { width: number, height: number }>();
  calculateSubtreeSize(rootNode.id, nodes, subtreeSizes);

  console.log(subtreeSizes)

  // 3. 修改后的布局函数（不再直接更新状态）
  const layoutNode = (
    nodeId: string,
    parentX: number,
    parentY: number
  ) => {
    const node = nodes[nodeId];
    const nodeSize = subtreeSizes.get(nodeId)!;

    const currentX = parentX + nodeSize.width / 2 - getNodeWidth(node) / 2;
    const currentY = parentY;
    newPositions[nodeId] = [currentX, currentY]; // 存储到临时对象

    if (node.collapsed) return;

    let childX = parentX;
    node.children.forEach(childId => {
      const childSize = subtreeSizes.get(childId)!;
      let childY = 0;
      childY = currentY + getNodeHeight(node) + verticalSpacing;
      layoutNode(childId, childX, childY);
      childX += childSize.width + horizontalSpacing;
    });
  };

  layoutNode(rootNode.id, 0, 0);

  // 4. 计算位置偏移并批量更新
  const computedRootX = newPositions[rootNode.id][0];
  const computedRootY = newPositions[rootNode.id][1];
  const dx = computedRootX - originalRootX;
  const dy = computedRootY - originalRootY;

  // 应用偏移并准备最终位置
  const finalPositions: Record<string, [number, number]> = {};
  Object.keys(newPositions).forEach(id => {
    const [x, y] = newPositions[id];
    finalPositions[id] = [x - dx, y - dy];
  });

  // 5. 一次性更新所有位置
  useMindmapStore.getState().actions.setNodePositions(finalPositions);
};

/**
 * 预计每个节点树尺寸，并返回总宽度和总高度(后序遍历)
 * @param nodeId 当前节点ID
 * @param nodes 所有节点对象
 * @param sizes 每个节点树尺寸的一个映射
 * @returns 当前节点树的尺寸 {width: number, height: number}
 */
const calculateSubtreeSize = (
  nodeId: string,
  nodes: Record<string, TreeNode>,
  sizes: Map<string, { width: number, height: number }>
): { width: number, height: number } => {
  const node = nodes[nodeId];
  
  // 折叠状态或叶子节点
  if (node.collapsed || node.children.length === 0) {
    const size = { width: getNodeWidth(node), height: getNodeHeight(node) };
    sizes.set(nodeId, size);
    return size;
  }

  // 递归计算子节点尺寸
  let totalChildHeight = 0;
  let maxChildWidth = 0;
  
  node.children.forEach(childId => {
    const childSize = calculateSubtreeSize(childId, nodes, sizes);
    maxChildWidth += childSize.width;
    totalChildHeight = Math.max(totalChildHeight, childSize.height);
  });
  const subtreeHeight = getNodeHeight(node) + totalChildHeight + verticalSpacing;
  const subtreeWidth = maxChildWidth + (node.children.length - 1) * horizontalSpacing;
  const totalWidth = Math.max(getNodeWidth(node), subtreeWidth);
  // 设置当前节点树尺寸
  sizes.set(nodeId, { width: totalWidth, height: subtreeHeight });
  
  return { width: totalWidth, height: subtreeHeight };
};

export default calculateVerticaLayout;