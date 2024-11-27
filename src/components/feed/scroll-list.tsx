import { Alert } from 'antd';
import dynamic from 'next/dynamic';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IFeed } from 'src/interfaces/index';

import { FeedGridCard } from './grid-card';
import style from './index.module.less';

const FeedCard = dynamic(() => import('@components/feed/feed-card'), { ssr: false });

interface IProps {
  items: IFeed[];
  canLoadmore: boolean;
  loadMore(): Function;
  onDelete(): Function;
  isGrid?: boolean;
}

export default function ScrollListFeed({
  items = [],
  loadMore,
  onDelete,
  canLoadmore,
  isGrid = false
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
      <div className={isGrid ? style['grid-view'] : ''}>
        {items.length > 0 && items.map((item) => {
          if (isGrid) {
            return <FeedGridCard feed={item} key={item._id} />;
          }
          return <FeedCard feed={item} key={item._id} onDelete={onDelete.bind(this)} />;
        })}
      </div>
      {!items.length && (
      <div className="main-container custom">
        <Alert className="text-center" message="No data was found" type="info" />
      </div>
      )}
    </InfiniteScroll>
  );
}
