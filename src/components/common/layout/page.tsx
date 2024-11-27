import './page.module.less';

import classnames from 'classnames';

type IProps = {
  children: any;
  loading?: boolean;
  className?: string;
  inner?: boolean;
}

export function Page({
  children,
  className = '',
  loading = false,
  inner = true
}: IProps) {
  const loadingStyle = {
    height: 'calc(100vh - 184px)',
    overflow: 'hidden'
  };
  return (
    <div
      className={classnames(className, {
        contentInner: inner
      })}
      style={loading ? loadingStyle : null}
    >
      {children}
    </div>
  );
}

export default Page;
