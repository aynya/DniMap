// src/App.tsx
import { MindmapCanvas } from './features/mindmap/components/MindmapCanvas'
import { Toolbar } from './features/mindmap/components/Toolbar'

function App() {
  return (
    <div className="h-screen w-screen">
      <Toolbar />
      <MindmapCanvas />
    </div>
  )
}

export default App