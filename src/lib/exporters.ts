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
        const { nodes, connections } = useMindmapStore.getState();

        if (!nodes || Object.keys(nodes).length === 0) {
            console.error('没有节点可以导出');
            return null;
        }

        // 计算所有节点的边界框
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        Object.values(nodes).forEach((node) => {
            const [x, y] = node.position;
            const [width, height] = node.size;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
        });

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

        // 绘制节点
        Object.values(nodes).forEach((node) => {
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

        // 绘制连接线
        connections.forEach((conn) => {
            const [fromId, toId] = conn.split('---');
            const fromNode = nodes[fromId];
            const toNode = nodes[toId];

            if (fromNode && toNode) {
                const [startX, startY, endX, endY] = calculateConnectionPoints(
                    nodes,
                    conn
                );

                const line = new Konva.Shape({
                    sceneFunc: (ctx, shape) => {
                        console.log(111111);
                        ctx.beginPath();
                        ctx.moveTo(startX - minX, startY - minY); // 调整位置
                        ctx.quadraticCurveTo(
                            startX - minX,
                            endY - minY,
                            endX - minX,
                            endY - minY
                        );
                        ctx.fillStrokeShape(shape);
                    },
                    stroke: 'black',
                    strokeWidth: 2,
                });

                tempLayer.add(line);
            }
        });

        tempLayer.batchDraw(); // 强制绘制

        return { stage: tempStage, layer: tempLayer, container: tempContainer };
    } catch (error) {
        console.error('生成 Stage 失败', error);
        return null;
    }
};

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
 * 导出为 SVG
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