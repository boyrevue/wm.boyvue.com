import { Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

import { IProduct } from '../../interfaces';
import { PerformerListProduct } from './performer-list-product';

type IProps = {
  items: IProduct[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export function ScrollListProduct({
  items = [],
  loadMore,
  canLoadmore = false,
  loading = false
}: IProps) {
  return (
    <InfiniteScroll
      dataLength={items.length}
      hasMore={canLoadmore}
      loader={null}
      next={loadMore}
      endMessage={(
        <p style={{ textAlign: 'center' }}>
          {/* <b>Yay! No more video.</b> */}
        </p>
      )}
      scrollThreshold={0.9}
    >
      <PerformerListProduct products={items} />
      {!loading && !items.length && <div className="text-center">No item was found</div>}
      {loading && <div className="text-center"><Spin /></div>}
    </InfiniteScroll>
  );
}

export default ScrollListProduct;
