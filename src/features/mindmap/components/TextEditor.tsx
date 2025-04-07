import Konva from 'konva';
import { useEffect, useRef } from 'react'
import { type Node, useMindmapStore } from '../store/useMindmapStore';
import { Text } from 'react-konva'


const TextEditor = ({ node, onBlur }: { node: Node; onBlur: () => void }) => {
    const textRef = useRef<Konva.Text>(null)
    useEffect(() => {
      const textNode = textRef.current
      if (!textNode) return
  
      textNode.hide()
      const textarea = document.createElement('textarea')
      
      // 样式配置
      textarea.value = node.text
      textarea.style.position = 'absolute'
      textarea.style.top = `${textNode.absolutePosition().y}px`
      textarea.style.left = `${textNode.absolutePosition().x}px`
      textarea.style.width = `${textNode.width()}px`
      
      document.body.appendChild(textarea)
      textarea.focus()
  
      const handleBlur = () => {
        useMindmapStore.getState().actions.updateNodeText(node.id, textarea.value) // 更新节点文本
        onBlur() // 调用回调函数
        textarea.remove() // 移除textarea元素
      }
  
      textarea.addEventListener('blur', handleBlur)
      return () => textarea.remove()
    }, [ node.text, node.id, onBlur ])
  
    return <Text ref={textRef} text={node.text} />
  }
export default TextEditor