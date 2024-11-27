import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import VideoCard from '@components/video/video-card';
import { getParameterByName } from '@lib/string';
import {
  videoService
} from '@services/index';
import {
  Col, Input,
  Layout, PageHeader, Pagination, Row, Spin
} from 'antd';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import style from './video-search.module.less';

function SearchVideo() {
  const limit = 12;
  const router = useRouter();

  const [results, setResults] = useState({
    data: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(router.query);

  const search = async (page = 1, query = {}) => {
    setLoading(true);
    const offset = (page - 1) * limit;
    const { q = '', hashTag = '' } = searchQuery;
    const resp = await videoService.userSearch({
      q,
      hashTag,
      ...query,
      limit,
      offset
    });
    setResults(resp.data);
    setLoading(false);
  };

  const handleRouteChange = (url) => {
    const customQuery = {
      q: getParameterByName('q', url) || '',
      hashTag: getParameterByName('hashTag', url) || ''
    };
    setSearchQuery(customQuery);
    search(1, customQuery);
  };

  useEffect(() => {
    search();

    router.events.on('routeChangeStart', handleRouteChange);
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Video search result'
      }}
      />
      <div className="main-container">

        {/* <h3 className="page-heading" style={{ justifyContent: 'space-between', display: 'flex' }}>
          <span className="box">
            <SearchOutlined />
            {' '}
            results
            {(!!searchQuery.q || !!searchQuery.hashTag) && (
              <span>
                {' '}
                for &ldquo;
                {searchQuery.q || searchQuery.hashTag}
                &rdquo;
              </span>
            )}
          </span>
        </h3> */}
        <div className={`${style['top-video']}`}>
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Videos"
          />
          <div className={style['search-lg-top']}>
            <Input.Search
              className="input-search"
              placeholder="Search something ..."
              enterButton
              defaultValue={searchQuery.q}
              onSearch={(keyword) => Router.replace({
                pathname: '/search/video',
                query: { q: keyword }
              })}
              onPressEnter={(e: any) => Router.replace({ pathname: '/search/video', query: { q: e.target.value } })}
            />
          </div>
        </div>

        <Row>
          {results.data.map((video) => (
            <Col md={6} xs={12} key={video._id}>
              <VideoCard video={video} />
            </Col>
          ))}
        </Row>

        {!loading && !results.total && <div className="text-center">No video was found</div>}
        {loading && <div className="text-center"><Spin /></div>}
        {results.total > limit ? (
          <div className="paging">
            <Pagination
              total={results.total}
              pageSize={limit}
              onChange={search}
              showSizeChanger={false}
            />
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export default SearchVideo;
