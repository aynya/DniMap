import { memo, useEffect, useState } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { useMindmapStore } from "../store/useMindmapStore";
import { Node as MindmapNode } from "../store/useMindmapStore";
import { KonvaEventObject } from 'konva/lib/Node'
import Konva from 'konva'
import childrenSum from "../utils/childrensumUntils";


const Node = memo(({ node }: { node: MindmapNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAddButtonVisible, setIsAddButtonVisible] = useState(false);
    const { actions } = useMindmapStore();

    // 测量文本尺寸
    const measureText = (text: string): [number, number] => {
        const tempText = new Konva.Text({
            fontSize: 16,
            text: text
        })
        return [
            tempText.width() + 40,
            tempText.height() + 40,
        ];
    };

    useEffect(() => {
        const [width, height] = measureText(node.text);
        actions.updateNodeSize(node.id, [width, height]);
    }, [])

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
        textarea.style.border = "2px solid #4f46e5"; // 复刻 Rect 的 stroke
        textarea.style.borderRadius = "8px"; // 复刻 Rect 的 cornerRadius
        textarea.style.padding = "20px"; // 复刻 Text 的 padding
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "#ffffff"; // 复刻 Rect 的 fill
        textarea.style.outline = "none";
        textarea.style.resize = "none";
        textarea.style.wordBreak = "break-word";
        textarea.style.fontFamily = "Arial, sans-serif"; // 复刻 Text 的 fontFamily
        textarea.style.transformOrigin = "left top";
        textarea.style.color = "#000000"; // 复刻 Text 的颜色
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

        textarea.addEventListener("input", () => {
            const [width, height]: [number, number] = measureText(textarea.value);
            textarea.style.width = `${width}px`;
            textarea.style.height = `${height}px`;
        })

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
        console.log("handleDragEnd")
        const newPosX = e.target.x();
        const newPosY = e.target.y();
        actions.setNodePosition(node.id, [newPosX, newPosY]); // 更新节点位置
    };

    const handleClick = () => {
        console.log("handleClick")
        if (node.collapsed) return; // 如果节点被折叠，不显示添加按钮
        setIsHovered(false)
        setIsAddButtonVisible(true)
    }
    const handleMouseEnter = () => {
        console.log("handleMouseEnter")
        setIsHovered(true)
    }
    const handleMouseLeave = () => {
        console.log("handleMouseLeave")
        setIsHovered(false)
        setIsAddButtonVisible(false)
    }

    const addText = new Konva.Text({
        fontSize: 16,
        text: "+"
    })
    const addSize = [addText.width(), addText.height()]

    const minusText = new Konva.Text({
        fontSize: 16,
        text: "-"
    })
    const minusSize = [minusText.width(), minusText.height()]

    return (
        <Group
            draggable={true} // 启用拖拽功能
            x={node.position[0]}
            y={node.position[1]}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                onDblClick={handleDoubleClick} // 触发编辑模式
            />

            {/* 右侧操作按钮 */}
            {isAddButtonVisible && (
                <Group x={node.size[0]} y={node.size[1] / 2} onClick={(e) => {
                    e.cancelBubble = true;
                    actions.createNode(node.id, [
                        node.position[0] + node.size[0] + 80,
                        node.position[1],
                    ]);
                }}>
                    <Circle
                        radius={10}
                        fill="#4f46e5"

                    />
                    <Text text="+" fontSize={16} fill="white" x={-addSize[0] / 2} y={-addSize[1] / 2 + 1} />
                </Group>
            )}

            {/* 折叠/展开按钮 */}
            {isHovered && (
                <Group x={node.size[0]} y={node.size[1] / 2} onClick={(e) => {
                    e.cancelBubble = true;
                    if (node.children.length === 0) return; // 如果没有子节点，不显示折叠/展开按钮
                    actions.toggleCollapse(node.id);
                }}>
                    <Circle
                        radius={10}
                        fill={node.collapsed ? "#10b981" : "#ef4444"}
                    />
                    <Text
                        text={node.collapsed ? "+" : "-"}
                        fontSize={16}
                        fill="white"
                        x={node.collapsed ? -addSize[0] / 2 : -minusSize[0] / 2}
                        y={node.collapsed ? -addSize[1] / 2 + 1 : -minusSize[1] / 2}
                    />

                </Group>
            )}

            {node.collapsed && node.children.length > 0 && (
                <Group x={-30 / 2} y={-10}>
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
                    <Text text={`${childrenSum(node.id)}`} fontSize={12} width={30} height={20} fill="white" align="center" verticalAlign="middle" />
                </Group>
            )}
        </Group>
    );
});

export default Node;