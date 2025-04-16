import { saveAs } from 'file-saver'
import { useMindmapStore } from '../features/mindmap/store/useMindmapStore'
import Konva from 'konva';
import { exportStageSVG } from 'react-konva-to-svg';
import { calculateConnectionPoints } from '../features/mindmap/utils/connectionUtils';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';


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
    const state = useMindmapStore.getState();

    // 递归构建分层节点结构
    const buildHierarchy = (nodeId: string): unknown => {
        const node = state.nodes[nodeId];
        if (!node) return null;

        // 构建当前节点的对象
        const currentNode = {
            id: node.id,
            text: node.text,
            position: node.position,
            children: node.children.map(childId => buildHierarchy(childId)).filter(Boolean),
            size: node.size,
            collapsed: node.collapsed,
            direction: node.direction
        };

        return currentNode;
    };

    // 从根节点开始递归构建整个树
    const root = buildHierarchy('root');

    // 构造最终导出的数据
    const data = JSON.stringify({
        nodes: root, // 导出的节点是分层的结构
        connections: state.connections
    }, null, 2);

    // 创建 Blob 并保存文件
    const blob = new Blob([data], { type: 'application/json' });
    saveAs(blob, 'mindmap.json');
};

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
 * 导出为 PDF
 * @returns void
 */
export const exportAsPDF = () => {
    // 生成临时 Stage
    const result = generateStage();
    if (!result) return;

    const { stage, container } = result;

    try {
        // 导出图片为 Data URL
        const dataUrl = stage.toDataURL({
            mimeType: 'image/png',
            pixelRatio: 2, // 提高分辨率
        });

        // 获取 Stage 的宽高（以像素为单位）
        const stageWidthPx = stage.width();
        const stageHeightPx = stage.height();

        // 创建 jsPDF 实例
        // 根据舞台的宽高决定页面方向
        // 在pdf中内容的实际宽高比例需要与 PDF 页面的比例匹配
        // pdf页面的方向决定了 pdf的宽高比
        let pdf;
        if (stageWidthPx > stageHeightPx) {
            pdf = new jsPDF('l', 'px', [stageWidthPx, stageHeightPx]); // 横向布局
        } else {
            pdf = new jsPDF('p', 'px', [stageHeightPx, stageWidthPx]); // 纵向布局
        }

        // 将图片添加到 PDF 中
        // 注意：由于我们使用的是'px'作为单位，所以这里不需要进行单位转换
        pdf.addImage(dataUrl, 'PNG', 0, 0, stageWidthPx, stageHeightPx);

        // 下载 PDF 文件
        pdf.save('mindmap.pdf');
    } finally {
        // 清理临时资源
        stage.destroy();
        document.body.removeChild(container);
    }
};

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



// 定义节点类型
interface Node {
    id: string; // 节点 ID
    text: string; // 节点文本
    position: [number, number]; // 节点位置
    children: string[]; // 子节点 ID 列表
    size: [number, number]; // 节点尺寸
    collapsed: boolean; // 折叠状态
    direction?: 'left' | 'right' | 'none'; // 方向属性
}

// 定义思维导图主题类型
interface Topic {
    id: string;
    structureClass: string;
    title: string;
    children?: {
        attached: Topic[]; // 子节点
    };
}

// 定义思维导图工作表类型
interface Sheet {
    id: string;
    class: string;
    title: string;
    extensions: unknown[];
    topicPositioning: string;
    topicOverlapping: string;
    coreVersion: string;
    rootTopic: Topic;
}

// 定义 content.json 的类型
type ContentJSON = Sheet[];

// 定义 metadata.json 的类型
interface MetadataJSON {
    modifier: string;
    dataStructureVersion: string;
    creator: { name: string };
    layoutEngineVersion: string;
    activeSheetId: string;
}

// 定义 manifest.json 的类型
interface ManifestJSON {
    "file-entries": {
        [filename: string]: { "media-type": string };
    };
}

// 辅助函数：递归构建子节点
const buildChildren = (nodes: Record<string, Node>, parentId: string): Topic[] => {
    console.log(`Processing parentId: ${parentId}`);
    if (!nodes[parentId]) {
        console.warn(`Node with id "${parentId}" not found`);
        return [];
    }

    const childrenIds = nodes[parentId].children; // 获取当前父节点的子节点 ID 列表
    console.log(`Children IDs for parentId "${parentId}":`, childrenIds);

    // 根据子节点 ID 构建子节点列表
    return childrenIds
        .map((childId): Topic | null => {
            const childNode = nodes[childId];
            if (!childNode) {
                console.warn(`Child node with id "${childId}" not found`);
                return null;
            }
            return {
                id: childNode.id,
                structureClass: 'org.xmind.ui.logic.right',
                title: childNode.text,
                children: {
                    attached: buildChildren(nodes, childNode.id), // 递归处理子节点
                },
            };
        })
        .filter((topic): topic is Topic => !!topic); // 过滤掉无效的子节点
};

// 辅助函数：构建 content.json
const createContentJSON = (): ContentJSON => {
    const { nodes } = useMindmapStore.getState();

    // 构建根节点
    const rootNode = nodes['root'];
    if (!rootNode) {
        throw new Error('未找到根节点');
    }

    const rootTopic: Topic = {
        id: 'root',
        structureClass: 'org.xmind.ui.logic.right',
        title: rootNode.text,
        children: {
            attached: buildChildren(nodes, 'root'), // 从根节点开始递归
        },
    };

    return [
        {
            id: 'simpleMindMap_1744799393059',
            class: 'sheet',
            title: '思维导图标题',
            extensions: [],
            topicPositioning: 'fixed',
            topicOverlapping: 'overlap',
            coreVersion: '2.100.0',
            rootTopic,
        },
    ];
};

// 辅助函数：构建 metadata.json
const createMetadataJSON = (): MetadataJSON => {
    return {
        modifier: '', // 修改者（可为空）
        dataStructureVersion: '2', // 数据结构版本
        creator: {
            name: 'mind-map', // 创建者名称
        },
        layoutEngineVersion: '3', // 布局引擎版本
        activeSheetId: 'simpleMindMap_1744799393059', // 当前活动的工作表 ID
    };
};

// 辅助函数：构建 manifest.json
const createManifestJSON = (): ManifestJSON => {
    return {
        "file-entries": {
            "content.json": { "media-type": "application/json" }, // content.json 的媒体类型
            "metadata.json": { "media-type": "application/json" }, // metadata.json 的媒体类型
            "manifest.json": { "media-type": "application/json" }, // manifest.json 的媒体类型
        },
    };
};

// 导出为 XMind 文件
export const exportAsXMind = (): void => {
    try {
        // 获取节点数据
        const { nodes } = useMindmapStore.getState();

        // 检查 nodes 是否为空
        if (!nodes || Object.keys(nodes).length === 0) {
            console.error('没有节点可以导出');
            return;
        }

        // 构建 content.json
        const contentJson: ContentJSON = createContentJSON();

        // 构建 metadata.json
        const metadataJson: MetadataJSON = createMetadataJSON();

        // 构建 manifest.json
        const manifestJson: ManifestJSON = createManifestJSON();

        // 使用 JSZip 打包
        const zip = new JSZip();
        zip.file('content.json', JSON.stringify(contentJson));
        zip.file('metadata.json', JSON.stringify(metadataJson));
        zip.file('manifest.json', JSON.stringify(manifestJson));

        // 生成并下载文件
        zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then((blob) => {
            saveAs(blob, 'mindmap.xmind');
        });
    } catch (error) {
        console.error('导出失败:', error);
    }
};