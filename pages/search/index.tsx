import {
  PictureOutlined, SearchOutlined, ShoppingCartOutlined,
  StarOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import GalleryCard from '@components/gallery/gallery-card';
import PerformerCard from '@components/performer/card';
import ProductCard from '@components/product/product-card';
import VideoCard from '@components/video/video-card';
import {
  galleryService, performerService, productService,
  searchService, videoService
} from '@services/index';
import {
  Col, Input, Layout, Pagination, Row, Spin, Tabs, Tooltip
} from 'antd';
import Router from 'next/router';
import { PureComponent } from 'react';

import style from './search.module.less';

type IProps = {
  totalPerformers: number;
  totalVideos: number;
  totalGalleries: number;
  totalProducts: number;
  q: string;
  categoryId: string;
}

const { TabPane } = Tabs;

const initialState = {
  type: 'performer',
  categories: [],
  fetchingCategories: false,
  fetchingData: false,
  limit: 12,
  performers: {
    offset: 0,
    total: 0,
    data: []
  },
  videos: {
    offset: 0,
    total: 0,
    data: []
  },
  galleries: {
    offset: 0,
    total: 0,
    data: []
  },
  products: {
    offset: 0,
    total: 0,
    data: []
  },
  categoryId: '',
  activeCategoryIds: [],
  stats: {
    totalGalleries: 0,
    totalPerformers: 0,
    totalProducts: 0,
    totalVideos: 0
  }
};

class SearchPage extends PureComponent<IProps, any> {
  static authenticate = true;

  static noredirect = true;

  static async getInitialProps(ctx) {
    const { q = '', categoryId = '' } = ctx.query;
    const resp = await searchService.countTotal({ q, categoryId });
    return {
      ...ctx.query,
      ...resp.data
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      ...initialState,
      stats: {
        totalPerformers: props.totalPerformers,
        totalVideos: props.totalVideos,
        totalGalleries: props.totalGalleries,
        totalProducts: props.totalProducts
      },
      activeCategoryIds: props.categoryId ? [props.categoryId] : []
    };
  }

  componentDidMount() {
    this.loadSearchByStats(this.props);
  }

  async componentDidUpdate(prevProps) {
    const { q, categoryId } = this.props;
    if (prevProps.q !== q) {
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({ ...initialState });
      const resp = await searchService.countTotal({ q, categoryId });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ stats: resp.data });
      // this.getPerformers();
      this.loadSearchByStats(resp.data);
    }
  }

  async getPerformers() {
    try {
      const { q = '' } = this.props;
      const { performers, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await performerService.search({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * performers.offset
      });
      this.setState({
        performers: { ...performers, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getVideos() {
    try {
      const { q = '' } = this.props;
      const { videos, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await videoService.userSearch({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * videos.offset
      });
      this.setState({
        videos: { ...videos, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getGalleries() {
    try {
      const { q = '' } = this.props;
      const { galleries, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await galleryService.userSearch({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * galleries.offset
      });
      this.setState({
        galleries: { ...galleries, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getProducts() {
    try {
      const { q = '' } = this.props;
      const { products, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await productService.userSearch({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * products.offset
      });
      this.setState({
        products: { ...products, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  loadSearchByStats(props) {
    const {
      totalPerformers, totalVideos, totalGalleries, totalProducts
    } = props;

    if (totalPerformers) {
      this.setState({ type: 'performer' }, this.getPerformers);
      return;
    }
    if (totalVideos) {
      this.setState({ type: 'video' }, this.getVideos);
      return;
    }
    if (totalGalleries) {
      this.setState({ type: 'gallery' }, this.getGalleries);
      return;
    }
    if (totalProducts) {
      this.setState({ type: 'product' }, this.getProducts);
    }
  }

  async pageChanged(page) {
    const {
      type, performers, videos, galleries, products
    } = this.state;
    if (type === 'video') {
      await this.setState({ videos: { ...videos, offset: page - 1 } });
      this.getVideos();
    }
    if (type === 'gallery') {
      await this.setState({ galleries: { ...galleries, offset: page - 1 } });
      this.getGalleries();
    }
    if (type === 'product') {
      await this.setState({ products: { ...products, offset: page - 1 } });
      this.getProducts();
    }
    if (type === 'performer') {
      await this.setState({ performers: { ...performers, offset: page - 1 } });
      this.getPerformers();
    }
  }

  async typeChanged(type) {
    const {
      performers, videos, galleries, products
    } = this.state;
    await this.setState({ type, activeCategoryIds: [] });
    if (type === 'video') {
      await this.setState({ videos: { ...videos, offset: 0 } });
      this.getVideos();
    }
    if (type === 'gallery') {
      await this.setState({ galleries: { ...galleries, offset: 0 } });
      this.getGalleries();
    }
    if (type === 'product') {
      await this.setState({ products: { ...products, offset: 0 } });
      this.getProducts();
    }
    if (type === 'performer') {
      await this.setState({ performers: { ...performers, offset: 0 } });
      this.getPerformers();
    }
  }

  render() {
    const {
      q = ''
    } = this.props;
    const {
      fetchingData, performers, videos, galleries, products, type, limit,
      stats
    } = this.state;
    const {
      totalGalleries = 0,
      totalPerformers = 0,
      totalProducts = 0,
      totalVideos = 0
    } = stats;
    const totalResult = totalGalleries + totalPerformers + totalProducts + totalVideos;
    return (
      <Layout>
        <SeoMetaHead item={{
          title: 'Search results'
        }}
        />
        <div className="main-container">
          <div className={style['search-lg-top']}>
            <Input.Search placeholder="Search anything ..." enterButton defaultValue={q} onSearch={(keyword) => Router.replace({ pathname: '/search', query: { q: keyword } })} onPressEnter={(e: any) => Router.replace({ pathname: '/search', query: { q: e.target.value } })} />
          </div>
          <h3 className="page-heading" style={{ justifyContent: 'space-between', display: 'flex' }}>
            <span className="box">
              <SearchOutlined />
              {' '}
              {q && `'${q}'`}
              {' '}
              {totalResult}
              {' '}
              results
            </span>
          </h3>
          <div className={style['page-search']}>
            <Tabs
              onChange={this.typeChanged.bind(this)}
              activeKey={type}
            >
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Model">
                    <StarOutlined className="icon-result" />
                    {' '}
                    Model (
                    {performers.total || totalPerformers}
                    )
                  </Tooltip>
                )}
                key="performer"
              />
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Video">
                    <VideoCameraOutlined className="icon-result" />
                    {' '}
                    Video (
                    {videos.total || totalVideos}
                    )
                  </Tooltip>
                )}
                key="video"
              />
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Gallery">
                    <PictureOutlined className="icon-result" />
                    {' '}
                    Gallery (
                    {galleries.total || totalGalleries}
                    )
                  </Tooltip>
                )}
                key="gallery"
              />
              <TabPane
                tab={(
                  <Tooltip placement="top" title="Product">
                    <ShoppingCartOutlined className="icon-result" />
                    {' '}
                    Product (
                    {products.total || totalProducts}
                    )
                  </Tooltip>
                )}
                key="product"
              />

            </Tabs>
          </div>
          <Row>
            {type === 'performer' && !fetchingData && performers.data.length > 0 && performers.data.map((per) => (
              <Col md={6} xs={12} key={per._id}>
                <PerformerCard performer={per} />
              </Col>
            ))}
            {type === 'video' && !fetchingData && videos.data.length > 0 && videos.data.map((video) => (
              <Col md={6} xs={12} key={video._id}>
                <VideoCard video={video} />
              </Col>
            ))}
            {type === 'gallery' && !fetchingData && galleries.data.length > 0 && galleries.data.map((gallery) => (
              <Col md={6} xs={12} key={gallery._id}>
                <GalleryCard gallery={gallery} />
              </Col>
            ))}
            {type === 'product' && !fetchingData && products.data.length > 0 && products.data.map((product) => (
              <Col md={6} xs={12} key={product._id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {type === 'video' && !fetchingData && !videos.total && <div className="text-center">No video was found</div>}
          {type === 'gallery' && !fetchingData && !galleries.total && <div className="text-center">No gallery was found</div>}
          {type === 'product' && !fetchingData && !products.total && <div className="text-center">No product was found</div>}
          {type === 'performer' && !fetchingData && !performers.total && <div className="text-center">No model was found</div>}
          {fetchingData && <div className="text-center"><Spin /></div>}
          {type === 'video' && !fetchingData && videos.total > videos.data.length ? (
            <div className="paging">
              <Pagination
                current={videos.offset + 1}
                total={videos.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
          {type === 'gallery' && !fetchingData && galleries.total > galleries.data.length ? (
            <div className="paging">
              <Pagination
                current={galleries.offset + 1}
                total={galleries.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
          {type === 'product' && !fetchingData && products.total > products.data.length ? (
            <div className="paging">
              <Pagination
                current={products.offset + 1}
                total={products.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
          {type === 'performer' && !fetchingData && performers.total > performers.data.length ? (
            <div className="paging">
              <Pagination
                current={performers.offset + 1}
                total={performers.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
        </div>
      </Layout>
    );
  }
}

export default SearchPage;
