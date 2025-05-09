

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
    selectedNodes: string[];
    history: Array<{
        nodes: Record<string, Node>; 
        connections: string[];
        layoutStyle: 'left-to-right' | 'right-to-left' | 'center' | 'top-to-bottom';
    }>; // 操作历史栈
    future: Array<{
        nodes: Record<string, Node>; 
        connections: string[];
        layoutStyle: 'left-to-right' | 'right-to-left' | 'center' | 'top-to-bottom';
    }>; // 前进操作栈
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
    setSelectedNodes: (id: string) => void;
    setAllSelectedNodes: (id: string[]) => void;
    clearSelectedNodes: () => void;
    deleteSelectedNodes: () => void;
    undo: () => void;
    redo: () => void;
    saveState: () => void;
}

export const useMindmapStore = create<State & { actions: Actions }>()(
    immer((set) => ({
        nodes: {
            root: {
                id: 'root',
                text: '根节点',
                position: [window.innerWidth / 2, window.innerHeight / 2 - 30],
                children: [],
                size: [88, 56], // 默认宽高
                collapsed: false, // 默认展开
                direction: 'none', // 新增方向属性(只在center布局中使用)
            }
        },
        selectedNodes: [],
        connections: [],
        selectedNodeId: null,
        layoutStyle: 'left-to-right', // 新增布局风格属性
        history: [{
            nodes: {
                root: {
                    id: 'root',
                    text: '根节点',
                    position: [window.innerWidth / 2, window.innerHeight / 2 - 30],
                    children: [],
                    size: [88, 56], // 默认宽高
                    collapsed: false, // 默认展开
                    direction: 'none', // 新增方向属性(只在center布局中使用)
                }
            },
            connections: [],
            layoutStyle: 'left-to-right', // 新增布局风格属性
        }],
        future: [],
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
                setTimeout(() => {
                    useMindmapStore.getState().actions.saveState();
                }, 0);
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
                // useMindmapStore.getState().actions.saveState();
                setTimeout(() => {
                    useMindmapStore.getState().actions.saveState();
                }, 0);
            },
            // 更新节点文本
            updateNodeText: (id, text) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].text = text;
                    }
                });
                // useMindmapStore.getState().actions.saveState();
                setTimeout(() => {
                    useMindmapStore.getState().actions.saveState();
                }, 0);
            },
            // 设置节点位置
            setNodePosition: (id, position) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].position = position;
                    }
                })
                // useMindmapStore.getState().actions.saveState();
            },
            // 创建连接线
            createConnection: (parentId, childId) => {
                set((state) => {
                    if (!state.connections.includes(`${parentId}---${childId}`)) {
                        state.connections.push(`${parentId}---${childId}`);
                    }
                });
                // useMindmapStore.getState().actions.saveState();
            },
            // 切换节点折叠状态
            toggleCollapse: (id: string) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].collapsed = !state.nodes[id].collapsed
                    }
                });
                // useMindmapStore.getState().actions.saveState();
                setTimeout(() => {
                    useMindmapStore.getState().actions.saveState();
                }, 0);
            },
            updateNodeSize: (id: string, size: [number, number]) => {
                set((state) => {
                    if (state.nodes[id]) {
                        state.nodes[id].size = size
                    }
                });
                // useMindmapStore.getState().actions.saveState();
            },
            setNodePositions: (positions: { [id: string]: [number, number] }) => {
                set((state) => {
                    Object.entries(positions).forEach(([id, pos]) => {
                        if (state.nodes[id]) {
                            state.nodes[id].position = pos;
                        }
                    });
                });
                // useMindmapStore.getState().actions.saveState();
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
            // 更新选择的节点
            setSelectedNodes: (id: string) => {
                set((state) => {
                    if (!state.selectedNodes.includes(id)) {
                        state.selectedNodes.push(id);
                    }
                })
            },
            // 批量选择
            setAllSelectedNodes: (id: string[]) => {
                set((state) => {
                    state.selectedNodes = id;
                })
            },
            // 清空选择
            clearSelectedNodes: () => {
                set((state) => {
                    state.selectedNodes = []
                })
            },
            // 删除选择的节点
            deleteSelectedNodes: () => {
                set((state) => {
                    state.selectedNodes = [];
                })
                // useMindmapStore.getState().actions.saveState();
                setTimeout(() => {
                    useMindmapStore.getState().actions.saveState();
                }, 0);
            },
            // 撤销操作
            undo: () => {
                const {history, future} = useMindmapStore.getState();
                if(history.length > 1) {
                    const tempHistory = structuredClone(history);
                    const tempFuture = structuredClone(future);
                    tempFuture.push(tempHistory[tempHistory.length - 1]);
                    tempHistory.pop();
                    const previousState = tempHistory[tempHistory.length - 1];
                    console.log(JSON.parse(JSON.stringify(previousState.nodes)));
                    set((state) => {
                        state.nodes = previousState.nodes;
                        state.connections = previousState.connections;
                        state.layoutStyle = previousState.layoutStyle;
                        state.history = structuredClone(tempHistory);
                        state.future = structuredClone(tempFuture);
                    });
                }
            },
            // 前进操作
            redo: () => {
                const {history, future} = useMindmapStore.getState();
                if(future.length > 0) {
                    const tempHistory = structuredClone(history);
                    const tempFuture = structuredClone(future);
                    tempHistory.push(tempFuture[tempFuture.length - 1]);
                    const nextState = tempFuture[tempFuture.length - 1];
                    tempFuture.pop();
                    set((state) => {
                        state.nodes = nextState.nodes;
                        state.connections = nextState.connections;
                        state.layoutStyle = nextState.layoutStyle;
                        state.history = structuredClone(tempHistory);
                        state.future = structuredClone(tempFuture);
                    });
                }
            },
            // 保存当前状态到历史记录
            saveState: () => {
                console.log(1);
                const {nodes, connections, layoutStyle, history} = useMindmapStore.getState();

                set({
                    history: [
                        ...history,
                        {
                            nodes: structuredClone(nodes), // 深拷贝节点对象
                            connections: [...connections],
                            layoutStyle,
                        },
                    ],
                    future: [],
                })
            }
        }
    }))
)
