

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
    direction?: 'left' | 'right' | 'none'; // 新增方向属性(只在center布局中使用)
}

export type State = {
    nodes: Record<string, Node>;
    connections: string[];
    selectedNodeId: string | null;
    layoutStyle: 'left-to-right' | 'right-to-left' | 'center' | 'top-to-bottom'; // 新增布局风格属性
}

export type Actions = {
    createNode: (parentId: string, position: [number, number]) => void;
    deleteNode: (id: string) => void;
    updateNodeText: (id: string, text: string) => void;
    setNodePosition: (id: string, position: [number, number]) => void;
    createConnection: (parentId: string, childId: string) => void;
    toggleCollapse: (id: string) => void;
    updateNodeSize: (id: string, size: [number, number]) => void;
    setNodePositions: (positions: { [id: string]: [number, number] }) => void;
    updateChildrenDirections: () => void;
}

export const useMindmapStore = create<State & { actions: Actions }>()(
    immer((set) => ({
        nodes: {
            root: {
                id: 'root',
                text: '根节点',
                position: [window.innerWidth / 2, window.innerHeight / 2 - 30],
                children: [],
                size: [200, 60], // 默认宽高
                collapsed: false, // 默认展开
                direction: 'none', // 新增方向属性(只在center布局中使用)
            }
        },
        connections: [],
        selectedNodeId: null,
        layoutStyle: 'left-to-right', // 新增布局风格属性
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
                    direction: undefined as 'left' | 'right' | 'none' | undefined, // 不设置默认方向
                };

                set((state) => {
                    // 添加新节点到父节点的子节点列表
                    state.nodes[newNode.id] = newNode;
                    state.nodes[parentId].children.push(newNode.id);
                    state.connections.push(`${parentId}---${newNode.id}`);

                    if (parentId === 'root') {
                        console.log('Before updateChildrenDirections:', JSON.parse(JSON.stringify(state.nodes)));
                    } else {
                        // 非根节点的子节点，直接继承父节点的方向
                        newNode.direction = state.nodes[parentId].direction || 'none';
                    }
                });

                // 在状态更新完成后调用 updateChildrenDirections
                if (parentId === 'root') {
                    setTimeout(() => {
                        useMindmapStore.getState().actions.updateChildrenDirections();
                    }, 0);
                }
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
                    if (state.nodes[id]) {
                        state.nodes[id].collapsed = !state.nodes[id].collapsed
                    }
                });
            },
            updateNodeSize: (id: string, size: [number, number]) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].size = size
                    }
                });
            },
            setNodePositions: (positions: { [id: string]: [number, number] }) => {
                set((state) => {
                    Object.entries(positions).forEach(([id, pos]) => {
                        if (state.nodes[id]) {
                            state.nodes[id].position = pos;
                        }
                    });
                });
            },
            // 更新center布局的direction
            updateChildrenDirections: () => {
                set((state) => {
                    const updateNodeDirection = (nodeId: string, parentDirection?: 'left' | 'right' | 'none') => {
                        const node = state.nodes[nodeId];
                        if (!node) return;

                        // 如果父节点有方向，继承父节点的方向
                        if (parentDirection) {
                            node.direction = parentDirection;
                        }

                        // 递归更新子节点的方向
                        node.children.forEach((childId) => {
                            updateNodeDirection(childId, node.direction);
                        })
                    }

                    const rootNode = state.nodes['root'];
                    // console.log(JSON.parse(JSON.stringify(rootNode.children)))
                    if (!rootNode || !Array.isArray(rootNode.children)) return;

                    rootNode.children.forEach((childId, index) => {
                        const child = state.nodes[childId];
                        if (child) {
                            if (state.layoutStyle === 'center') {
                                child.direction =
                                    index < rootNode.children.length / 2 ? 'left' : 'right';
                            } else if (state.layoutStyle === 'left-to-right') {
                                child.direction = 'right';
                            } else if (state.layoutStyle === 'right-to-left') {
                                child.direction = 'left';
                            }
                        }
                    });
                    // console.log(JSON.parse(JSON.stringify(rooFtNode.children)))

                    // 调用函数更新所有子节点的方向
                    rootNode.children.forEach((childId) => {
                        const child = state.nodes[childId];
                        if (child) {
                            updateNodeDirection(childId, child.direction);
                        }
                    })
                });
            },
        }
    }))
)
