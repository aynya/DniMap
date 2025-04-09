import { Stage, Layer, Group } from 'react-konva'
import { useRef, useCallback, Fragment } from 'react'
import { useMindmapStore } from '../store/useMindmapStore'
import Node from './Node'
import ConnectionRenderer from './ConnectionRenderer'
import { KonvaEventObject } from 'konva/lib/Node'
import Konva from 'konva';

const TreeNodeComponent = ({ nodeId }: { nodeId: string }) => {
    const node = useMindmapStore(state => state.nodes[nodeId]);
    const childIds = node.children;

    if (!node) return null;

    return (
        <Group>
            <Node node={node} />
            {!node.collapsed && childIds.map(childId => (
                <Fragment key={childId}>
                    <TreeNodeComponent nodeId={childId} />
                </Fragment>
            ))}
        </Group>
    );
};

const InfiniteCanvas = () => {
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
        console.log(stage)
        if (!stage) return;


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
            <div id="konva-container">
                <Stage
                    ref={stageRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    container="konva-container"
                    x={0}
                    y={0}
                    draggable={true}
                    onWheel={handleWheel}
                    onDragMove={handleStageDragMove} // 添加拖动移动事件
                    onDragEnd={handleStageDragEnd}   // 添加拖动结束事件
                >
                    <Layer>

                        {/* 内容容器 */}
                        <Group >
                            {/* 连接线层 */}
                            <ConnectionRenderer />

                            <TreeNodeComponent nodeId="root" />

                        </Group>
                    </Layer>
                </Stage>
            </div>
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