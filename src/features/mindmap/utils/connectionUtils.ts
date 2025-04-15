import { Node } from '../../mindmap/store/useMindmapStore'
import { useMindmapStore } from '../../mindmap/store/useMindmapStore'

export const calculateConnectionPoints = (
    nodes: Record<string, Node>,
    connection: string
): [number, number, number, number] => {
    const [fromId, toId] = connection.split('---')
    const fromNode = nodes[fromId]
    const toNode = nodes[toId]
    const layoutStyle = useMindmapStore.getState().layoutStyle
    if(!fromNode || !toNode) return [0, 0, 0, 0]
    let startX = 0, startY = 0, endX = 0, endY = 0;

    if(layoutStyle === 'left-to-right') {
        // 开始的坐标，节点的右侧中心点
        startX = fromNode.position[0] + fromNode.size[0]
        startY = fromNode.position[1] + fromNode.size[1] / 2

        // 结束的坐标，节点的左侧中心点
        endX = toNode.position[0]
        endY = toNode.position[1] + toNode.size[1] / 2
    } else if (layoutStyle === 'right-to-left') {
        startX = fromNode.position[0];
        startY = fromNode.position[1] + fromNode.size[1] / 2;

        endX = toNode.position[0] + toNode.size[0];
        endY = toNode.position[1] + toNode.size[1] / 2;
    }

    return [startX, startY, endX, endY]
}