import { Arrow, Group } from 'react-konva'
import { useMindmapStore } from '../store/useMindmapStore'
import { calculateConnectionPoints } from '../utils/connectionUtils'
import { Fragment } from 'react'



interface RecursiveNodeProps {
    nodeId: string;
}

const ConnectionRenderer = ({ nodeId }: RecursiveNodeProps) => {
    const nodes = useMindmapStore(state => state.nodes)
    const node = nodes[nodeId]

    if (!node) return null

    return (
        <Group>
            {!node.collapsed &&
                node.children.map((childId) => {
                    const [startX, startY, endX, endY] = calculateConnectionPoints(nodes, `${node.id}---${childId}`)
                    return (
                        <Fragment key={`${node.id}---${childId}`}>
                            <Arrow
                                points={[startX, startY, endX, endY]}
                                stroke="#94a3b8"
                                strokeWidth={2}
                                pointerLength={10}
                                pointerWidth={10}
                            />
                            <ConnectionRenderer nodeId={childId} />
                        </Fragment>
                    )
                })
            }
        </Group>
    )
};

export default ConnectionRenderer;