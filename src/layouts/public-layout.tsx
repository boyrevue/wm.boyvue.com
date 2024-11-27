import { BackTop, Layout } from 'antd';
import dynamic from 'next/dynamic';
import { IUIConfig } from 'src/interfaces/ui-config';

import style from './primary-layout.module.less';

const HeaderLogin = dynamic(() => import('@components/common/header/header-login'));

interface IDefaultProps extends IUIConfig {
  children: any;
}

function PublicLayout({
  children
}: IDefaultProps) {
  return (
    <Layout>
      <HeaderLogin />
      <div
        className="primary-container"
        id="primaryLayout"
      >
        <Layout.Content
          className="login-content"
        >
          {children}
        </Layout.Content>
        <BackTop className={style.backTop} />
      </div>
    </Layout>
  );
}

export default PublicLayout;
