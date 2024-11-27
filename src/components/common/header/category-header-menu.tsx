import { categoryService } from '@services/category.service';
import {
  Menu, message, Skeleton
} from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import style from './category-header-menu.module.less';

function CategoryHeaderMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const search = async () => {
    try {
      const resp = await categoryService.search({ group: 'performer' });
      if (resp) {
        setCategories(resp?.data?.data);
      }
    } catch (error) {
      message.error('An error occured, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, []);

  const getMenuChildren = () => {
    if (!categories.length) {
      return [{
        key: 'no-category',
        label: 'There are no category.'
      }];
    }
    return categories.map((category) => ({
      key: category._id,
      label: (
        <div
          className={style['category-item']}
        >
          <Link
            href={{
              pathname: '/model',
              query: {
                categoryId: category._id
              }
            }}
          >
            <a>{category.name}</a>
          </Link>
        </div>
      )
    }));
  };

  return (
    loading ? <Skeleton /> : (
      <Menu
        title="Categories"
        className={style['category-menu']}
        items={[{
          type: 'group',
          label: null,
          children: getMenuChildren()
        }]}
      />
    )
  );
}

export default CategoryHeaderMenu;
