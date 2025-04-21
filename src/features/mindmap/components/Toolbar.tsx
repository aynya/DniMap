import { exportAsPNG, exportAsJSON, exportAsSVG, exportAsJPG, exportAsPDF, exportAsXMind, exportAsDMP, exportAsExcel, exportAsMarkdown } from '../../../lib/exporters'
import { applyLayoutStyle } from '../utils/applyLayoutStyle'
import { importFromDMP, importFromJSON, importFromMarkdown, importFromXlsx, importFromXMind } from '../../../lib/importers'
import { useMindmapStore, Node } from '../store/useMindmapStore'
import '@ant-design/v5-patch-for-react-19';
import {
  Button,
  FloatButton,
  Tooltip,
  Modal,
  Card,
  Image,
  Typography,
  Form,
  Input,
  Radio,
  message,
  Space,
  Row,
  Col,
  Upload,
  Tree,

} from 'antd'
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
  AimOutlined,
  InboxOutlined,

} from '@ant-design/icons'
import { useState } from 'react'
const { Title } = Typography;
import { excelIcon, pdfIcon, xmindIcon, mdIcon, jsonIcon, dmpIcon, jpIcon, svgIcon } from './MyIcon'
import { UploadFile } from 'antd/es/upload/interface'
import Konva from 'konva'





const ExportModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [checkImage, setCheckImage] = useState('png');


  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = (values: { fileName: string }) => {
    console.log('Received values of form: ', values);
    console.log('Selected format: ', selectedFormat);

    try {
      switch (selectedFormat) {
        case 'json':
          exportAsJSON(values.fileName);
          break;
        case 'image':
          if (checkImage === 'png') {
            exportAsPNG(values.fileName);
          } else {
            exportAsJPG(values.fileName);
          }
          break;
        case 'svg':
          exportAsSVG(values.fileName);
          break;
        case 'pdf':
          exportAsPDF(values.fileName);
          break;
        case 'markdown':
          exportAsMarkdown(values.fileName);
          break;
        case 'excel':
          exportAsExcel(values.fileName);
          break;
        case 'xmind':
          exportAsXMind(values.fileName);
          break;
        case 'dmp':
          exportAsDMP(values.fileName);

      }
    } catch (err) {
      console.error('导出失败:', err);
      message.error('导出失败，请重试！');
      return;
    }


    message.success('导出成功！');
    setIsModalVisible(false);
  };

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: jsonIcon(), description: '数据交换格式文件' },
    { value: 'image', label: '图片', icon: jpIcon(), description: '常用图片格式，适合查看分享' },
    { value: 'svg', label: 'SVG', icon: svgIcon(), description: '可缩放矢量图形文件' },
    { value: 'pdf', label: 'PDF', icon: pdfIcon(), description: '适合查看浏览和打印' },
    { value: 'markdown', label: 'Markdown', icon: mdIcon(), description: '轻量级标记语言文件' },
    { value: 'excel', label: 'Excel', icon: excelIcon(), description: '电子表格文件' },
    { value: 'xmind', label: 'XMind', icon: xmindIcon(), description: 'XMind软件格式' },
    { value: 'dmp', label: '专有文件', icon: dmpIcon(), description: 'DniMap私有格式，可用于再次导入，客户端可直接编辑' },
  ];

  return (
    <>
      {/* 导出按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button icon={<ExportOutlined />} onClick={showModal} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>导出</span>
      </div>

      {/* 导出对话框 */}
      <Modal
        title="导出"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            确定
          </Button>,
        ]}
        width={800} // 设置弹窗宽度
      >
        <Form form={form} name="exportForm" onFinish={onFinish} initialValues={{ fileName: 'myMindMap' }}>
          <Form.Item
            label="导出文件名称"
            name="fileName"
            rules={[{ required: true, message: '请输入文件名!' }]}
          >
            <Input placeholder="请输入文件名" />
          </Form.Item>

          <Row gutter={16}>
            {/* 左侧格式选择 */}
            <Col span={8}>
              <div style={{ maxHeight: 300, overflowY: 'auto', borderRight: '1px solid #ddd', paddingRight: 16 }}>
                <Form.Item label="格式">
                  <Radio.Group
                    name="format"
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    value={selectedFormat}
                  >
                    <Space direction="vertical">
                      {formatOptions.map((option) => (
                        <Radio
                          key={option.value}
                          value={option.value}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center', height: 50, lineHeight: '50px' }}>
                              {option.icon}
                            </span>
                            <span
                              style={{
                                display: 'inline-block',
                                height: 50, // 设置高度与图标一致
                                lineHeight: '50px', // 垂直居中文本
                                marginLeft: 8,
                              }}
                            >
                              {option.label}
                            </span>
                          </div>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </div>
            </Col>

            {/* 右侧格式说明 */}
            <Col span={16}>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {selectedFormat && (
                  <Form.Item label="说明">
                    {formatOptions.find((option) => option.value === selectedFormat)?.description}
                  </Form.Item>
                )}

                {/* 根据格式显示额外选项 */}
                {selectedFormat === 'image' && (
                  <Form.Item label="图片格式" >
                    <Radio.Group
                      name="imageFormat"
                      onChange={(e) => setCheckImage(e.target.value)}
                      value={checkImage}
                    >
                      <Radio value="png" >PNG</Radio>
                      <Radio value="jpg">JPG</Radio>
                    </Radio.Group>
                  </Form.Item>
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};



const ImportModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    form.setFieldsValue({ file: [] });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values: { file: UploadFile[] }) => {
    console.log('Received values of form: ', values);
    try {
      const fileName = values.file[0].name;
      const file = values.file[0].originFileObj as File; // 获取文件对象
      const fileType = fileName.split('.').pop()?.toLowerCase();
      switch (fileType) {
        case 'dmp':
          await importFromDMP(file);
          break;
        case 'json':
          await importFromJSON(file);
          break;
        case 'md':
          await importFromMarkdown(file);
          break;
        case 'xmind':
          await importFromXMind(file);
          break;
        case 'xlsx':
          await importFromXlsx(file);
          break;
        default:
          throw new Error(`不支持的文件类型: ${fileType}`);
      }
      useMindmapStore.setState({
        history: [{
          nodes: useMindmapStore.getState().nodes,
          connections: useMindmapStore.getState().connections,
          layoutStyle: useMindmapStore.getState().layoutStyle,
        }]
      })
    } catch (err) {
      console.error('导入失败:', err);
      message.error('导入失败，请重试！');
      return;
    }



    message.success('导入成功！');
    setIsModalVisible(false);
  };

  return (
    <>
      {/* 导入按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button icon={<ImportOutlined />} onClick={showModal} />
        <span style={{ fontSize: '12px', marginTop: '4px' }}>导入</span>
      </div>

      {/* 导入对话框 */}
      <Modal
        title="导入"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            确定
          </Button>,
        ]}
        width={400} // 设置弹窗宽度
      >
        <Form form={form} name="importForm" onFinish={onFinish}>
          <Form.Item
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e.slice(0, 1); // 限制为单个文件
              }
              return e && e.fileList.slice(0, 1); // 限制为单个文件
            }}
            rules={[{ required: true, message: '请选择一个文件!' }]}
          >
            <Upload.Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false} // 阻止自动上传
              accept=".dmp, .json, .md, .xlsx, .xmind"
              style={{ textAlign: 'center' }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到这里上传</p>
              <p className="ant-upload-hint">支持.dmp, .json, .md, .xlsx, .xmind文件</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};







