// src/features/mindmap/components/Toolbar.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { exportAsPNG, exportAsJSON, exportAsSVG, exportAsJPG, exportAsPDF } from '../../../lib/exporters'
import {applyLayoutStyle} from '../utils/applyLayoutStyle'

export const Toolbar = () => {
  return (
    <div className="fixed top-4 left-4 flex gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-4 py-2 bg-white rounded-lg shadow">
          文件
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-white rounded-lg p-2 shadow-lg">
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsJSON()}
            >
              导出JSON
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsPNG()}
            >
              导出png
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsSVG()}
            >
              导出svg
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsJPG()}
            >
              导出jpg
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsPDF()}
            >
              导出pdf
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>


      </DropdownMenu.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="px-4 py-2 bg-white rounded-lg shadow">
          结构
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-white rounded-lg p-2 shadow-lg">
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => applyLayoutStyle('left-to-right')}
            >
              从左到右
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => applyLayoutStyle('right-to-left')}
            >
              从右到左
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => applyLayoutStyle('center')}
            >
              从中间到外
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => applyLayoutStyle('top-to-bottom')}
            >
              从上到下
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
export default Toolbar