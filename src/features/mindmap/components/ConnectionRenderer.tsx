import { Group, Shape } from 'react-konva'
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
                            <Shape
                                sceneFunc={(ctx, shape) => {
                                    ctx.beginPath()
                                    ctx.moveTo(startX, startY)
                                    ctx.quadraticCurveTo(
                                        startX,
                                        endY,
                                        endX,
                                        endY
                                    )
                                    ctx.fillStrokeShape(shape)
                                }}
                                stroke="blue"
                                strokeWidth={2}             
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