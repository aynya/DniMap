// src/features/mindmap/components/MindmapCanvas.tsx
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { useState, memo } from 'react'
import  {useMindmapStore, type Node as MindmapNode } from '../store/useMindmapStore'
import  TextEditor  from './TextEditor'
import ConnectionRenderer from './ConnectionRenderer'
import { KonvaEventObject } from 'konva/lib/Node'

const Node = memo(({ node }: { node: MindmapNode }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        const newX = e.target.x();
        const newY = e.target.y();
        // 更新节点位置
        useMindmapStore.getState().actions.setNodePosition(node.id, [newX, newY]);

        // 获取所有节点
        const allNodes = useMindmapStore.getState().nodes;

        // 计算当前节点的左中点
        const leftMidPoint = [newX, newY + 30]; // 高度的一半是 60 / 2 = 30

        // 遍历所有其他节点，检查是否有符合条件的右中点
        Object.values(allNodes).forEach((otherNode) => {
            if (otherNode.id !== node.id) {
                // 计算其他节点的右中点
                const rightMidPoint = [
                    otherNode.position[0] + 200, // 父节点宽度为 200
                    otherNode.position[1] + 30,  // 父节点高度的一半
                ];

                // 计算两点之间的距离
                const distance = Math.sqrt(
                    Math.pow(leftMidPoint[0] - rightMidPoint[0], 2) +
                    Math.pow(leftMidPoint[1] - rightMidPoint[1], 2)
                );

                // 如果距离小于某个阈值（例如 20 像素），则生成连接线
                if (distance < 20) {
                    useMindmapStore.getState().actions.createConnection(otherNode.id, node.id);
                }
            }
        });
    };

    return (
        <Group
            x={node.position[0]}
            y={node.position[1]}
            draggable
            onDragEnd={handleDragEnd}
        >
            <Rect
                width={200}
                height={60}
                fill="#ffffff"
                stroke="#4f46e5"
                cornerRadius={8}
            />
            {isEditing ? (
                <TextEditor node={node} onBlur={() => setIsEditing(false)} />
            ) : (
                <Text
                    text={node.text}
                    fontSize={16}
                    padding={10}
                    onClick={() => setIsEditing(true)}
                />
            )}
        </Group>
    );
});

export const MindmapCanvas = () => {
    const nodes = useMindmapStore(state => state.nodes)
    
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <ConnectionRenderer/>
          {Object.values(nodes).map((node) => (
            <Node key={node.id} node={node} />
          ))}
        </Layer>
      </Stage>
    )
  }