import { Stage, Layer, Group } from 'react-konva'
import { useRef, useCallback, Fragment, useEffect } from 'react'
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
    const lastPosition = useRef<{ x: number; y: number } | null>(null);
    const lastTime = useRef<number | null>(null);
    const inertiaAnimationId = useRef<number | null>(null);
    const velocity = useRef({ x: 0, y: 0 });

    // 处理 Stage 拖动
    const handleStageDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
        const stage = stageRef.current;
        if (!stage || !lastPosition.current) return;

        console.log(stage.position(), lastPosition.current);
        console.log(performance.now(), lastTime.current);

        velocity.current = {
            x: (stage.x() - lastPosition.current.x) / (0.25),
            y: (stage.y() - lastPosition.current.y) / (0.25),
        }
        console.log(velocity.current);

        lastPosition.current = stage.position();
        lastTime.current = performance.now();


        // 获取当前 Stage 的位置
        const newX = stage.x();
        const newY = stage.y();

        console.log('Stage Drag Move:', newX, newY, e);


    }, []);

    const handleStageDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
        const stage = stageRef.current;
        if (!stage || !lastPosition.current || !lastTime.current) return;


        // 启动惯性动画
        startInertia(velocity.current);

        // 获取最终的 Stage 位置
        const finalX = stage.x();
        const finalY = stage.y();

        console.log('Stage Drag End:', finalX, finalY, e);


    }, []);

    // 开始惯性动画
    const startInertia = useCallback((velocity: { x: number; y: number }) => {
        const stage = stageRef.current;
        if (!stage) return;

        const friction = 0.96; // 减速度，值越小减速越快
        let currentVelocity = velocity;

        const animate = () => {
            const stage = stageRef.current;
            if (!stage) return;

            // 更新位置
            const newPosition = stage.position();
            newPosition.x += currentVelocity.x;
            newPosition.y += currentVelocity.y;

            // 应用新位置
            stage.position(newPosition);
            stage.batchDraw();

            // 更新速度
            currentVelocity = {
                x: currentVelocity.x * friction,
                y: currentVelocity.y * friction,
            };
            // currentVelocity.x *= friction;
            // currentVelocity.y *= friction;


            // 如果速度足够低，则停止动画
            if (Math.abs(currentVelocity.x) < 0.1 && Math.abs(currentVelocity.y) < 0.1) {
                inertiaAnimationId.current = null;
                return;
            }

            // 继续下一帧动画
            inertiaAnimationId.current = requestAnimationFrame(animate);
        };

        // 启动动画
        inertiaAnimationId.current = requestAnimationFrame(animate);
    }, []);

    // 清除惯性动画
    const clearInertiaAnimation = useCallback(() => {
        if (inertiaAnimationId.current !== null) {
            cancelAnimationFrame(inertiaAnimationId.current);
            inertiaAnimationId.current = null;
        }
    }, []);

    useEffect(() => {
        // 初始化最后的位置和时间
        const stage = stageRef.current;
        if (stage) {
            lastPosition.current = stage.position();
            lastTime.current = performance.now();
        }

        // 清理惯性动画
        return () => {
            clearInertiaAnimation();
        };
    }, [clearInertiaAnimation]);






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
                            <ConnectionRenderer nodeId='root'/>

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