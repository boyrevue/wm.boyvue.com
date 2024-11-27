import { ArrowLeftOutlined } from '@ant-design/icons';
import VideoCard from '@components/video/video-card';
import {
  Col,
  Layout, message, PageHeader, Pagination, Row, Spin
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { videoService } from 'src/services';

export function PurchasedMedia() {
  const LIMIT = 12;
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [total, setTotal] = useState(0);

  const getMedia = async (page = 1) => {
    try {
      setLoading(true);
      const resp = await videoService.getPurchasedVideos({
        limit: LIMIT,
        offset: (page - 1) * LIMIT
      });
      setTotal(resp.data.total);
      setMedia(resp.data.data);
    } catch (error) {
      message.error('Something went wrong, please check later!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMedia();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Purchased Media</title>
      </Head>
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="Purchased Media"
        />
        {media.length > 0 && (
          <Row>
            {media.map((video) => (
              <Col xs={12} sm={12} md={6} lg={6} key={video?._id}>
                <VideoCard video={video} showPrice={false} />
              </Col>
            ))}
          </Row>
        )}
        {!loading && !media.length && (
          <div style={{ textAlign: 'center' }}>
            No purchased media was found.
          </div>
        )}
        {loading && <div className="text-center"><Spin size="large" /></div>}
        {total > LIMIT && (
          <div className="paging">
            <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              total={total}
              pageSize={LIMIT}
              onChange={getMedia}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

PurchasedMedia.authenticate = true;

export default PurchasedMedia;
