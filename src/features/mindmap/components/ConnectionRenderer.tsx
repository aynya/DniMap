import {Arrow} from 'react-konva'
import {useMindmapStore} from '../store/useMindmapStore'
import { calculateConnectionPoints } from '../utils/connectionUtils'

const ConnectionRenderer = () => {
    const connections = useMindmapStore((state) => state.connections)
    const nodes = useMindmapStore((state) => state.nodes)
    // console.log('connections', connections)
    return (
        <>
            {connections.map((connection) => {
                console.log('connection', connection)
                const points = calculateConnectionPoints(nodes, connection)
                return (
                    <Arrow
                        key={connection}
                        points={points}
                        stroke="#94a3b8"
                        strokeWidth={2}
                        pointerLength={10}
                        pointerWidth={10}
                    />
                )
            })}
        </>
    )
}

export default ConnectionRenderer