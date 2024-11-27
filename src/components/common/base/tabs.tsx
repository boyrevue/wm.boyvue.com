/* eslint-disable react/prop-types */
import { TabsProps } from 'antd';
import classnames from 'classnames';
import RcTabs from 'rc-tabs';
import React from 'react';

export const { TabPane } = RcTabs;

export function Tabs({
  prefixCls = 'ant-tabs',
  size = 'large',
  animated = {
    inkBar: true,
    tabPane: true
  },
  defaultActiveKey,
  className,
  ...props
}: React.PropsWithRef<TabsProps & { animated?: any }>) {
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey);
  const onTabClick = (key) => {
    setActiveKey(key);
  };
  return (
    <RcTabs
      className={classnames(className, { [`${prefixCls}-${size}`]: size })}
      prefixCls={prefixCls}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      renderTabBar={(_, TabNavList: any) => (
        <TabNavList
          animated={animated}
          onTabClick={onTabClick}
          activeKey={activeKey}
        />
      )}
      animated={animated}
      {...props}
    />
  );
}

export default Tabs;
