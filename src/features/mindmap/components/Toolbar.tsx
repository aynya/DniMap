// src/features/mindmap/components/Toolbar.tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { exportAsPNG, exportAsJSON, exportAsSVG, exportAsJPG, exportAsPDF, exportAsXMind, exportAsDMP, exportAsExcel, exportAsMarkdown } from '../../../lib/exporters'
import { applyLayoutStyle } from '../utils/applyLayoutStyle'
import { importFromDMP, importFromJSON, importFromMarkdown, importFromXlsx, importFromXMind } from '../../../lib/importers'
import { useMindmapStore } from '../store/useMindmapStore'
import '@ant-design/v5-patch-for-react-19';
import { Button, FloatButton, Tooltip, Modal, Card, Image, Typography  } from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  FileAddOutlined,
  FileOutlined,
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
  StarOutlined,
  LayoutOutlined,
  ClusterOutlined,
  MenuUnfoldOutlined,
  ControlOutlined,
  AimOutlined
} from '@ant-design/icons'
import { useState } from 'react'


// UndoOutlined RedoOutlined DeleteOutlined 
// <FileAddOutlined /> <FileOutlined /> <SaveOutlined />  <ImportOutlined />  <ExportOutlined />

export const Toolbar = () => {
  const actions = useMindmapStore(state => state.actions);
  const handleFileUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    switch (fileType) {
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









  const [isModalVisible, setIsModalVisible] = useState(false);
  const {Title} = Typography;

  // 对话框中的结构选项
  const structureOptions = [
    {
      title: 'left-to-right',
      image: '/images/left-to-right.png', // 替换为你的图片 URL
    },
    {
      title: 'right-to-left',
      image: '/images/right-to-left.png', // 替换为你的图片 URL
    },
    {
      title: 'center',
      image: '/images/center.png', // 替换为你的图片 URL
    },
    {
      title: 'top-to-bottom',
      image: '/images/top-to-bottom.png', // 替换为你的图片 URL
    },
  ];

  // 打开对话框
  const showModal = () => {
    setIsModalVisible(true);
  };

  // 关闭对话框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 处理结构选择
  const handleStructureSelect = (title: string) => {
    console.log(`选择了结构: ${title}`);
    if(title === 'left-to-right') {
      applyLayoutStyle('left-to-right'); 
      actions.saveState();
    } else if(title === 'right-to-left') {
      applyLayoutStyle('right-to-left');
      actions.saveState();
    } else if(title === 'center') {
      applyLayoutStyle('center');
      actions.saveState();
    } else if(title === 'top-to-bottom') {
      applyLayoutStyle('top-to-bottom');
      actions.saveState();
    }
    setIsModalVisible(false); // 选中后关闭对话框
  };







  return (
    <div>
      <div style={{ position: 'relative' }}>
        {/* 悬浮的工具栏 */}
        <div
          style={{
            position: 'absolute',
            top: '20px', // 距离顶部的距离
            left: '20px', // 距离左侧的距离
            display: 'flex',
            gap: '8px',
            padding: '8px',
            backgroundColor: '#f0f2f5',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 1000, // 确保悬浮层在其他元素之上
          }}
        >
          {/* 回退 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<UndoOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>回退</span>
          </div>

          {/* 前进 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<RedoOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>前进</span>
          </div>

          {/* 删除 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<DeleteOutlined />} danger />
            <span style={{ fontSize: '12px', marginTop: '4px', color: '#ff4d4f' }}>删除</span>
          </div>

          {/* 添加文件 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<FileAddOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>新建</span>
          </div>

          {/* 文件 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<FileOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>打开</span>
          </div>

          {/* 保存 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<SaveOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>另存为</span>
          </div>

          {/* 导入 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<ImportOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>导入</span>
          </div>

          {/* 导出 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<ExportOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>导出</span>
          </div>
        </div>
      </div>

      <>
        <FloatButton.Group shape="circle" style={{ insetInlineEnd: 100 }}>
          <Tooltip title="定位到根节点" placement="left">
            <FloatButton icon={<AimOutlined />} />
          </Tooltip>
        </FloatButton.Group>
        <FloatButton.Group shape="circle" style={{ insetInlineEnd: 25 }}>
          <Tooltip title="基础样式" placement="left">
            <FloatButton icon={<StarOutlined />} />
          </Tooltip>
          <Tooltip title="主题" placement="left">
            <FloatButton icon={<LayoutOutlined />} />
          </Tooltip>
          <Tooltip title="结构" placement="left">
            <FloatButton icon={<ClusterOutlined />} onClick={showModal}/>
          </Tooltip>
          <Tooltip title="大纲" placement="left">
            <FloatButton icon={<MenuUnfoldOutlined />} />
          </Tooltip>
          <Tooltip title="快捷键" placement="left">
            <FloatButton icon={<ControlOutlined />} />
          </Tooltip>
        </FloatButton.Group>
        {/* 对话框 */}
        <Modal
          title="选择结构"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null} // 不显示默认的底部按钮
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 50 }}>
            {structureOptions.map((option, index) => (
              <Card
                key={index}
                hoverable
                style={{ width: 200 }}
                onClick={() => handleStructureSelect(option.title)}
              >
                <Image preview={false} src={option.image} alt={option.title} />
                <Title level={5} style={{ textAlign: 'center' }}>
                  {option.title}
                </Title>
              </Card>
            ))}
          </div>
        </Modal>
      </>

    </div>



    // <div className="fixed top-4 left-4 flex gap-2">
    //   <DropdownMenu.Root>
    //     <DropdownMenu.Trigger className="px-4 py-2 bg-white rounded-lg shadow">
    //       文件
    //     </DropdownMenu.Trigger>

    //     <DropdownMenu.Portal>
    //       <DropdownMenu.Content className="bg-white rounded-lg p-2 shadow-lg">
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsJSON()}
    //         >
    //           导出JSON
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsPNG()}
    //         >
    //           导出png
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsSVG()}
    //         >
    //           导出svg
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsJPG()}
    //         >
    //           导出jpg
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsPDF()}
    //         >
    //           导出pdf
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsXMind()}
    //         >
    //           导出xmind
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsDMP()}
    //         >
    //           导出专有文件
    //         </DropdownMenu.Item>

    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsExcel()}
    //         >
    //           导出Excel
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => exportAsMarkdown()}
    //         >
    //           导出markdown
    //         </DropdownMenu.Item>
    //       </DropdownMenu.Content>
    //     </DropdownMenu.Portal>


    //   </DropdownMenu.Root>

    //   <DropdownMenu.Root>
    //     <DropdownMenu.Trigger className="px-4 py-2 bg-white rounded-lg shadow">
    //       结构
    //     </DropdownMenu.Trigger>
    //     <DropdownMenu.Portal>
    //       <DropdownMenu.Content className="bg-white rounded-lg p-2 shadow-lg">
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => {applyLayoutStyle('left-to-right'); actions.saveState()}}
    //         >
    //           从左到右
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => {applyLayoutStyle('right-to-left'); actions.saveState()}}
    //         >
    //           从右到左
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => {applyLayoutStyle('center'); actions.saveState()}}
    //         >
    //           从中间到外
    //         </DropdownMenu.Item>
    //         <DropdownMenu.Item
    //           className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    //           onSelect={() => {applyLayoutStyle('top-to-bottom'); actions.saveState()}}
    //         >
    //           从上到下
    //         </DropdownMenu.Item>
    //       </DropdownMenu.Content>
    //     </DropdownMenu.Portal>
    //   </DropdownMenu.Root>

    //   <input type="file" onChange={(e) => {
    //     const file = e.target.files?.[0];
    //     if(file) {
    //       handleFileUpload(file);
    //     }
    //   }}/>
    // </div>
  )
}
export default Toolbar