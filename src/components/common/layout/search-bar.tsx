import {
  SearchOutlined
} from '@ant-design/icons';
import { Input } from 'antd';
import Link from 'next/link';
import Router from 'next/router';

import style from './search-bar.module.less';

const { Search } = Input;

export function SearchBar({
  onEnter = () => {}
}: any) {
  const onSearch = (q) => {
    if (!q || !q.trim()) return;
    Router.push({ pathname: '/search', query: { q } });
  };

  return (
    <>
      <Link href="/search">
        <span className={style['button-search']}><SearchOutlined /></span>
      </Link>
      <div className={style['search-bar']}>
        <Search
          placeholder="Type to search here ..."
          allowClear
        // enterButton
          onPressEnter={(e: any) => {
            onSearch(e?.target?.value);
            onEnter(e);
          }}
          onSearch={onSearch}
        />
      </div>
    </>
  );
}

export default SearchBar;
