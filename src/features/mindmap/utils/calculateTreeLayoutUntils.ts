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
const horizontalSpacing = 50;  // 父子节点水平间距
const verticalSpacing = 30;    // 兄弟节点垂直间距

const calculateTreeLayout = () => {
  const { nodes } = useMindmapStore.getState();
  const rootNode = nodes['root'];

  const rootOffsetX = rootNode.position[0];
  const rootOffsetY = rootNode.position[1];
  
  // 先计算所有节点的子树尺寸
  const subtreeSizes = new Map<string, { width: number, height: number }>();
  calculateSubtreeSize(rootNode.id, nodes, subtreeSizes);
  
  // 执行布局
  layoutNode(rootNode.id, nodes, subtreeSizes, 0, 0);

  // 根据根节点位置，调整所有节点位置
  // console.log('rootOffsetX:', rootOffsetX, 'rootOffsetY:', rootOffsetY, 'nodes:', nodes['root'].position)
  const finalRoot = useMindmapStore.getState().nodes['root'];
  const dx = finalRoot.position[0] - rootOffsetX;
  const dy = finalRoot.position[1] - rootOffsetY;
  const finalNodes = useMindmapStore.getState().nodes;
  Object.values(finalNodes).forEach(node => {
    const [x, y] = node.position;
    useMindmapStore.getState().actions.setNodePosition(node.id, [x - dx, y - dy]);
  });
};

// 核心修改：预计算子树尺寸
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
    totalChildHeight += childSize.height;
    maxChildWidth = Math.max(maxChildWidth, childSize.width);
  });

  // 计算总高度（包含间距）
  const subtreeHeight = totalChildHeight + 
                       (node.children.length - 1) * verticalSpacing;
  
  // 当前节点宽度 = 自身宽度 + 最大子节点宽度 + 水平间距
  const subtreeWidth = getNodeWidth(node) + 
                      maxChildWidth + 
                      horizontalSpacing;

  const totalHeight = Math.max(getNodeHeight(node), subtreeHeight);
  sizes.set(nodeId, { width: subtreeWidth, height: totalHeight });
  
  return { width: subtreeWidth, height: totalHeight };
};

// 改进后的布局算法
const layoutNode = (
  nodeId: string,
  nodes: Record<string, TreeNode>,
  sizes: Map<string, { width: number, height: number }>,
  parentX: number,
  parentY: number
) => {
  const node = nodes[nodeId];
  const nodeSize = sizes.get(nodeId)!;
  
  // 设置当前节点位置（垂直居中）
  const currentX = parentX;
  const currentY = parentY + nodeSize.height / 2 - getNodeHeight(node) / 2;
  useMindmapStore.getState().actions.setNodePosition(nodeId, [currentX, currentY]);

  // 折叠状态不处理子节点
  if (node.collapsed) return;

  // 计算子节点起始位置
  let childY = parentY;
  node.children.forEach(childId => {
    const childSize = sizes.get(childId)!;
    
    // 子节点水平位置
    const childX = currentX + getNodeWidth(node) + horizontalSpacing;
    
    // 递归布局
    layoutNode(childId, nodes, sizes, childX, childY);
    
    // 更新累积Y坐标（包含间距）
    childY += childSize.height + verticalSpacing;
  });
};

export default calculateTreeLayout;