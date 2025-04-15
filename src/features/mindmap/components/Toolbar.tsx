// src/features/mindmap/components/Toolbar.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { exportAsPNG, exportAsJSON, exportAsSVG } from '../../../lib/exporters'
import { useMindmapStore } from '../store/useMindmapStore'
import calculateTreeLayout from '../utils/calculateTreeLayoutUntils'
import calculateCenterLayout from '../utils/calculateCenterLayout'

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
              onSelect={() => {
                useMindmapStore.setState({ layoutStyle: 'left-to-right' })
                const updateChildrenDirections = useMindmapStore.getState().actions.updateChildrenDirections;
                updateChildrenDirections();
                calculateTreeLayout();


                const nodes = useMindmapStore.getState().nodes;
                console.log('节点:', nodes);
              }}
            >
              从左到右
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={() => {
                useMindmapStore.setState({ layoutStyle: 'right-to-left' })
                const updateChildrenDirections = useMindmapStore.getState().actions.updateChildrenDirections;
                updateChildrenDirections();
                calculateTreeLayout();

                const nodes = useMindmapStore.getState().nodes;
                console.log('节点:', nodes);
              }}
            >
              从右到左
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onSelect={ () => {
                useMindmapStore.setState({ layoutStyle: 'center' })
                const updateChildrenDirections = useMindmapStore.getState().actions.updateChildrenDirections;
                updateChildrenDirections();
                calculateCenterLayout();


                const nodes = useMindmapStore.getState().nodes;
                console.log('节点:', nodes);
                
              }}
            >
              从中间到外
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
export default Toolbar