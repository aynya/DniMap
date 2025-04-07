

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'

export interface Node {
    id: string;
    text: string;
    position: [number, number];
    children: string[];
}

export type State = {
    nodes: Record<string, Node>;
    connections: string[];
    selectedNodeId: string | null;
}

export type Actions = {
    createNode: (parentId?: string) => void;
    deleteNode: (id: string) => void;
    updateNodeText: (id: string, text: string) => void;
    setNodePosition: (id: string, position: [number, number]) => void;
}

export const useMindmapStore = create<State & { actions: Actions }>()(
    immer((set) => ({
        nodes: {},
        connections: [],
        selectedNodeId: null,
        actions: {
            // 创建节点
            createNode: (parentId) => {
                const newNode = {
                    id: nanoid(),
                    text: '新节点',
                    position: [0, 0] as [number, number],
                    children: [],
                }
                set((state) => {
                    state.nodes[newNode.id] = newNode;
                    if (parentId) {
                        state.nodes[parentId].children.push(newNode.id);
                        state.connections.push(`${parentId}-${newNode.id}`);
                    }
                });
            },
            // 删除节点
            deleteNode: (id) => {
                set((state) => {
                    const nodeToDelete = state.nodes[id];
                    if (!nodeToDelete) return;

                    // 辅助函数：递归删除节点及其子节点，并清理所有相关连接
                    const deleteChildren = (nodeId: string) => {
                        const children = state.nodes[nodeId]?.children || [];
                        children.forEach((childId) => {
                            // 递归删除子节点
                            deleteChildren(childId);

                            // 删除子节点之间的连接
                            state.connections = state.connections.filter(
                                (connection) => connection !== `${nodeId}-${childId}`
                            );
                        });

                        // 删除当前节点的所有子节点
                        delete state.nodes[nodeId];
                    };

                    // 删除与当前节点相关的连接
                    state.connections = state.connections.filter(
                        (connection) => !connection.includes(id)
                    );

                    // 递归删除子节点及其连接
                    deleteChildren(id);

                    for (const nodeId in state.nodes) {
                        const parentNode = state.nodes[nodeId];
                        parentNode.children = parentNode.children.filter(
                            (childId) => childId !== id
                        );
                    }
                    // 删除当前节点
                    delete state.nodes[id];
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
                    if(state.nodes[id]) {
                        state.nodes[id].position = position;
                    }
                })
            }
        }
    }))
)
