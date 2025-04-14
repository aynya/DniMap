// 声明 react-konva-to-svg 的类型
declare module 'react-konva-to-svg' {
    import { Stage } from 'konva';

    /**
     * 导出 Konva Stage 为 SVG
     * @param stage Konva.Stage 对象
     * @param blob 是否导出为 Blob 格式，默认为 false（导出为文本格式）
     * @param options 可选配置对象
     * @returns 返回 SVG 字符串或 Blob
     */
    export function exportStageSVG(
        stage: Stage,
        blob?: boolean,
        options?: {
            onBefore?: (params: [Stage, unknown]) => void;
            onAfter?: (params: [Stage, unknown]) => void;
        }
    ): Promise<string | Blob>;
}