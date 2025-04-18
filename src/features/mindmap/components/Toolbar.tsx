// src/features/mindmap/components/Toolbar.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { exportAsPNG, exportAsJSON, exportAsSVG, exportAsJPG, exportAsPDF, exportAsXMind, exportAsDMP, exportAsExcel, exportAsMarkdown } from '../../../lib/exporters'
import {applyLayoutStyle} from '../utils/applyLayoutStyle'
import { importFromDMP, importFromJSON, importFromMarkdown, importFromXlsx, importFromXMind } from '../../../lib/importers'
import { useMindmapStore } from '../store/useMindmapStore'

export const Toolbar = () => {
  const actions = useMindmapStore(state => state.actions);
  const handleFileUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    switch(fileType) {
      case 'xlsx':
        importFromXlsx(file);
        break;
      case 'md':
        importFromMarkdown(file);
        break;
      case 'xmind':
        importFromXMind(file);
        break;
      case 'json':
        importFromJSON(file);
        break;
      case 'dmp':
        importFromDMP(file);
        break;
    }
  }

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
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsXMind()}
            >
              导出xmind
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsDMP()}
            >
              导出专有文件
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsExcel()}
            >
              导出Excel
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => exportAsMarkdown()}
            >
              导出markdown
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
              onSelect={() => {applyLayoutStyle('left-to-right'); actions.saveState()}}
            >
              从左到右
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => {applyLayoutStyle('right-to-left'); actions.saveState()}}
            >
              从右到左
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => {applyLayoutStyle('center'); actions.saveState()}}
            >
              从中间到外
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => {applyLayoutStyle('top-to-bottom'); actions.saveState()}}
            >
              从上到下
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <input type="file" onChange={(e) => {
        const file = e.target.files?.[0];
        if(file) {
          handleFileUpload(file);
        }
      }}/>
    </div>
  )
}
export default Toolbar