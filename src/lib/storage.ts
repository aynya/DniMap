// src/lib/storage.ts
import localforage from 'localforage'
import { useMindmapStore, type State } from '../features/mindmap/store/useMindmapStore'
export const initStorage = async () => {
  const saved = await localforage.getItem<State>('mindmap')
  if (saved) useMindmapStore.setState(saved)
  
  // 自动保存
  useMindmapStore.subscribe((state) => {
    localforage.setItem('mindmap', {
      nodes: state.nodes,
      connections: state.connections
    })
  })
}

// 在应用初始化时调用
initStorage()