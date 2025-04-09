import {Arrow, Group} from 'react-konva'
import {useMindmapStore} from '../store/useMindmapStore'
import { calculateConnectionPoints } from '../utils/connectionUtils'
import { Fragment } from 'react'



interface RecursiveNodeProps {
  nodeId: string;
}

const ConnectionRenderer = ({ nodeId }: RecursiveNodeProps) => {
  const nodes = useMindmapStore((state) => state.nodes); // 获取所有节点
  const node = nodes[nodeId];

  if (!node) return null;

  return (
      <Group>

          {/* 如果节点未折叠，递归渲染子节点 */}
          {!node.collapsed &&
              node.children.map((childId) => {
                  // 计算连接点
                  const [startX, startY, endX, endY] = calculateConnectionPoints(
                      nodes,
                      `${node.id}---${childId}`
                  );

                  return (
                      <Fragment key={childId}>
                          {/* 绘制连线 */}
                          <Arrow
                              points={[startX, startY, endX, endY]} // 起点和终点坐标
                              stroke="#94a3b8" // 线条颜色
                              strokeWidth={2} // 线条宽度
                              pointerLength={10} // 箭头长度
                              pointerWidth={10} // 箭头宽度
                          />
                          {/* 递归渲染子节点 */}
                          <ConnectionRenderer nodeId={childId} />
                      </Fragment>
                  );
              })}
      </Group>
  );
};

export default ConnectionRenderer;