

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'

export interface Node {
    id: string;
    text: string;
    position: [number, number];
    children: string[];
    size: [number, number]; // 新增尺寸字段 [width, height]
    collapsed: boolean;     // 新增折叠状态
}

export type State = {
    nodes: Record<string, Node>;
    connections: string[];
    selectedNodeId: string | null;
}

export type Actions = {
    createNode: (parentId: string, position: [number, number]) => void;
    deleteNode: (id: string) => void;
    updateNodeText: (id: string, text: string) => void;
    setNodePosition: (id: string, position: [number, number]) => void;
    createConnection: (parentId: string, childId: string) => void;
    toggleCollapse: (id: string) => void;
    updateNodeSize: (id: string, size: [number, number]) => void;
}

export const useMindmapStore = create<State & { actions: Actions }>()(
    immer((set) => ({
        nodes: {
            root: {
                id: 'root',
                text: '根节点',
                position: [window.innerWidth / 4, window.innerHeight / 2 - 30],
                children: [],
                size: [200, 60], // 默认宽高
                collapsed: false, // 默认展开
            }
        },
        connections: [],
        selectedNodeId: null,
        actions: {
            // 创建节点
            createNode: (parentId, position) => {
                const newNode = {
                    id: nanoid(),
                    text: '新节点',
                    position: position,
                    children: [],
                    size: [200, 60] as [number, number], // 默认宽高
                    collapsed: false, // 默认展开
                }
                set((state) => {
                    state.nodes[newNode.id] = newNode;
                    if (parentId) {
                        console.log(parentId)
                        state.nodes[parentId].children.push(newNode.id);
                        state.connections.push(`${parentId}---${newNode.id}`);
                    }
                });
            },
            // 删除节点
            deleteNode: (id) => {
                set((state) => {
                    // 删除节点本体
                    delete state.nodes[id]

                    // 清理所有关联连接
                    state.connections = state.connections.filter(conn => {
                        const [from, to] = conn.split('---')
                        return from !== id && to !== id
                    })

                    // 清理其他节点的子节点引用
                    Object.values(state.nodes).forEach(node => {
                        node.children = node.children.filter(childId => childId !== id)
                    })
                })
            },
            // 更新节点文本
            updateNodeText: (id, text) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].text = text;
                    }
                });
            },
            // 设置节点位置
            setNodePosition: (id, position) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].position = position;
                    }
                })
            },
            // 创建连接线
            createConnection: (parentId, childId) => {
                set((state) => {
                    if (!state.connections.includes(`${parentId}---${childId}`)) {
                        state.connections.push(`${parentId}---${childId}`);
                    }
                });
            },
            // 切换节点折叠状态
            toggleCollapse: (id: string) => {
                set((state) => {
                    if(state.nodes[id]) {
                        state.nodes[id].collapsed = !state.nodes[id].collapsed
                    }
                });
            },
            updateNodeSize: (id: string, size: [number, number]) => {
                set((state) => {
                    if(state.nodes[id]) {
                        state.nodes[id].size = size
                    }
                });
            },
        }
    }))
)