const Outline = () => {
  const [outlineVisible, setOutlineVisible] = useState(false);

  // 获取 Stage 实例
  const getStageFromContainer = () => {
    const container = document.getElementById('konva-container');
    if (!container) {
      console.error('Container not found!');
      return null;
    }

    const stage = Konva.stages.find((s) => s.container() === container);
    if (!stage) {
      console.error('Stage not found!');
      return null;
    }

    return stage;
  };

  interface TreeDataItem {
    title: string;
    key: string;
    children?: TreeDataItem[];
  }

  // 递归生成 Tree 数据
  const generateTreeData = (nodes: Record<string, Node>, rootId: string): TreeDataItem[] => {
    const rootNode = nodes[rootId];
    if (!rootNode) return [];

    return [
      {
        title: rootNode.text,
        key: rootNode.id,
        children: rootNode.children.map((childId) => generateTreeData(nodes, childId)).flat(),
      },
    ];
  };

  // 从 store 中获取 nodes 数据
  const { nodes } = useMindmapStore.getState();
  const treeData = generateTreeData(nodes, 'root'); // 假设根节点 ID 为 'root'

  // 处理节点点击事件
  const handleNodeClick = (selectedKeys: string[]) => {
    const nodeId = selectedKeys[0];
    const stage = getStageFromContainer();

    if (stage && nodes[nodeId]) {
      const nodePosition = nodes[nodeId].position;
      const rootNodePosition = nodes['root'].position;
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: -nodePosition[0] + rootNodePosition[0], y: -nodePosition[1] + rootNodePosition[1]}); // 调整视图到节点位置
      stage.batchDraw(); // 触发重绘
    }
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <Tooltip title="大纲" placement="left">
        <FloatButton
          icon={<MenuUnfoldOutlined />}
          onClick={() => setOutlineVisible(!outlineVisible)} // 切换大纲显示状态
        />
      </Tooltip>

      {/* 大纲面板 */}
      {outlineVisible && (
        <div
          style={{
            position: 'absolute',
            height: 300,
            right: 50,
            width: 300,
            background: '#fff',
            padding: 16,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflowY: 'auto',
            overflowX: 'auto',
          }}
        >
          <Tree
            showLine
            defaultExpandAll
            onSelect={(selectedKeys) => handleNodeClick(selectedKeys as string[])}
            treeData={treeData}
          />
        </div>
      )}
    </>
  );
}






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
          {/* <Tooltip title="大纲" placement="left">
            <FloatButton icon={<MenuUnfoldOutlined />} />
          </Tooltip> */}
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