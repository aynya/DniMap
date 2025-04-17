import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { useMindmapStore, type Node } from '../features/mindmap/store/useMindmapStore';



/**
 * 
 * @param file - XLSX 文件对象
 * @returns Promise<void>
 */


// 定义解析后的数据类型
interface NodeRow {
    id: string;
    text: string;
    position_x: number;
    position_y: number;
    size_width: number;
    size_height: number;
    collapsed: string; // 字符串 'true' 或 'false'
    direction?: 'left' | 'right' | 'none';
}

interface ConnectionRow {
    from: string;
    to: string;
}

interface GlobalStateRow {
    key: string;
    value: string;
}
// 导入 XLSX 文件
export const importFromXlsx = (file: File) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // 解析 Nodes 表格
                const nodesSheet = workbook.Sheets['Nodes'];
                const nodesData = XLSX.utils.sheet_to_json<NodeRow>(nodesSheet);
                console.log(nodesData)

                const nodes: Record<string, Node> = {};
                nodesData.forEach((row) => {
                    nodes[row.id] = {
                        id: row.id,
                        text: row.text,
                        position: [row.position_x, row.position_y],
                        children: [],
                        size: [row.size_width, row.size_height],
                        collapsed: row.collapsed === 'true',
                        direction: row.direction || undefined,
                    };
                });

                // 解析 Connections 表格
                const connectionsSheet = workbook.Sheets['Connections'];
                const connectionsData = XLSX.utils.sheet_to_json<ConnectionRow>(connectionsSheet);
                const connections: string[] = [];
                connectionsData.forEach((row) => {
                    connections.push(`${row.from}---${row.to}`);
                });

                // 更新节点的子节点关系
                connections.forEach((conn) => {
                    const [parentId, childId] = conn.split('---');
                    if (nodes[parentId] && nodes[childId]) {
                        nodes[parentId].children.push(childId);
                    }
                });

                // 解析 Global State 表格
                const globalStateSheet = workbook.Sheets['Global State'];
                if (!globalStateSheet) throw new Error('Missing "Global State" sheet');

                const globalStateData = XLSX.utils.sheet_to_json<GlobalStateRow>(globalStateSheet);
                let selectedNodeId: string | null = null;
                let layoutStyle: 'left-to-right' | 'right-to-left' | 'center' | 'top-to-bottom' = 'left-to-right';

                globalStateData.forEach((row) => {
                    if (row.key === 'selectedNodeId') {
                        selectedNodeId = row.value || null;
                    } else if (row.key === 'layoutStyle') {
                        if (
                            row.value === 'left-to-right' ||
                            row.value === 'right-to-left' ||
                            row.value === 'center' ||
                            row.value === 'top-to-bottom'
                        ) {
                            layoutStyle = row.value as typeof layoutStyle;
                        }
                    }
                });

                // 更新 store 状态
                useMindmapStore.setState({
                    nodes,
                    connections,
                    selectedNodeId,
                    layoutStyle,
                });


                resolve({ nodes, connections });
            } catch (error) {
                console.error('Error reading XLSX file:', error);
                reject(new Error('Invalid XLSX file'));
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};




/**
 * 
 * @param file - Markdown 文件对象
 * @returns 
 */


