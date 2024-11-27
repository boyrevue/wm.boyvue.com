import {
  BlockOutlined,
  CrownOutlined,
  DollarOutlined,
  FireOutlined,
  FlagOutlined,
  HomeOutlined,
  LikeOutlined,
  LogoutOutlined,
  MenuOutlined,
  NotificationOutlined,
  PictureOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
  WalletOutlined
} from '@ant-design/icons';
import {
  ContactIcon, HeartIcon, MoneyTranIcon, MySubIcon, PurchasedIcon, TopWalletIcon
} from '@components/icons';
import { logout } from '@redux/auth/actions';
import { openTopupModal } from '@redux/wallet/actions';
import { authService } from '@services/auth.service';
import {
  Avatar, Divider, Drawer, message,
  Tooltip
} from 'antd';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SocketContext } from 'src/socket';

import style from './user-menu-drawer.module.less';

const mapState = (state: any) => ({
  currentUser: state.user.current
});
const mapDispatch = {
  logoutHandler: logout,
  openTopupModalHandler: openTopupModal
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

const EVENT = {
  BALANCE_UPDATE: 'balance_update',
  NOTIFY_AND_REDIRECT: 'notify_and_redirect'
};

function UserMenuDrawer({
  currentUser = {},
  logoutHandler = () => { },
  openTopupModalHandler = () => { }
}: PropsFromRedux) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { getSocket, socketStatus, connected } = useContext(SocketContext);

  const [balance, setBalance] = useState(currentUser.balance || 0);

  const updateBalance = (data) => setBalance(data.balance);
  const notify = ({ text, href }) => {
    if (text) message.info(text);
    if (href) Router.push(href);
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(EVENT.BALANCE_UPDATE, updateBalance);
    socket?.on(EVENT.NOTIFY_AND_REDIRECT, notify);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(EVENT.BALANCE_UPDATE, updateBalance);
    socket?.off(EVENT.NOTIFY_AND_REDIRECT, notify);
  };

  useEffect(() => {
    if (currentUser && currentUser.balance !== balance) {
      setBalance(currentUser.balance);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!connected()) return handleOffSocket();

    handleSocket();

    return handleOffSocket;
  }, [socketStatus]);

  const onLogout = () => {
    const token = authService.getToken();
    const socket = getSocket();
    if (token && socket) {
      socket.emit('auth/logout', {
        token
      });
    }
    logoutHandler();
  };

  return (
    <>
      <span
        key="menu-profile"
        aria-hidden
        onClick={() => setOpen(true)}
        className="menu-profile"
      >
        <MenuOutlined className="icon-profile" />
        {' '}
        <span className="avatar-profile">
          <Avatar src={currentUser?.avatar || '/no-avatar.png'} />
        </span>
      </span>
      <Drawer
        title={(
          <div className="profile-user">
            <Tooltip title="Profile">
              <img
                src={currentUser?.avatar || '/no-avatar.png'}
                alt="avatar"
              />
              <a className="profile-name">
                {currentUser.name || 'N/A'}
                <span>
                  @
                  {currentUser.username || 'n/a'}
                </span>
              </a>
            </Tooltip>
          </div>
        )}
        closable
        onClose={() => setOpen(false)}
        visible={open}
        key="profile-drawer"
        className={style['profile-drawer']}
        width={280}
      >
        {currentUser.isPerformer && (
          <div className="profile-menu-item">
            {/* <Link href="/model/live" as="/model/live">
              <div
                className={
                  router.pathname === '/model/live'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <StreamIcon />
                {' '}
                Go Live
              </div>
            </Link>
            <Divider /> */}
            <Link
              href="/model/earning"
              as="/model/earning"
            >
              <a>
                <div
                  aria-hidden
                  onClick={() => setOpen(false)}
                  className={
                    router.pathname === '/wallet-balance'
                      ? 'menu-item active'
                      : 'menu-item'
                  }
                >
                  <WalletOutlined />
                  {' '}
                  Wallet Balance
                  {' '}
                  &#40;
                  <b style={{ fontSize: '13px' }}>{(balance || 0).toFixed(2)}</b>
                  &#41;
                </div>
              </a>
            </Link>
            <Divider />
            <Link href="/model/account" as="/model/account">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/account'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <UserOutlined />
                {' '}
                Edit Profile
              </div>
            </Link>
            <Link href="/" as="/">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <HomeOutlined />
                {' '}
                Home
              </div>
            </Link>
            <Link
              href={{
                pathname: '/model/[username]',
                query: {
                  username: currentUser.username || currentUser._id
                }
              }}
              as={`/${currentUser.username || currentUser._id}`}
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === `/model/${currentUser.username || currentUser._id}`
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <UserOutlined />
                {' '}
                <span className="hide">My Profile</span>
              </div>
            </Link>

            <Link href={{ pathname: '/model/black-list' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/black-list'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <BlockOutlined />
                {' '}
                Blacklist
              </div>
            </Link>
            <Link href={{ pathname: '/model/violations-reported' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/violations-reported'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <FlagOutlined />
                {' '}
                Violations Reported
              </div>
            </Link>
            <Divider />
            <Link href="/model/my-feed" as="/model/my-feed">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-feed'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <FireOutlined />
                {' '}
                My Feeds
              </div>
            </Link>
            <Link
              href={{ pathname: '/model/my-subscriber' }}
              as="/model/my-subscriber"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-subscriber'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <CrownOutlined />
                {' '}
                My Subscribers
              </div>
            </Link>
            <Link href="/model/my-video" as="/model/my-video">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-video'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <VideoCameraOutlined />
                {' '}
                My Videos
              </div>
            </Link>
            <Link
              href="/model/my-gallery/listing"
              as="/model/my-gallery/listing"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-gallery/listing'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <PictureOutlined />
                {' '}
                My Galleries
              </div>
            </Link>
            <Link href="/model/my-store" as="/model/my-store">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/my-store'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ShoppingOutlined />
                {' '}
                My Store
              </div>
            </Link>
            <Divider />
            <Link
              href={{ pathname: '/model/product-orders' }}
              as="/model/product-orders"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/product-orders'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ShoppingCartOutlined />
                {' '}
                Product Orders
              </div>
            </Link>
            <Divider />
            <Link href="/model/earning">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/earning'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <DollarOutlined />
                {' '}
                Earning Report
              </div>
            </Link>
            <Link href="/model/payout-request">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model/payout-request'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <NotificationOutlined />
                {' '}
                Payout Request
              </div>
            </Link>
            <Divider />
            <Link href={{ pathname: '/contact' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/contact'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ContactIcon width={15} height={15} />
                {' '}
                Contact
              </div>
            </Link>
            <div
              aria-hidden
              className="menu-item"
              onClick={onLogout}
            >
              <LogoutOutlined />
              {' '}
              Sign Out
            </div>
          </div>
        )}
        {!currentUser.isPerformer && (
          <div className="profile-menu-item">
            <Link href="/user/account" as="/user/account">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/account'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <UserOutlined />
                {' '}
                Edit Profile
              </div>
            </Link>
            <Link href="/" as="/">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <HomeOutlined />
                {' '}
                Home
              </div>
            </Link>
            <a
              onClick={() => openTopupModalHandler({ open: true })}
              role="presentation"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/wallet-package'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <TopWalletIcon width={15} height={15} />
                {' '}
                Top-up My Wallet
                {' '}
                &#40;
                <b style={{ fontSize: '13px' }}>{(balance || 0).toFixed(2)}</b>
                &#41;
              </div>
            </a>
            <Divider />

            <Link href="/model" as="/model">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/model'
                    ? 'menu-item show-mobile active'
                    : 'menu-item show-mobile'
                }
              >
                <TeamOutlined width={15} height={15} />
                {' '}
                Content Creators
              </div>
            </Link>
            <Link
              href={{ pathname: '/search/video' }}
              as="/search/video"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/search/video'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <Tooltip title="Videos">
                  <VideoCameraOutlined />
                  {' '}
                  <span className="hide">Videos</span>
                </Tooltip>
              </div>
            </Link>
            <Link href="/user/my-favorite" as="/user/my-favorite">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/my-favorite'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <LikeOutlined />
                {' '}
                My Favorites
              </div>
            </Link>
            <Link href="/user/my-wishlist" as="/user/my-wishlist">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/my-wishlist'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <HeartIcon width={15} height={15} />
                {' '}
                My Wishlist
              </div>
            </Link>
            <Link href="/user/my-subscription" as="/user/my-subscription">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/my-subscription'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <MySubIcon width={15} height={15} />
                {' '}
                My Subscriptions
              </div>
            </Link>
            <Divider />
            <Link href="/user/purchased-media" as="/user/purchased-media">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/purchased-media'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <PurchasedIcon width={15} height={15} />
                {' '}
                Purchased Media
              </div>
            </Link>
            <Link href="/user/purchased-product" as="/user/purchased-product">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/purchased-product'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ShoppingCartOutlined />
                {' '}
                Product Purchases
              </div>
            </Link>
            <Divider />
            <Link href="/user/payment-history" as="/user/payment-history">
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/user/payment-history'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <MoneyTranIcon width={15} height={15} />
                {' '}
                Transactions
              </div>
            </Link>
            <Divider />
            <Link href={{ pathname: '/contact' }}>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className={
                  router.pathname === '/contact'
                    ? 'menu-item active'
                    : 'menu-item'
                }
              >
                <ContactIcon width={15} height={15} />
                {' '}
                Contact
                Administrator
              </div>
            </Link>
            <div
              className="menu-item"
              aria-hidden
              onClick={onLogout}
            >
              <LogoutOutlined />
              {' '}
              Sign Out
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

export default connector(UserMenuDrawer);
