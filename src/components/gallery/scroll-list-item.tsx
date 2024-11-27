import { IGallery } from '@interfaces/gallery';
import { Col, Row, Spin } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

import GalleryCard from './gallery-card';

type IProps = {
  items: IGallery[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
}

export function ScrollListGallery({
  items = [], loadMore, canLoadmore = false, loading = false
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
      <Row>
        {items.length > 0
          && items.map((gallery: IGallery) => (
            <Col
              xs={12}
              sm={12}
              md={12}
              lg={8}
              key={gallery._id}
            >
              <GalleryCard gallery={gallery} />
            </Col>
          ))}
      </Row>
      {!loading && !items.length && <div className="text-center">No gallery was found</div>}
      {loading && <div className="text-center"><Spin /></div>}
    </InfiniteScroll>
  );
}

export default ScrollListGallery;
