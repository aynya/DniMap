// src/lib/exporters.ts
import { saveAs } from 'file-saver'
import { useMindmapStore } from '../features/mindmap/store/useMindmapStore'
import html2canvas from 'html2canvas';

export const exportAsJSON = () => {
    const state = useMindmapStore.getState()
    const data = JSON.stringify({
        nodes: state.nodes,
        connections: state.connections
    }, null, 2)

    const blob = new Blob([data], { type: 'application/json' })
    saveAs(blob, 'mindmap.json')
}

export const importFromJSON = async (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string)
            useMindmapStore.setState(data)
        } catch (error) {
            console.error('文件解析失败', error)
        }
    }
    reader.readAsText(file)
}

export const exportAsImage = async () => {
    const stageElement = document.querySelector('.konvajs-content'); // 找到 Konva 画布容器
    if (!stageElement) {
        console.error('无法找到画布元素');
        return;
    }

    try {
        // 使用 html2canvas 捕获画布内容
        const canvas = await html2canvas(stageElement as HTMLElement);
        const dataUrl = canvas.toDataURL('image/png');

        // 将图片保存为文件
        const blob = await fetch(dataUrl).then((res) => res.blob());
        saveAs(blob, 'mindmap.png');
    } catch (error) {
        console.error('导出图片失败', error);
    }
}