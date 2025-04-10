import * as d3 from 'd3';
import { useMindmapStore } from '../store/useMindmapStore';

// 定义 TreeNode 接口
interface TreeNode {
    id: string;
    children: TreeNode[];
}

const calculateTreeLayout = () => {
    const nodesData = useMindmapStore.getState().nodes;
    const actions = useMindmapStore.getState().actions;
    const rootId = 'root';

    // 获取根节点的初始位置
    const rootNodePosition = nodesData[rootId]?.position || [0, 0]; // 默认为 [0, 0]
    const [rootX, rootY] = rootNodePosition;

    // 递归构建 TreeNode 结构
    const buildTreeNode = (nodeId: string): TreeNode => {
        const node = nodesData[nodeId];
        if (!node) {
            throw new Error(`Node with id ${nodeId} not found`);
        }
        return {
            id: nodeId,
            children: node.children.map(childId => buildTreeNode(childId)),
        };
    };

    // 构建树状结构
    const hierarchy = d3.hierarchy<TreeNode>(buildTreeNode(rootId));

    // 使用 nodeSize 方法控制节点间距
    const treeLayout = d3.tree<TreeNode>().nodeSize([100, 200]);
    treeLayout(hierarchy);

    // 获取根节点的 D3 布局坐标
    const d3RootNode = hierarchy.descendants()[0]; // 根节点是第一个节点
    const d3RootX = d3RootNode.y ?? 0; // 注意：从左向右布局时，x 和 y 已交换
    const d3RootY = d3RootNode.x ?? 0;

    // 计算偏移量
    const offsetX = rootX - d3RootX;
    const offsetY = rootY - d3RootY;

    // 遍历所有节点并更新位置
    hierarchy.descendants().forEach(d3Node => {
        const nodeId = d3Node.data.id;

        // 调整坐标以固定根节点位置
        const x = (d3Node.y ?? 0) + offsetX; // 如果 x 为 undefined，则使用默认值 0
        const y = (d3Node.x ?? 0) + offsetY; // 如果 y 为 undefined，则使用默认值 0

        if (nodesData[nodeId]) {
            actions.setNodePosition(nodeId, [x, y]);
        }
    });
};

export default calculateTreeLayout;