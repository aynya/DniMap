// src/features/mindmap/components/MindmapCanvas.tsx
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import { useState, memo } from 'react'
import  {useMindmapStore, type Node as MindmapNode } from '../store/useMindmapStore'
import  TextEditor  from './TextEditor'

export const MindmapCanvas = () => {
  const nodes = useMindmapStore(state => state.nodes)
  
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {Object.values(nodes).map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </Layer>
    </Stage>
  )
}

const Node = memo(({ node }: { node: MindmapNode }) => {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <Group
      x={node.position[0]}
      y={node.position[1]}
      draggable
      onDragEnd={(e) => {
        useMindmapStore.getState().actions.setNodePosition(
          node.id, 
          [e.target.x(), e.target.y()]
        )
      }}
    >
      <Rect
        width={200}
        height={60}
        fill="#ffffff"
        stroke="#4f46e5"
        cornerRadius={8}
      />
      {isEditing ? (
        <TextEditor node={node} onBlur={() => setIsEditing(false)} />
      ) : (
        <Text
          text={node.text}
          fontSize={16}
          padding={10}
          onClick={() => setIsEditing(true)}
        />
      )}
    </Group>
  )
})