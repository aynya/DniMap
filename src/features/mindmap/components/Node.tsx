import { memo, useState } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { useMindmapStore } from "../store/useMindmapStore";
import { Node as MindmapNode } from "../store/useMindmapStore";
import { KonvaEventObject } from 'konva/lib/Node'


const Node = memo(({ node }: { node: MindmapNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { actions } = useMindmapStore();

    // 自适应尺寸逻辑
    const measureText = (text: string): [number, number] => {
        const lines = text.split("\n");
        console.log(lines)
        const lineHeight = 20;
        const maxWidth = Math.max(...lines.map((line) => line.length * 10));
        console.log(maxWidth)
        return [
            Math.max(200, maxWidth + 40), // 最小宽度200
            Math.max(60, lines.length * lineHeight + 40),
        ];
    };

    // 创建并显示 DOM 输入框
    const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
        console.log("handleDoubleClick")
        const layer = e.target.getLayer()
        const stage = layer?.getStage()
        if (!stage) return

        console.log(node.position[0], node.position[1], stage.x(), stage.y())
        const scale = stage.scaleX();
        // 获取文本位置
        const areaPosition = {
            x: stage.x() + node.position[0] * scale,
            y: stage.y() + node.position[1] * scale,
        };

        // 创建 textarea
        const textarea = document.createElement("textarea");
        const container = document.getElementById("konva-container")
        if (!container) return;
        container.appendChild(textarea);

        textarea.value = node.text;
        textarea.style.position = "absolute";
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${node.size[0] * scale}px`;
        textarea.style.height = `${node.size[1] * scale}px`;
        textarea.style.fontSize = `${16 * scale}px`;
        textarea.style.border = "none";
        textarea.style.padding = "8px";
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "#ffffff";
        textarea.style.outline = "none";
        textarea.style.resize = "none";
        textarea.style.wordBreak = "break-word";
        textarea.style.fontFamily = "Arial, sans-serif";
        textarea.style.transformOrigin = "left top";
        textarea.style.textAlign = "center";
        textarea.style.color = "#000000";
        textarea.focus();

        /**
         * 移除 textarea
         */
        function removeTextarea() {
            textarea.remove();
        }

        // 监听键盘事件
        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                textarea.blur(); // 失去焦点触发保存
            }
        });

        // 失焦时保存文本
        textarea.addEventListener("blur", () => {
            const newText = textarea.value;
            console.log(newText);
            actions.updateNodeText(node.id, newText); // 更新节点文本
            actions.updateNodeSize(node.id, measureText(newText)); // 更新节点尺寸
            removeTextarea(); // 移除 textarea
        });
    };

    // 拖动结束时更新节点位置
    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        const newPosX = e.target.x();
        const newPosY = e.target.y();
        actions.setNodePosition(node.id, [newPosX, newPosY]); // 更新节点位置
    };

    return (
        <Group
            draggable={true} // 启用拖拽功能
            x={node.position[0]}
            y={node.position[1]}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDragEnd={handleDragEnd} // 拖动结束时触发
        >
            {/* 节点主体 */}
            <Rect
                width={node.size[0]}
                height={node.size[1]}
                fill="#ffffff"
                stroke="#4f46e5"
                cornerRadius={8}
            />

            {/* 文本区域 */}
            <Text
                text={node.text}
                fontSize={16}
                padding={20}
                width={node.size[0]}
                height={node.size[1]}
                align="center"
                verticalAlign="middle"
                onDblClick={handleDoubleClick} // 触发编辑模式
            />

            {/* 右侧操作按钮 */}
            {!node.collapsed && (
                <Group x={node.size[0] + 10} y={node.size[1] / 2 - 15}>
                    <Circle
                        radius={15}
                        fill="#4f46e5"
                        onClick={(e) => {
                            e.cancelBubble = true;
                            actions.createNode(node.id, [
                                node.position[0] + node.size[0] + 80,
                                node.position[1],
                            ]);
                        }}
                    />
                    <Text text="+" fontSize={20} fill="white" x={-6} y={-10} />
                </Group>
            )}

            {/* 折叠/展开按钮 */}
            {isHovered && (
                <Group x={node.size[0] - 30} y={-25}>
                    <Circle
                        radius={12}
                        fill={node.collapsed ? "#10b981" : "#ef4444"}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            actions.toggleCollapse(node.id);
                        }}
                    />
                    <Text
                        text={node.collapsed ? "+" : "-"}
                        fontSize={16}
                        fill="white"
                        x={-5}
                        y={-10}
                    />
                    {node.collapsed && node.children.length > 0 && (
                        <Group x={25} y={-10}>
                            <Rect
                                width={30}
                                height={20}
                                fill="#4f46e5"
                                cornerRadius={4}
                                onClick={(e) => {
                                    e.cancelBubble = true;
                                    actions.toggleCollapse(node.id);
                                }}
                            />
                            <Text text={`${node.children.length}`} fontSize={12} fill="white" x={10} y={4} />
                        </Group>
                    )}
                </Group>
            )}
        </Group>
    );
});

export default Node;