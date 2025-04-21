import { applyLayoutStyle } from '../utils/applyLayoutStyle'
import { useMindmapStore } from '../store/useMindmapStore'
import '@ant-design/v5-patch-for-react-19';
import {
  Button,
  FloatButton,
  Tooltip,
  Modal,
  Card,
  Image,
  Typography,

} from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  FileAddOutlined,
  FileOutlined,
  SaveOutlined,
  StarOutlined,
  LayoutOutlined,
  ClusterOutlined,
  ControlOutlined,
  AimOutlined,

} from '@ant-design/icons'
import { useState } from 'react'
const { Title } = Typography;
import Konva from 'konva'
import ExportModal from './toolbar/ExportModal';
import ImportModal from './toolbar/ImportModal';
import Outline from './toolbar/Outline';





export const Toolbar = () => {
  const actions = useMindmapStore(state => state.actions);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectedNodes = useMindmapStore(state => state.selectedNodes);
  const history = useMindmapStore(state => state.history);
  const future = useMindmapStore(state => state.future);


  // 模拟按下 Backspace 键
  const simulateBackspaceKeyPress = () => {
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: 'Backspace',
      code: 'Backspace',
      keyCode: 8,
      which: 8,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(keyboardEvent); // 分发事件到文档
  };


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
    if (title === 'left-to-right') {
      applyLayoutStyle('left-to-right');
      actions.saveState();
    } else if (title === 'right-to-left') {
      applyLayoutStyle('right-to-left');
      actions.saveState();
    } else if (title === 'center') {
      applyLayoutStyle('center');
      actions.saveState();
    } else if (title === 'top-to-bottom') {
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
            <Button icon={<UndoOutlined />} disabled={history.length <= 1} onClick={() => actions.undo()} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>回退</span>
          </div>

          {/* 前进 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<RedoOutlined />} disabled={future.length === 0} onClick={() => actions.redo()} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>前进</span>
          </div>

          {/* 删除 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<DeleteOutlined />} danger disabled={selectedNodes.length === 0} onClick={() => { simulateBackspaceKeyPress() }} />
            <span style={{ fontSize: '12px', marginTop: '4px', color: '#ff4d4f' }}>删除</span>
          </div>

          {/* 新建 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button icon={<FileAddOutlined />} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>新建</span>
          </div>

          {/* 打开 */}
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
          {ImportModal()}

          {/* 导出 */}
          {ExportModal()}
        </div>
      </div>

      <>
        <FloatButton.Group shape="circle" style={{ insetInlineEnd: 100 }}>
          <Tooltip title="定位到根节点" placement="left">
            <FloatButton icon={<AimOutlined />} onClick={() => {
              console.log(document.getElementById('konva-container'));
              const container = document.getElementById('konva-container');
              if (!container) {
                console.error('Container not found!');
                return;
              }
              const stage = Konva.stages.find((s) => s.container() === container);
              if (!stage) {
                console.error('Stage not found!');
                return;
              }
              stage.position({ x: 0, y: 0 });
              stage.scale({ x: 1, y: 1 });
            }} />
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
            <FloatButton icon={<ClusterOutlined />} onClick={showModal} />
          </Tooltip>
          {/* 大纲 */}
          {Outline()}
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

  )
}
export default Toolbar