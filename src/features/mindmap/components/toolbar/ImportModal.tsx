
import { importFromDMP, importFromJSON, importFromMarkdown, importFromXlsx, importFromXMind } from '../../../../lib/importers'
import { useMindmapStore } from '../../store/useMindmapStore'
import '@ant-design/v5-patch-for-react-19';
import {
    Button,
    Modal,
    Form,
    message,
    Upload,

} from 'antd'
import {
    ImportOutlined,
    InboxOutlined,

} from '@ant-design/icons'
import { useState } from 'react'
import { UploadFile } from 'antd/es/upload/interface'


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
                                return e.slice(0, 1);
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

export default ImportModal;