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