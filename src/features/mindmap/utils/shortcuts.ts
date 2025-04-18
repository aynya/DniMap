import { useEffect } from "react";
import { useMindmapStore } from "../store/useMindmapStore";
import { applyLayoutStyle } from "../utils/applyLayoutStyle";

export const useKeyboardShortcuts = () => {
    const actions = useMindmapStore(state => state.actions);
    const nodes = useMindmapStore(state => state.nodes);
    const connections = useMindmapStore(state => state.connections);
    const selectedNodes = useMindmapStore(state => state.selectedNodes);
    const layoutStyle = useMindmapStore(state => state.layoutStyle);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 如果当前有输入框处于焦点状态，则不处理键盘事件
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }
            e.preventDefault();
            // console.log(e.key);
            // console.log(e.key === 'Backspace')
            if(e.key === 'Backspace') {
                // 复制当前的 nodes 和 connections
                const updatedNodes = structuredClone(nodes);
                const updatedConnections = [...connections];

                console.log('Selected nodes:', selectedNodes);

                // 递归删除节点及其子节点
                const deleteNodeAndChildren = (nodeId: string) => {
                    const node = updatedNodes[nodeId];
                    if (!node) return;

                    // 递归删除子节点
                    const childrenToProcess = node.children || [];
                    console.log('children', node.children)
                    childrenToProcess.forEach((childId) => {
                        if (updatedNodes[childId]) {
                            deleteNodeAndChildren(childId);
                        }
                    });

                    // 删除当前节点
                    console.log(`Deleting node: ${nodeId}`);
                    delete updatedNodes[nodeId];

                    // 删除与该节点相关的连接线
                    for (let i = updatedConnections.length - 1; i >= 0; i--) {
                        const [from, to] = updatedConnections[i].split('---');
                        if (from === nodeId || to === nodeId) {
                            updatedConnections.splice(i, 1);
                        }
                    }

                    // 清理其他节点的子节点引用
                    Object.values(updatedNodes).forEach((parentNode) => {
                        parentNode.children = parentNode.children.filter((childId) => childId !== nodeId);
                    });
                };

                // 遍历并删除所有选中的节点
                selectedNodes.forEach((id) => {
                    console.log(`Selected node: ${id}`);
                    if (id !== 'root' && updatedNodes[id]) {
                        deleteNodeAndChildren(id);
                    }
                });

                console.log(updatedNodes);

                // 将更新后的 nodes 和 connections 同步到 Zustand 状态
                useMindmapStore.setState({
                    nodes: updatedNodes,
                    connections: updatedConnections,
                });

                // 清空选中状态
                actions.deleteSelectedNodes();
                // 重置布局
                applyLayoutStyle(layoutStyle);
            }  
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }

    }, [nodes, connections, selectedNodes, actions, layoutStyle]);
}