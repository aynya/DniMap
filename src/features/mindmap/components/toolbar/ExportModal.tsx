import { exportAsPNG, exportAsJSON, exportAsSVG, exportAsJPG, exportAsPDF, exportAsXMind, exportAsDMP, exportAsExcel, exportAsMarkdown } from '../../../../lib/exporters'
import '@ant-design/v5-patch-for-react-19';
import {
    Button,
    Modal,
    Form,
    Input,
    Radio,
    message,
    Space,
    Row,
    Col,

} from 'antd'
import {
    ExportOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { excelIcon, pdfIcon, xmindIcon, mdIcon, jsonIcon, dmpIcon, jpIcon, svgIcon } from '../MyIcon'

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
                <Form form={form} name="exportForm" onFinish={onFinish} initialValues={{ fileName: 'dnimap' }}>
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
                                                                height: 50,
                                                                lineHeight: '50px',
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

export default ExportModal;