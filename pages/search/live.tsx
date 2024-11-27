import SeoMetaHead from '@components/common/seo-meta-head';
import PerformerCard from '@components/performer/card';
import { LiveStreamIcon } from '@components/streaming/live-stream-icon';
import { performerService } from '@services/index';
import {
  Col, Layout, Pagination, Row, Spin
} from 'antd';
import { useEffect, useState } from 'react';

function SearchLive() {
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    data: [],
    total: 0
  });

  const loadData = async (page = 1) => {
    const offset = (page - 1) * limit;
    setLoading(true);
    const resp = await performerService.search({
      limit,
      offset,
      sortBy: 'onlineAt',
      isStreaming: 1,
      type: 'live'
    });
    setResults(resp.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Live Models'
      }}
      />
      <div className="main-container">
        <h3 className="page-heading">
          <span className="box">
            <LiveStreamIcon />
            {' '}
            Live Content Creators
          </span>
        </h3>
        <Row>
          {results.data.map((p: any) => (
            <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
              <PerformerCard performer={p} linkToLiveStream />
            </Col>
          ))}
        </Row>
        {!results.total && !loading && <p className="text-center">There are currently no models who are streaming</p>}
        {loading && <div className="text-center" style={{ margin: 30 }}><Spin /></div>}
        {results.total > limit ? (
          <div className="paging">
            <Pagination
              total={results.total}
              pageSize={limit}
              onChange={loadData}
              showSizeChanger={false}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export default SearchLive;
