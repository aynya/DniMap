// src/lib/exporters.ts
import { saveAs } from 'file-saver'
import { useMindmapStore } from '../features/mindmap/store/useMindmapStore'
import Konva from 'konva';
import { exportStageSVG } from 'react-konva-to-svg';
import { calculateConnectionPoints } from '../features/mindmap/utils/connectionUtils';


/**
 * 生成临时的 Konva Stage，包含所有节点和连接线。
 * @returns {Object} 包含 stage 和 layer 的对象
 */
const generateStage = () => {
    try {
        // 从 Store 中获取节点和连接信息
        const { nodes, connections, layoutStyle } = useMindmapStore.getState();

        if (!nodes || Object.keys(nodes).length === 0) {
            console.error('没有节点可以导出');
            return null;
        }

        // 计算所有节点的边界框（只包含可见节点）
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        const visibleNodes = new Set<string>(); // 存储可见节点的 ID

        // 递归遍历节点树，收集可见节点
        const traverseNodes = (nodeId: string) => {
            const node = nodes[nodeId];
            if (!node) return; // 如果节点不存在，则跳过

            visibleNodes.add(nodeId); // 标记当前节点为可见

            const [x, y] = node.position;
            const [width, height] = node.size;

            // 更新边界框
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);

            // 如果节点未折叠，递归处理子节点
            if (!node.collapsed) {
                node.children.forEach((childId) => traverseNodes(childId));
            }
        };
        traverseNodes('root');

        // 如果没有可见节点，直接返回
        if (visibleNodes.size === 0) {
            console.error('没有可见节点可以导出');
            return null;
        }

        // 计算内容区域的宽高
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        // 创建临时的 Stage 和 Layer
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px'; // 隐藏容器
        document.body.appendChild(tempContainer);

        const tempStage = new Konva.Stage({
            container: tempContainer,
            width: contentWidth,
            height: contentHeight,
        });
        const tempLayer = new Konva.Layer();
        tempStage.add(tempLayer);

        // 添加白色背景矩形（防止在jpg中透明背景会被染成黑色）
        tempLayer.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: contentWidth,
            height: contentHeight,
            fill: 'white',  // 强制白色背景
            listening: false // 防止影响交互
        }));

        // 绘制可见节点
        visibleNodes.forEach((nodeId) => {
            const node = nodes[nodeId];
            const [x, y] = node.position;
            const [width, height] = node.size;

            const rect = new Konva.Rect({
                x: x - minX, // 调整位置，使内容居中
                y: y - minY,
                width,
                height,
                fill: '#fff',
                stroke: '#000',
                strokeWidth: 2,
            });

            const text = new Konva.Text({
                x: x - minX + 10,
                y: y - minY + 10,
                text: node.text,
                fontSize: 16,
                fill: '#000',
                width: width - 20,
                padding: 5,
            });

            tempLayer.add(rect);
            tempLayer.add(text);
        });

        // 绘制可见连接线
        connections.forEach((conn) => {
            const [fromId, toId] = conn.split('---');
            if (!visibleNodes.has(fromId) || !visibleNodes.has(toId)) return;

            const [startX, startY, endX, endY] = calculateConnectionPoints(
                nodes,
                conn
            );

            const line = new Konva.Shape({
                sceneFunc: (ctx, shape) => {
                    ctx.beginPath();
                    ctx.moveTo(startX - minX, startY - minY); // 调整位置
                    if (layoutStyle === 'top-to-bottom') {
                        ctx.quadraticCurveTo(
                            endX - minX,
                            startY - minY,
                            endX - minX,
                            endY - minY
                        )
                    } else {
                        ctx.quadraticCurveTo(
                            startX - minX,
                            endY - minY,
                            endX - minX,
                            endY - minY
                        )
                    }
                    ctx.fillStrokeShape(shape);
                },
                stroke: 'black',
                strokeWidth: 2,
            });

            tempLayer.add(line);
        });

        tempLayer.batchDraw(); // 强制绘制

        return { stage: tempStage, layer: tempLayer, container: tempContainer };
    } catch (error) {
        console.error('生成 Stage 失败', error);
        return null;
    }
};

/**
 * 导出为 JSON 文件
 * @returns void
 */
export const exportAsJSON = () => {
    const state = useMindmapStore.getState()
    const data = JSON.stringify({
        nodes: state.nodes,
        connections: state.connections
    }, null, 2)

    const blob = new Blob([data], { type: 'application/json' })
    saveAs(blob, 'mindmap.json')
}

export const importFromJSON = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string)
            useMindmapStore.setState(data)
        } catch (error) {
            console.error('文件解析失败', error)
        }
    }
    reader.readAsText(file)
}

/**
 * 导出为png
 * @returns void
 */
export const exportAsPNG = () => {
    const result = generateStage();
    if (!result) return;

    const { stage, container } = result;
    try {
        // 导出图片
        const dataUrl = stage.toDataURL({
            mimeType: 'image/png',
            pixelRatio: 2,
        });

        // 创建下载链接
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'mindmap.png';
        link.click();
    } finally {
        // 清理临时资源
        stage.destroy();
        document.body.removeChild(container);
    }
};


/**
 * 导出为jpg
 * @returns void
 */
export const exportAsJPG = () => {
    const result = generateStage();
    if (!result) return;

    const { stage, container } = result;

    try {
        const dataUrl = stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: 1, // 图片质量
            pixelRatio: 2, // 提高分辨率
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'mindmap.jpg';
        link.click();
    } finally {
        // 清理临时资源
        stage.destroy();
        document.body.removeChild(container);
    }
}

/**
 * 导出为 SVG
 * @returns void
 */
export const exportAsSVG = async () => {
    // 生成临时 Stage
    const result = generateStage();
    if (!result) return;

    const { stage, container } = result;

    try {
        // 使用 react-konva-to-svg 导出 SVG
        const svgContent = await exportStageSVG(stage, false, {
            onBefore: ([stage, layer]) => {
                console.log('开始导出 SVG:', stage, layer);
            },
            onAfter: ([stage, layer]) => {
                console.log('SVG 导出完成:', stage, layer);
            },
        });

        // 创建 Blob 对象
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });

        // 下载 SVG 文件
        saveAs(blob, 'mindmap.svg');
    } catch (error) {
        console.error('导出 SVG 时出错:', error);
    } finally {
        // 清理临时资源
        stage.destroy();
        document.body.removeChild(container);
    }
};