// 导入 Markdown 文件
export const importFromMarkdown = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;

                // 定义解析后的节点和连接
                const nodes: Record<string, Node> = {};
                const connections: string[] = [];

                // 当前层级的节点栈
                const nodeStack: { id: string; level: number }[] = [];

                // 逐行解析 Markdown
                content.split('\n').forEach((line) => {
                    // 匹配标题和元数据
                    const headingMatch = line.match(/^(#+)\s+(.+?)\s+<!--\s+(.+?)\s+-->/);
                    if (!headingMatch) return;

                    const [_, hashes, text, metadata] = headingMatch;

                    console.log(_);

                    const level = hashes.length;

                    // 解析元数据
                    const nodeData = JSON.parse(metadata);
                    const nodeId = nodeData.id;

                    // 创建节点
                    nodes[nodeId] = {
                        id: nodeId,
                        text,
                        position: nodeData.position,
                        children: [],
                        size: nodeData.size,
                        collapsed: nodeData.collapsed,
                        direction: nodeData.direction || undefined,
                    };

                    // 确定父子关系
                    while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= level) {
                        nodeStack.pop();
                    }

                    if (nodeStack.length > 0) {
                        const parentId = nodeStack[nodeStack.length - 1].id;
                        nodes[parentId].children.push(nodeId);
                        connections.push(`${parentId}---${nodeId}`);
                    }

                    // 将当前节点压入栈
                    nodeStack.push({ id: nodeId, level });
                });

                // 更新 store 状态
                useMindmapStore.setState({
                    nodes,
                    connections,
                    selectedNodeId: null, // 如果需要，可以从其他地方获取
                    layoutStyle: 'left-to-right', // 如果需要，可以从其他地方获取
                });

                resolve();
            } catch (error) {
                console.error('Error reading Markdown file:', error);
                reject(new Error('Invalid Markdown file'));
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};


/**
 * 导入 XMind 文件
 * @param file - XMind 文件对象
 * @returns Promise<void>
 */



// 定义思维导图主题类型
interface Topic {
    id: string;
    structureClass: string;
    title: string;
    size: [number, number]; // 节点尺寸
    position: [number, number]; // 节点位置
    collapsed: boolean; // 折叠状态
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
// 定义解析后的数据结构
interface ParsedData {
    nodes: Record<string, Node>; // 节点记录
    connections: string[]; // 连接关系列表
}
// 辅助函数：递归解析子节点
const parseChildren = (topic: Topic, parentId: string, parsedData: ParsedData): void => {
    const { id, title, position, size, collapsed, children } = topic;

    // 创建当前节点
    const node: Node = {
        id,
        text: title,
        position: position || [0, 0], // 如果没有提供位置，则使用默认值
        children: [], // 子节点 ID 列表
        size: size || [200, 60], // 如果没有提供尺寸，则使用默认值
        collapsed: collapsed || false, // 如果没有提供折叠状态，则使用默认值
        direction: 'right', // 方向属性是可选的
    };

    // 添加到节点记录
    parsedData.nodes[id] = node;

    // 如果有父节点，则建立连接
    if (parentId) {
        parsedData.connections.push(`${parentId}---${id}`);
        parsedData.nodes[parentId].children.push(id);
    }

    // 递归处理子节点
    if (children?.attached) {
        children.attached.forEach((childTopic) => {
            parseChildren(childTopic, id, parsedData);
        });
    }
};

// 导入xmind文件
export const importFromXMind = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();

        zip.loadAsync(file)
            .then((unzipped) => {
                // 读取 content.json
                return unzipped.file('content.json')?.async('text');
            })
            .then((contentJsonText) => {
                if (!contentJsonText) {
                    throw new Error('Missing content.json');
                }

                // 解析 content.json
                const contentJson: ContentJSON = JSON.parse(contentJsonText);

                // 初始化解析数据
                const parsedData: ParsedData = {
                    nodes: {},
                    connections: [],
                };

                // 解析根节点
                const rootSheet = contentJson[0];
                if (!rootSheet || !rootSheet.rootTopic) {
                    throw new Error('Invalid content.json structure');
                }

                parseChildren(rootSheet.rootTopic, '', parsedData);

                // 更新 store 状态
                useMindmapStore.setState({
                    nodes: parsedData.nodes,
                    connections: parsedData.connections,
                    selectedNodeId: null, // 如果需要，可以从其他地方获取
                    layoutStyle: 'left-to-right', // 如果需要，可以从 metadata.json 获取
                });

                resolve();
            })
            .catch((error) => {
                reject(new Error(`Failed to import XMind file: ${error.message}`));
            });
    });
};