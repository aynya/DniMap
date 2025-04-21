import { useMindmapStore, Node } from '../../store/useMindmapStore'
import '@ant-design/v5-patch-for-react-19';
import {
    FloatButton,
    Tooltip,
    Tree,

} from 'antd'
import {
    MenuUnfoldOutlined,

} from '@ant-design/icons'
import { useState } from 'react'
import Konva from 'konva'

const Outline = () => {
    const [outlineVisible, setOutlineVisible] = useState(false);

    // 获取 Stage 实例
    const getStageFromContainer = () => {
        const container = document.getElementById('konva-container');
        if (!container) {
            console.error('Container not found!');
            return null;
        }

        const stage = Konva.stages.find((s) => s.container() === container);
        if (!stage) {
            console.error('Stage not found!');
            return null;
        }

        return stage;
    };

    interface TreeDataItem {
        title: string;
        key: string;
        children?: TreeDataItem[];
    }

    // 递归生成 Tree 数据
    const generateTreeData = (nodes: Record<string, Node>, rootId: string): TreeDataItem[] => {
        const rootNode = nodes[rootId];
        if (!rootNode) return [];

        return [
            {
                title: rootNode.text,
                key: rootNode.id,
                children: rootNode.children.map((childId) => generateTreeData(nodes, childId)).flat(),
            },
        ];
    };

    // 从 store 中获取 nodes 数据
    const { nodes } = useMindmapStore.getState();
    const treeData = generateTreeData(nodes, 'root'); // 假设根节点 ID 为 'root'

    // 处理节点点击事件
    const handleNodeClick = (selectedKeys: string[]) => {
        const nodeId = selectedKeys[0];
        const stage = getStageFromContainer();

        if (stage && nodes[nodeId]) {
            const nodePosition = nodes[nodeId].position;
            const rootNodePosition = nodes['root'].position;
            stage.scale({ x: 1, y: 1 });
            stage.position({ x: -nodePosition[0] + rootNodePosition[0], y: -nodePosition[1] + rootNodePosition[1] }); // 调整视图到节点位置
            stage.batchDraw(); // 触发重绘
        }
    };

    return (
        <>
            {/* 悬浮按钮 */}
            <Tooltip title="大纲" placement="left">
                <FloatButton
                    icon={<MenuUnfoldOutlined />}
                    onClick={() => setOutlineVisible(!outlineVisible)} // 切换大纲显示状态
                />
            </Tooltip>

            {/* 大纲面板 */}
            {outlineVisible && (
                <div
                    style={{
                        position: 'absolute',
                        height: 300,
                        right: 50,
                        width: 300,
                        background: '#fff',
                        padding: 16,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                        overflowY: 'auto',
                        overflowX: 'auto',
                    }}
                >
                    <Tree
                        showLine
                        defaultExpandAll
                        onSelect={(selectedKeys) => handleNodeClick(selectedKeys as string[])}
                        treeData={treeData}
                    />
                </div>
            )}
        </>
    );
}

export default Outline;