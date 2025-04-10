import { useMindmapStore } from '../store/useMindmapStore'


const childrenSum = (nodeId: string) => {
    let sum = 0
    const dfs = (nodeId: string) => {
        const nodes = useMindmapStore.getState().nodes
        const node = nodes[nodeId]
        if(!node) return ;
        const children = node.children
        for(const childId of children) {
            dfs(childId)
            sum ++
        }
    }
    dfs(nodeId)
    return sum
}

export default childrenSum