import * as XLSX from 'xlsx';
import { useMindmapStore, type Node } from '../features/mindmap/store/useMindmapStore';


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