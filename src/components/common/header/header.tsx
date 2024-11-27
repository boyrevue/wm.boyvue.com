import { ITopupWalletModal } from '@components/wallet/topup-wallet-modal';
import { openTopupModal } from '@redux/wallet/actions';
import { Layout } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import style from './header.module.less';
import MiddleMenu from './middle-menu';
import SignupMenu from './signup-menu';
import TipNotification from './tip-notification';
// user needs to login, we don't render from server side but client side
// not affect to SEO data
const LoggedInMenu = dynamic(() => import('./logged-in-menu'), { ssr: false });
const UserMenuDrawer = dynamic(() => import('./user-menu-drawer'), { ssr: false });
const TopupWalletModal = dynamic<ITopupWalletModal>(() => import('@components/wallet/topup-wallet-modal'), { ssr: false });
const Popup18Plus = dynamic(() => import('@components/common/popup-18plus-content'), { ssr: false });
const ModelUnverifiedAlert = dynamic(() => import('./model-unverified-alert'), { ssr: false });

const mapState = (state: any) => ({
  loggedIn: state.auth.loggedIn,
  ui: state.ui,
  openTopup: state.wallet.openTopup
});

const mapDispatch = {
  openTopupModalHandler: openTopupModal
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function onScroll() {
  const div = document.getElementById('main-header');
  if (!div) return;

  // TODO - check size
  const rightItemWidth = 35;
  const logoElems = document.querySelectorAll<HTMLElement>('.logo-nav');
  const logoWidth = 25; // logoElems.length ? logoElems[0].clientWidth : 50;
  const menuProfiles = document.querySelectorAll<HTMLElement>('.menu-profile');
  if (div.scrollLeft > logoWidth) {
    // logo-nav
    Array.from(logoElems).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderRight = '1px solid #fff';
    });
  } else {
    Array.from(logoElems).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderRight = 'none';
    });
  }

  if (div.scrollWidth - (div.clientWidth + div.scrollLeft) < rightItemWidth) {
    Array.from(menuProfiles).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderLeft = 'none';
    });
  } else {
    Array.from(menuProfiles).forEach((elem) => {
      // eslint-disable-next-line no-param-reassign
      elem.style.borderLeft = '1px solid #fff';
    });
  }
}

function attachScrollListener() {
  const div = document.getElementById('main-header');
  if (!div) return;
  div.addEventListener('scroll', onScroll);
}

function removeScrollListener() {
  const div = document.getElementById('main-header');
  if (!div) return;
  div.removeEventListener('scroll', onScroll);
}

function Header({
  ui,
  loggedIn,
  openTopup,
  openTopupModalHandler
}: PropsFromRedux) {
  const onCloseTopupModal = () => {
    openTopupModalHandler({ open: false });
  };

  useEffect(() => {
    onScroll();
    attachScrollListener();
    window.addEventListener('resize', onScroll);

    return () => {
      removeScrollListener();
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={`${style['main-header']}`} id="main-header">
      <Layout.Header className={`${style['main-layout-header']}`} id="layoutHeader">
        <div className={`${style['nav-bar']}`}>
          <div
            className={`${style['left-conner']} scroll`}
          >
            <Link href="/">
              <a
                title="Homepage"
                className={`${style['logo-nav']}`}
              >
                {ui?.logo ? (
                  <img alt="logo" src={ui?.logo} height="64" />
                ) : (
                  <span>{ui?.siteName}</span>
                )}
              </a>
            </Link>
            <MiddleMenu />
          </div>

          {!loggedIn
          && (
          <div className="right-header">
            <SignupMenu />
          </div>
          )}
          {!!loggedIn && (
            <div className="right-header">
              <LoggedInMenu />
              <UserMenuDrawer />
            </div>
          )}
        </div>
        <TopupWalletModal visible={openTopup} onClose={onCloseTopupModal} />
        <Popup18Plus />
      </Layout.Header>
      <ModelUnverifiedAlert />
      <TipNotification />
    </div>
  );
}

export default connector(Header);
