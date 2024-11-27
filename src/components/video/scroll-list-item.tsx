import { PerformerListVideo } from '@components/video';
import { Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

import { IVideo } from '../../interfaces/video';

type IProps = {
  items: IVideo[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export function ScrollListVideo({
  items, loadMore, loading, canLoadmore
}: IProps) {
  return (
    <InfiniteScroll
      dataLength={items.length}
      hasMore={canLoadmore}
      loader={null}
      next={loadMore}
      endMessage={null}
      scrollThreshold={0.9}
    >
      <PerformerListVideo videos={items} />
      {!items.length && !loading && <div className="text-center no-item">No video was found</div>}
      {loading && <div className="text-center"><Spin /></div>}
    </InfiniteScroll>
  );
}

export default ScrollListVideo;
