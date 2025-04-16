import { useMindmapStore } from '../store/useMindmapStore';
import calculateTreeLayout from './calculateTreeLayoutUntils';
import calculateCenterLayout from './calculateCenterLayout';
import calculateVerticaLayout from './calculateVerticaLayout';

export const applyLayoutStyle = (layoutStyle: 'left-to-right' | 'right-to-left' | 'center' | 'top-to-bottom') => {
  // 更新布局样式
  useMindmapStore.setState({ layoutStyle });

  // 更新子节点方向
  const updateChildrenDirections = useMindmapStore.getState().actions.updateChildrenDirections;
  updateChildrenDirections();

  // 根据布局样式计算布局
  if (layoutStyle === 'center') {
    calculateCenterLayout();
  } else if(layoutStyle === 'top-to-bottom') {
    calculateVerticaLayout();
  } else {
    calculateTreeLayout();
  }

  const nodes = useMindmapStore.getState().nodes;
  console.log('节点:', nodes);
};