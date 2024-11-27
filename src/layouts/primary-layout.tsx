import { BackTop, Layout } from 'antd';
import dynamic from 'next/dynamic';
import { IUIConfig } from 'src/interfaces/ui-config';

import style from './primary-layout.module.less';

const Header = dynamic(() => import('@components/common/header/header'));
const Footer = dynamic(() => import('@components/common/layout/footer'));

interface IDefaultProps extends IUIConfig {
  children: any;
}

function PrimaryLayout({
  children
}: IDefaultProps) {
  return (
    <Layout>
      <div
        className="primary-container"
        id="primaryLayout"
      >
        <Header />
        <Layout.Content
          className="content"
          style={{ position: 'relative' }}
        >
          {children}
        </Layout.Content>
        <BackTop className={style.backTop} />
        <Footer />
      </div>
    </Layout>
  );
}

export default PrimaryLayout;
