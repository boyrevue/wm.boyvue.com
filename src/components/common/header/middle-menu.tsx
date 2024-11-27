import {
  PlayCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { ModelIcon } from 'src/icons';

// import CategoryHeaderMenu from './category-header-menu';
import style from './middle-menu.module.less';

const mapState = (state: any) => ({
  currentUser: state.user.current
});

const connector = connect(mapState);

export function MiddleMenu() {
  const router = useRouter();

  return (
    <div className={style['menu-middle']}>
      <ul
        className={style['nav-icons']}
      >
        <li
          key="model-page"
          className={
            router.pathname === '/model'
              ? `${style.custom} active`
              : `${style.custom}`
          }
        >
          <Link href={{ pathname: '/model' }} as="/model">
            <a>
              <ModelIcon />
              <span className="hide">
                {' '}
                Content Creators
              </span>
            </a>
          </Link>
        </li>
        <li
          key="search-live"
          className={
            router.pathname === '/search/live'
              ? `${style.custom} active`
              : `${style.custom}`
          }
        >
          <Link
            href={{ pathname: '/search/live' }}
            as="/search/live"
          >
            <a>
              <PlayCircleOutlined />
              <span className="hide">
                {' '}
                Live Content Creators
              </span>
            </a>
          </Link>
        </li>
        {/* <li
          key="categories"
        >
          <Dropdown
            overlay={<CategoryHeaderMenu />}
            forceRender
            overlayClassName={style['menu-categories']}
          >
            <div>
              <AppstoreOutlined />
              <span className="hide">
                {' '}
                Categories
                {' '}
                <DownOutlined />
              </span>
            </div>

          </Dropdown>
        </li> */}
      </ul>
    </div>
  );
}

export default connector(MiddleMenu);
