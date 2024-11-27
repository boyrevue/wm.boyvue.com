import { FireOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { getResponseError } from '@lib/utils';
import { feedService } from '@services/feed.service';
import {
  Alert, Layout, message
} from 'antd';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IFeed } from 'src/interfaces';

const ScrollListFeed = dynamic(() => import('@components/feed/scroll-list'));

function Feeds() {
  const [loading, setLoading] = useState(true);
  const limit = 24;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<IFeed[]>([]);
  const user = useSelector((state: any) => state.user.current);
  const search = async () => {
    try {
      setLoading(true);
      const resp = await feedService.userHomeFeeds({
        limit,
        offset: (page - 1) * limit
      });
      resp?.data?.total && setTotal(resp.data.total);
      resp?.data?.data && setItems([...items, ...resp.data.data]);
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(getResponseError(err) || 'An error occured, please try again later!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeed = async (feed: IFeed) => {
    if (user._id !== feed.fromSourceId) {
      message.error('Permission denied');
      return;
    }
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted the post successfully');
      window.location.reload();
    } catch {
      message.error('Something went wrong, please try again later');
    }
  };

  const onLoadMore = () => {
    setPage(page + 1);
  };
  useEffect(() => {
    search();
  }, [page]);

  return (
    <Layout>
      <PageTitle title="Feeds" />
      <div className="main-container feedpage">
        <div className="page-heading">
          <span className="box">
            <FireOutlined />
            {' '}
            Feeds
          </span>
        </div>
        <div className="main-background">
          {
            items.length > 0
            && (
            <ScrollListFeed
              items={items}
              canLoadmore={items.length < total}
              loadMore={onLoadMore.bind(this)}
              onDelete={handleDeleteFeed.bind(this)}
            />
            )
          }
          {!items?.length && !loading && (
          <div className="main-container custom">
            <Alert className="text-center" message="Please subscribe models to view their feed" type="info" />
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

Feeds.authenticate = true;

export default Feeds;
