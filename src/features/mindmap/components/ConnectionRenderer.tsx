import {Arrow} from 'react-konva'
import {useMindmapStore} from '../store/useMindmapStore'
import { calculateConnectionPoints } from '../utils/connectionUtils'
import { memo, useMemo } from 'react'

const ConnectionRenderer = memo(() => {
    const connections = useMindmapStore((state) => state.connections)
    const nodes = useMindmapStore((state) => state.nodes)

    // console.log('connections', connections)
    const connectionElements = useMemo(() => {
        return connections.map((connection) => {
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
        })
      }, [connections, nodes]) // 当 connections 或 nodes 变化时重新计算
    // console.log('connections', connections)
    return <>{connectionElements}</>
})

export default ConnectionRenderer