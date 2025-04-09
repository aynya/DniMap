import { Node } from '../../mindmap/store/useMindmapStore'

export const calculateConnectionPoints = (
    nodes: Record<string, Node>,
    connection: string
): [number, number, number, number] => {
    const [fromId, toId] = connection.split('---')
    const fromNode = nodes[fromId]
    const toNode = nodes[toId]
    if(!fromNode || !toNode) return [0, 0, 0, 0]

    // 开始的坐标，节点的右侧中心点
    const startX = fromNode.position[0] + fromNode.size[0]
    const startY = fromNode.position[1] + fromNode.size[1] / 2

    // 结束的坐标，节点的左侧中心点
    const endX = toNode.position[0]
    const endY = toNode.position[1] + toNode.size[1] / 2

    return [startX, startY, endX, endY]
}