import {
  BellOutlined,
  FireOutlined
} from '@ant-design/icons';
import {
  Badge, Dropdown, Tooltip
} from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { connect, ConnectedProps } from 'react-redux';

import SearchBar from '../layout/search-bar';
import CartBadge from './cart-badge';
import style from './logged-in-menu.module.less';
import UnreadMessageBadge from './unread-message-badge';

const NotificationHeaderMenu = dynamic(() => import('@components/notification/NotificationHeaderMenu'), { ssr: false });
const PrivateRequestDropdown = dynamic(() => import('./private-request-dropdown'), { ssr: false });
const SearchDrawer = dynamic(() => import('./search-drawer'), { ssr: false });

const mapState = (state: any) => ({
  currentUser: state.user.current,
  notificationCount: state.notification.total
});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function LoggedInMenu({
  currentUser,
  notificationCount = 0
}: PropsFromRedux) {
  const router = useRouter();
  // const [balance, setBalance] = useState(currentUser.balance || 0);

  if (currentUser.isPerformer) {
    return (
      <div className={style['mid-conner']}>
        <SearchBar />
        <ul
          className={style['nav-icons']}
        >
          <li key="notification">
            <Dropdown
              overlay={<NotificationHeaderMenu />}
              forceRender
              getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
            >
              <span aria-label="notification">
                <BellOutlined />
                <Badge
                  className="cart-total"
                  count={notificationCount}
                />
              </span>
            </Dropdown>
          </li>
          <li
            key="messenger"
            className={
              router.pathname === '/messages' ? 'active' : ''
            }
          >
            <Link href="/messages">
              <a>
                <UnreadMessageBadge />
              </a>
            </Link>
          </li>
          <li style={{ display: 'none' }}>
            <PrivateRequestDropdown />
          </li>
          {/* <li className="custom">
            <Link
              href="/model/earning"
              as="/model/earning"
            >
              <a>
                <Tooltip title={(balance || 0).toFixed(2)}>
                  <ModelEarningIcon width={23} height={23} />
                  {' '}
                  <span className="hide">
                    {(balance || 0).toFixed(2)}
                  </span>
                </Tooltip>
              </a>
            </Link>
          </li> */}

        </ul>
      </div>
    );
  }

  // user menu
  return (
    <>
      <SearchDrawer />
      <ul
        className={style['nav-icons']}
      >
        <li
          key="feeds"
          className={
            router.pathname === '/feed' ? 'active' : ''
          }
        >
          <Link href="/feed">
            <a>
              <FireOutlined />
            </a>
          </Link>
        </li>
        <li key="notification">
          <Dropdown
            overlay={<NotificationHeaderMenu />}
            forceRender
            getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
          >
            <span aria-label="notification">
              <BellOutlined />
              <Badge
                className="cart-total"
                count={notificationCount}
              />
            </span>
          </Dropdown>
        </li>
        <li
          key="messenger"
          className={
            router.pathname === '/messages' ? 'active' : ''
          }
        >
          <Link href="/messages">
            <a>
              <UnreadMessageBadge />
            </a>
          </Link>
        </li>
        <li className={router.pathname === '/cart' ? 'active' : ''}>
          <Tooltip title="Shopping Cart">
            <Link href="/cart">
              <a>
                <CartBadge />
              </a>
            </Link>
          </Tooltip>
        </li>
        {/* <li>
        <Tooltip title={(balance || 0).toFixed(2)}>
          <a
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => openTopupModalHandler({ open: true })}
            role="presentation"
          >
            <img
              src="/wallet-icon.png"
              alt=""
              width="23"
              height="23"
            />
            {' '}
            <span
              className="hide"
            >
              {(balance || 0).toFixed(2)}
            </span>
          </a>
        </Tooltip>
      </li> */}

      </ul>
    </>
  );
}

export default connector(LoggedInMenu);
