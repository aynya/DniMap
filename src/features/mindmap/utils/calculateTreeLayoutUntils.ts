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

// 后序遍历：计算初步位置并解决冲突
const postOrderTraversal = (
  nodeId: string,
  nodes: Record<string, TreeNode>,
  mod: Map<string, number>
): { leftContour: Map<number, number>; rightContour: Map<number, number> } => {
  const node = nodes[nodeId];

  // 如果是叶子节点或折叠状态，直接返回
  if (node.children.length === 0 || node.collapsed) {
    return {
      leftContour: new Map([[0, 0]]), // 当前层级的左轮廓
      rightContour: new Map([[0, getNodeWidth(node)]]), // 当前层级的右轮廓
    };
  }

  // 初始化左右轮廓
  let leftContour = new Map<number, number>();
  let rightContour = new Map<number, number>();

  // 遍历所有子节点
  node.children.forEach((childId, index) => {
    const childNode = nodes[childId];

    // 递归计算子节点的位置
    const { leftContour: childLeft, rightContour: childRight } =
      postOrderTraversal(childId, nodes, mod);

    // 第一个子节点不需要调整
    if (index === 0) {
      leftContour = childLeft;
      rightContour = childRight;
    } else {
      // 解决冲突：调整当前子节点的位置
      const shift = resolveConflicts(
        rightContour,
        childLeft,
        getVerticalSpacing() + getNodeHeight(childNode) // 使用子节点高度
      );
      mod.set(childId, (mod.get(childId) || 0) + shift);
      mergeContours(rightContour, childRight, shift);
    }
  });

  // 返回当前节点的轮廓
  return {
    leftContour,
    rightContour,
  };
};

// 前序遍历：将相对位置转换为全局位置
const preOrderTraversal = (
  nodeId: string,
  nodes: Record<string, TreeNode>,
  mod: Map<string, number>,
  parentX: number,
  parentY: number
) => {
  const node = nodes[nodeId];
  const currentX = parentX + getHorizontalSpacing() + getNodeWidth(node); // 水平方向（从左到右）
  const currentY = parentY + (mod.get(nodeId) || 0); // 垂直方向（上下）

  // 更新节点的全局位置
  useMindmapStore.getState().actions.setNodePosition(nodeId, [currentX, currentY]);

  // 如果有子节点，则递归处理子节点
  if (node.children.length > 0 && !node.collapsed) {
    let cumulativeOffset = -getNodeHeight(node) / 2; // 垂直偏移从父节点中心开始
    let cumulativeHorizontalOffset = 0; // 新增：累积水平偏移

    node.children.forEach((childId, index) => {
      const childNode = nodes[childId];
      const childHeight = getNodeHeight(childNode);

      // 累积计算每个子节点的垂直位置，增加动态间距
      const childYOffset = parentY + (mod.get(node.id) || 0) + cumulativeOffset + childHeight / 2;
      cumulativeOffset += childHeight + Math.max(getVerticalSpacing(), childHeight * 0.5);

      // 修改：动态计算水平偏移，考虑父节点和兄弟节点宽度
      cumulativeHorizontalOffset += index === 0 
        ? getNodeWidth(node) + getHorizontalSpacing() 
        : getNodeWidth(nodes[node.children[index - 1]]) + getHorizontalSpacing();
      const childXOffset = currentX + cumulativeHorizontalOffset;

      preOrderTraversal(childId, nodes, mod, childXOffset, childYOffset);
    });
  }
};

// 合并轮廓
const mergeContours = (
  contour1: Map<number, number>,
  contour2: Map<number, number>,
  shift: number
) => {
  for (const [level, x] of contour2.entries()) {
    const newX = x + shift;
    if (!contour1.has(level) || newX > contour1.get(level)!) { // 修改：确保不覆盖已有最大值
      contour1.set(level, newX);
    }
  }
};

// 解决冲突：调整子树的位置
const resolveConflicts = (
  contour1: Map<number, number>, // 当前节点的右轮廓
  contour2: Map<number, number>, // 子节点的左轮廓
  spacing: number
): number => {
  let shift = 0;

  for (const [level, x1] of contour1.entries()) {
    const x2 = contour2.get(level);
    if (x2 !== undefined && x1 + spacing > x2) {
      shift = Math.max(shift, x1 + spacing - x2);
    }
  }

  return shift;
};

// 主函数：执行 Reingold-Tilford 布局（从左到右）
const calculateTreeLayout = () => {
  const { nodes } = useMindmapStore.getState();

  // 创建一个映射表，用于存储每个节点的修正值
  const mod = new Map<string, number>();

  // 后序遍历：计算初步位置并解决冲突
  postOrderTraversal('root', nodes, mod);

  // 前序遍历：将相对位置转换为全局位置
  preOrderTraversal('root', nodes, mod, 0, 0);
};

export default calculateTreeLayout;