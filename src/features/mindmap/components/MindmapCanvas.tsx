import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { useState, memo, useRef, useCallback } from 'react'
import { useMindmapStore, type Node as MindmapNode } from '../store/useMindmapStore'
import TextEditor from './TextEditor'
import ConnectionRenderer from './ConnectionRenderer'
import { KonvaEventObject } from 'konva/lib/Node'
import Konva from 'konva';

const Node = memo(({ node }: { node: MindmapNode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { actions } = useMindmapStore();
    const [tempPosition, setTempPosition] = useState(node.position);
    const refId = useRef<number>(0);
    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        if (refId.current) {
            cancelAnimationFrame(refId.current)
        }
        refId.current = requestAnimationFrame(() => {
            const newX = e.target.x();
            const newY = e.target.y();
            // 更新临时位置
            setTempPosition([newX, newY]);
            // 更新节点位置
            actions.setNodePosition(node.id, [newX, newY]);
        })
    };
    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        const newX = e.target.x();
        const newY = e.target.y();
        // 更新节点位置
        useMindmapStore.getState().actions.setNodePosition(node.id, [newX, newY]);
        setTempPosition([newX, newY])

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
                    console.log('连接线', node.id, otherNode.id)
                    useMindmapStore.getState().actions.createConnection(otherNode.id, node.id);
                }
            }
        });
    };

    return (
        <Group
            x={tempPosition[0]}
            y={tempPosition[1]}
            draggable
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
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

const InfiniteCanvas = () => {
    const nodes = useMindmapStore((state) => state.nodes);
    const stageRef = useRef<Konva.Stage | null>(null); // 引用 Stage 实例

    // 处理 Stage 拖动
    const handleStageDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
        const stage = stageRef.current;
        if (!stage) return;

        // 获取当前 Stage 的位置
        const newX = stage.x();
        const newY = stage.y();

        console.log('Stage Drag Move:', newX, newY, e);

        // 如果需要，可以在这里更新应用状态
    }, []);

    const handleStageDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
        const stage = stageRef.current;
        if (!stage) return;

        // 获取最终的 Stage 位置
        const finalX = stage.x();
        const finalY = stage.y();

        console.log('Stage Drag End:', finalX, finalY, e);

        // 如果需要，可以在这里更新应用状态
    }, []);
    

    // 处理鼠标滚轮缩放
    const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        if (!stage) return;
        // console.log(stage.x(), stage.y())


        const oldScale = stage.scaleX(); // 获取当前缩放比例
        const pointer = stage.getPointerPosition();
        console.log(pointer)
        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // 判断缩放方向
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // 如果按住 Ctrl 键，反转方向
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        const scaleBy = 1.1; // 每次缩放的比例
        let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        // 限制缩放范围在 20% 到 400%
        newScale = Math.max(0.2, Math.min(4, newScale));

        // 更新缩放比例
        stage.scale({ x: newScale, y: newScale });

        // 计算新的视口位置
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };


        stage.position(newPos);
    }, []);

    return (
        <div className="relative h-full w-full">
            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight}
                x={0}
                y={0}
                draggable={true}
                onWheel={handleWheel}
                onDragMove={handleStageDragMove} // 添加拖动移动事件
                onDragEnd={handleStageDragEnd}   // 添加拖动结束事件
            >
                <Layer>

                    {/* 内容容器 */}
                    <Group>
                        {/* 连接线层 */}
                        <ConnectionRenderer />

                        {/* 节点层 */}
                        {Object.values(nodes).map((node) => (
                            <Node key={node.id} node={node} />
                        ))}
                    </Group>
                </Layer>
            </Stage>
        </div>
    );
};

export const MindmapCanvas = () => {
    return (
        <div className="h-screen w-screen overflow-hidden">
            <InfiniteCanvas />
        </div>
    )
}