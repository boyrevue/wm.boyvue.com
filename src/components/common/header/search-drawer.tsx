import { SearchOutlined } from '@ant-design/icons';
import SearchFilter from '@components/filter/search-filter';
import { Button, Drawer } from 'antd';
import { useState } from 'react';

import SearchBar from '../layout/search-bar';
import style from './search-drawer.module.less';

function SearchDrawer() {
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <>
      {/* <span
        key="menu-search"
        className={currentUser.isPerformer ? style['menu-search-performer'] : style['menu-search']}
        aria-hidden
        onClick={() => setOpen(!open)}
      >
        <a>
          <Tooltip title="Search">
            <SearchOutlined />
          </Tooltip>
        </a>
      </span> */}
      <div className={style['search-advance']}>
        <Button className={style['btn-search-advance']} onClick={() => { setOpenFilter(!openFilter); }}>Filter</Button>
      </div>
      {openFilter && (<SearchFilter />)}
      <SearchBar onEnter={() => setOpen(false)} />
      <Drawer
        title="Search"
        closable
        onClose={() => setOpen(false)}
        visible={open}
        key="search-drawer"
        className={style['profile-drawer']}
        width={280}
      >
        <SearchBar onEnter={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
export default (SearchDrawer);
