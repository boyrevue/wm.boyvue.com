import { Layout } from 'antd';
import Link from 'next/link';
import { connect, ConnectedProps } from 'react-redux';

import style from './header.module.less';
// import MiddleMenu from './middle-menu';

const mapState = (state: any) => ({
  ui: state.ui
});

const connector = connect(mapState);

type PropsFromRedux = ConnectedProps<typeof connector>;

function HeaderLogin({
  ui
}: PropsFromRedux) {
  return (

    <Layout.Header className={`${style['header-login-page']}`}>
      <Link href="/">
        <a
          title="Homepage"
          className={`${style['logo-login-desktop']}`}
        >
          {ui?.whiteLogo ? (
            <img alt="logo" src={ui?.whiteLogo} height="64" />
          ) : (
            <span>{ui?.siteName}</span>
          )}
        </a>
      </Link>
      <Link href="/">
        <a
          title="Homepage"
          className={`${style['logo-login-mobile']}`}
        >
          {ui?.logo ? (
            <img alt="logo" src={ui?.logo} height="64" />
          ) : (
            <span>{ui?.siteName}</span>
          )}
        </a>
      </Link>
    </Layout.Header>

  );
}

export default connector(HeaderLogin);
