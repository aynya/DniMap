import { useMindmapStore } from '../store/useMindmapStore';

interface TreeNode {
    id: string;
    position: [number, number];
    size: [number, number];
    children: string[];
    collapsed: boolean;
    direction?: 'left' | 'right' | 'none'; // 使用 Store 中的 direction 属性
}

// 辅助函数
const getNodeWidth = (node: TreeNode) => node.size[0];
const getNodeHeight = (node: TreeNode) => node.size[1];
const horizontalSpacing = 100;  // 父子节点水平间距
const verticalSpacing = 30;    // 兄弟节点垂直间距

/**
 * 计算整个树的布局（从中间向左右布局）
 */
const calculateCenterLayout = () => {
    const { nodes } = useMindmapStore.getState();
    const rootNode = nodes['root'];
    if(nodes[rootNode.id].collapsed) return;
    const originalRootX = rootNode.position[0];
    const originalRootY = rootNode.position[1];

    // 临时存储每个节点的新位置
    const newPositions: Record<string, [number, number]> = {};

    // 初始化所有节点位置为 [0, 0]
    Object.keys(nodes).forEach(id => {
        newPositions[id] = [0, 0];
    });

    // 子树尺寸缓存（全局共享）
    const subtreeSizes = new Map<string, { width: number, height: number }>();

    // 分离左右子树
    const leftChildren = rootNode.children.filter(childId => nodes[childId].direction === 'left');
    const rightChildren = rootNode.children.filter(childId => nodes[childId].direction === 'right');

    // 布局左侧子树
    const layoutLeftTree = () => {
        calculateSubtreeSize(rootNode.id, nodes, subtreeSizes);

        const layoutTree = (
            nodeId: string,
            parentX: number,
            parentY: number
        ) => {
            const node = nodes[nodeId];
            const nodeSize = subtreeSizes.get(nodeId)!;

            let currentX = parentX;
            if (node.direction === 'left') {
                currentX -= getNodeWidth(node) + horizontalSpacing;
            }

            const currentY = parentY + nodeSize?.height / 2 - getNodeHeight(node) / 2;
            newPositions[nodeId] = [currentX, currentY];
            console.log(newPositions)

            if (node.collapsed || node.children.length === 0) return;

            let childY = parentY;
            node.children.forEach(childId => {
                const childSize = subtreeSizes.get(childId)!;
                layoutTree(childId, currentX, childY);
                childY += childSize.height + verticalSpacing;
            });
        };

        let sum = 0;
        leftChildren.forEach((childId) => {
            const childSize = subtreeSizes.get(childId)!;
            layoutTree(childId, originalRootX, sum);
            sum += childSize?.height + verticalSpacing;
        });
    };

    // 布局右侧子树
    const layoutRightTree = () => {
        calculateSubtreeSize(rootNode.id, nodes, subtreeSizes);

        const layoutTree = (
            nodeId: string,
            parentX: number,
            parentY: number,
            parentId: string
        ) => {
            const node = nodes[nodeId];
            const nodeSize = subtreeSizes.get(nodeId)!;

            let currentX = parentX;
            if (node.direction === 'right') {
                currentX += getNodeWidth(nodes[parentId]) + horizontalSpacing;
            }

            const currentY = parentY + nodeSize?.height / 2 - getNodeHeight(node) / 2;
            newPositions[nodeId] = [currentX, currentY];
            console.log(`Setting position for ${nodeId}:`, newPositions[nodeId]);

            if (node.collapsed || node.children.length === 0) return;

            let childY = parentY;
            node.children.forEach(childId => {
                const childSize = subtreeSizes.get(childId)!;
                layoutTree(childId, currentX, childY, nodeId);
                childY += childSize?.height + verticalSpacing;
            });
        };

        let sum = 0;
        rightChildren.forEach((childId) => {
            const childSize = subtreeSizes.get(childId)!;
            layoutTree(childId, originalRootX, sum, rootNode.id);
            sum += childSize?.height + verticalSpacing;
        });
    };

    // 布局左右子树
    layoutLeftTree();
    layoutRightTree();


    let minY = Infinity;
    let maxY = -Infinity;
    for (const nodeId in newPositions) {
        const y = newPositions[nodeId][1];
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y + getNodeHeight(nodes[nodeId]));
    }

    if(Number.isNaN(minY) || Number.isNaN(maxY)) {
        minY = 0;
        maxY = 0;
    }
    console.log(`minY: ${minY}, maxY: ${maxY}`)

    // 设置根节点位置
    newPositions[rootNode.id] = [originalRootX, maxY / 2 - getNodeHeight(rootNode) / 2];


    console.log(newPositions[rootNode.id])
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

    // 更新所有节点的位置
    useMindmapStore.getState().actions.setNodePositions(finalPositions);
};

/**
 * 预计每个节点树尺寸，并返回总宽度和总高度(后序遍历)
 */
const calculateSubtreeSize = (
    nodeId: string,
    nodes: Record<string, TreeNode>,
    sizes: Map<string, { width: number, height: number }>
): { width: number, height: number } => {
    const node = nodes[nodeId];

    if (node.collapsed || node.children.length === 0) {
        const size = { width: getNodeWidth(node), height: getNodeHeight(node) };
        sizes.set(nodeId, size);
        return size;
    }

    let totalHeight = 0;
    let maxWidth = 0;

    node.children.forEach(childId => {
        const childSize = calculateSubtreeSize(childId, nodes, sizes);
        totalHeight += childSize.height + verticalSpacing;
        maxWidth = Math.max(maxWidth, childSize.width);
    });

    const subtreeHeight = Math.max(getNodeHeight(node), totalHeight - verticalSpacing);
    const subtreeWidth = getNodeWidth(node) + maxWidth + horizontalSpacing;

    sizes.set(nodeId, { width: subtreeWidth, height: subtreeHeight });
    return { width: subtreeWidth, height: subtreeHeight };
};

export default calculateCenterLayout;