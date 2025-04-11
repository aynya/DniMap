import { useMindmapStore } from '../store/useMindmapStore';

// 辅助类型定义
interface TreeNode {
  id: string;
  position: [number, number]; // [x, y]
  size: [number, number]; // [width, height]
  children: string[]; // 子节点 ID 列表
  collapsed: boolean; // 是否折叠
}

// 获取节点的宽度（水平方向）
const getNodeWidth = (node: TreeNode): number => node.size[0];

// 获取节点的高度（垂直方向）
const getNodeHeight = (node: TreeNode): number => node.size[1];

// 计算两个节点的最小水平间距
const getHorizontalSpacing = (): number => 50; // 固定水平间距

// 计算两个节点的最小垂直间距
const getVerticalSpacing = (): number => 20; // 固定垂直间距

// 主函数：执行分层递归布局
const calculateTreeLayout = () => {
  const { nodes } = useMindmapStore.getState();

  // 调用分层递归布局函数
  layoutNode('root', nodes, 0, 0);
};

// 分层递归布局函数
const layoutNode = (
  nodeId: string,
  nodes: Record<string, TreeNode>,
  parentX: number,
  parentY: number
) => {
  const node = nodes[nodeId];

  // 如果是叶子节点或折叠状态，直接设置位置
  if (node.children.length === 0 || node.collapsed) {
    // 设置节点位置
    useMindmapStore.getState().actions.setNodePosition(nodeId, [parentX, parentY]);
    return;
  }

  // 遍历子节点并递归布局
  let currentY = parentY - getTotalChildHeight(nodes, node) / 2;

  node.children.forEach((childId) => {
    const childNode = nodes[childId];

    // 子节点的 X 坐标基于父节点的 X 坐标加上固定水平间距和父节点宽度
    const childX = parentX + getHorizontalSpacing() + getNodeWidth(node);

    // 子节点的 Y 坐标基于当前累积 Y 坐标和子树高度的一半
    const childTreeHeight = getChildTreeHeight(nodes, childNode);
    const childY = currentY + childTreeHeight / 2;

    // 递归布局子节点
    layoutNode(childId, nodes, childX, childY);

    // 更新累积 Y 坐标，确保每个子节点的子树区域不重叠
    currentY += childTreeHeight + getVerticalSpacing();
  });

  // 设置父节点的位置
  // 父节点的 Y 坐标位于所有子节点区域的垂直中心
  useMindmapStore.getState().actions.setNodePosition(nodeId, [
    parentX,
    parentY,
  ]);
};

// 计算一个节点的所有子节点的总高度（包括子树的高度）
const getTotalChildHeight = (nodes: Record<string, TreeNode>, node: TreeNode): number => {
  return node.children.reduce(
    (acc, childId) => acc + getChildTreeHeight(nodes, nodes[childId]) + getVerticalSpacing(),
    0
  ) - getVerticalSpacing(); // 减去最后一个子节点的间距
};

// 计算一个节点的子树高度（包括自身高度和所有子节点的高度）
const getChildTreeHeight = (nodes: Record<string, TreeNode>, node: TreeNode): number => {
  if (node.children.length === 0 || node.collapsed) {
    return getNodeHeight(node); // 叶子节点或折叠节点只返回自身高度
  }
  const totalChildHeight = node.children.reduce(
    (acc, childId) => acc + getChildTreeHeight(nodes, nodes[childId]) + getVerticalSpacing(),
    0
  );
  return getNodeHeight(node) + totalChildHeight;
};

// 导出主函数
export default calculateTreeLayout;