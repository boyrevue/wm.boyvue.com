import {
  ArrowLeftOutlined, FireOutlined,
  LikeOutlined,
  PictureOutlined,
  ShareAltOutlined,
  ShoppingOutlined,
  UsergroupAddOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import ResultError from '@components/error/result-error';
import ScrollListFeed from '@components/feed/scroll-list';
import { ScrollListGallery } from '@components/gallery';
import {
  ConfirmSubscriptionPerformerForm,
  PerformerInfo
} from '@components/performer';
import { ScrollListProduct } from '@components/product/scroll-list-item';
import { LiveStreamIcon } from '@components/streaming/live-stream-icon';
import { ScrollListVideo } from '@components/video';
import { shortenLargeNumber } from '@lib/number';
import { redirect404 } from '@lib/utils';
import {
  getFeeds, moreFeeds, removeFeedSuccess
} from '@redux/feed/actions';
import { getGalleries, moreGalleries } from '@redux/gallery/actions';
import { listProducts, moreProduct } from '@redux/product/actions';
import {
  getVideos, getVods, moreVideo, moreVod
} from '@redux/video/actions';
import {
  Button, Collapse,
  Layout, message, Modal, Tabs, Tooltip
} from 'antd';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { CheckIcon, MessageIcon, SaleVidIcon } from 'src/icons';
import {
  IError, IFeed, IPerformer, ISettings, IUser
} from 'src/interfaces';
import {
  feedService, paymentService, performerService, utilsService
} from 'src/services';

import style from './model-profile.module.less';

const VideoPlayer = dynamic(() => import('@components/video/video-player'), {
  ssr: false
});

interface IPerformerProfileProps {
  error: IError;
  settings: ISettings;
  user: IUser;
  performer: IPerformer;
  listProductsHandler: Function;
  getVideosHandler: Function;
  moreVideoHandler: Function;
  getVodsHandler: Function;
  moreProductHandler: Function;
  moreVodHandler: Function;
  videoState: any;
  saleVideoState: any;
  productState: any;
  getGalleriesHandler: Function;
  moreGalleryHandler: Function;
  galleryState: any;
  currentUser: IUser | IPerformer;
  msg: string;
  feedState: any;
  getFeedsHandler: Function;
  moreFeedsHandler: Function;
  removeFeedSuccessHandler: Function;
  bodyInfo: any;
}
const { Panel } = Collapse;
const { TabPane } = Tabs;

function PerformerProfile({
  error,
  settings,
  user,
  performer,
  listProductsHandler,
  getVideosHandler,
  moreVideoHandler,
  getVodsHandler,
  moreProductHandler,
  moreVodHandler,
  videoState,
  saleVideoState,
  productState,
  getGalleriesHandler,
  moreGalleryHandler,
  galleryState,
  currentUser,
  msg = null,
  feedState,
  getFeedsHandler,
  moreFeedsHandler,
  removeFeedSuccessHandler,
  bodyInfo
}: IPerformerProfileProps) {
  const itemPerPage = 24;
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [tab, setTab] = useState('feed');
  const [videoPage, setVideoPage] = useState(0);
  const [vodPage, setVodPage] = useState(0);
  const [productPage, setProductPage] = useState(0);
  const [galleryPage, setGalleryPage] = useState(0);
  const [feedPage, setFeedPage] = useState(0);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [submiting, setSubmitting] = useState(false);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Link has been copied to clipboard!');
    } catch (e) {
      message.error(
        'Error while coping the link, please copy link from browser directly!'
      );
    }
  };

  const checkViewWelcomeVideo = () => {
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (
      !notShownWelcomeVideos
      || !notShownWelcomeVideos?.includes(performer._id)
    ) {
      setShowWelcomeVideo(true);
    }
  };

  const loadMoreItem = async () => {
    const query = {
      limit: itemPerPage,
      performerId: performer._id
    };
    if (tab === 'feed') {
      if (feedState.items.length >= feedState.total) {
        return;
      }
      setFeedPage(feedPage + 1);
      moreFeedsHandler({
        limit: itemPerPage,
        offset: (feedPage + 1) * itemPerPage,
        performerId: performer._id
      });
    }
    if (tab === 'video') {
      if (videoState.items.length >= videoState.total) return;
      setVideoPage(videoPage + 1);
      moreVideoHandler({
        ...query,
        offset: (videoPage + 1) * itemPerPage,
        isSaleVideo: false
      });
    }
    if (tab === 'saleVideo') {
      if (saleVideoState.items.length >= saleVideoState.total) return;
      setVodPage(vodPage);
      moreVodHandler({
        ...query,
        offset: (vodPage + 1) * itemPerPage,
        isSaleVideo: true
      });
    }
    if (tab === 'gallery') {
      if (galleryState.items.length >= galleryState.total) return;
      setGalleryPage(galleryPage);
      moreGalleryHandler({
        ...query,
        offset: (galleryPage + 1) * itemPerPage
      });
    }
    if (tab === 'store') {
      if (productState.items.length >= productState.total) return;
      setProductPage(productPage);
      moreProductHandler({
        ...query,
        offset: (productPage + 1) * itemPerPage
      });
    }
  };

  const loadItems = (selectedTab = 'video') => {
    const query = {
      limit: itemPerPage,
      offset: 0,
      performerId: performer._id
    };
    switch (selectedTab) {
      case 'feed':
        setFeedPage(0);
        getFeedsHandler({
          limit: itemPerPage,
          offset: 0,
          performerId: performer._id
        });
        break;
      case 'video':
        setVideoPage(0);
        getVideosHandler({
          ...query,
          isSaleVideo: false
        });
        break;
      case 'saleVideo':
        setVodPage(0);
        getVodsHandler({
          ...query,
          isSaleVideo: true
        });
        break;
      case 'gallery':
        setGalleryPage(0);
        getGalleriesHandler(query);
        break;
      case 'store':
        setProductPage(0);
        listProductsHandler(query);
        break;
      default:
        break;
    }
  };

  const handleViewWelcomeVideo = () => {
    const notShownWelcomeVideos = localStorage.getItem('notShownWelcomeVideos');
    if (!notShownWelcomeVideos?.includes(performer._id)) {
      const Ids = JSON.parse(notShownWelcomeVideos || '[]');
      const values = Array.isArray(Ids)
        ? Ids.concat([performer._id])
        : [performer._id];
      localStorage.setItem('notShownWelcomeVideos', JSON.stringify(values));
    }
    setShowWelcomeVideo(false);
  };

  const handleDeleteFeed = async (feed: IFeed) => {
    if (currentUser._id !== feed.fromSourceId) {
      message.error('Permission denied');
      return;
    }
    if (!window.confirm('Are you sure to delete this post?')) return;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted the post successfully');
      removeFeedSuccessHandler({ feed });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  };

  const handleClickMessage = () => {
    if (!user._id) {
      message.error(
        'You can message a model just as soon as you login/register.’'
      );
      Router.push('/auth/login');
      return;
    }
    if (!performer.isSubscribed) {
      message.error(
        `Please subscribe to ${
          performer.name || performer.username || 'the model'
        } to start chatting`
      );
      return;
    }
    Router.push({
      pathname: '/messages',
      query: {
        toSource: 'performer',
        toId: performer._id
      }
    });
  };

  const handleClickSubscribe = (type = 'monthly') => {
    if (!user._id) {
      message.error(
        'You can subscribe to the models just as soon as you login/register.'
      );
      Router.push('/auth/login');
      return;
    }
    setSubscriptionType(type);
    setOpenSubscriptionModal(true);
  };

  const subscribe = async (paymentGateway = 'ccbill') => {
    try {
      setSubmitting(true);
      const resp = await (
        await paymentService.subscribe({
          type: subscriptionType,
          performerId: performer._id,
          paymentGateway
        })
      ).data;
      message.info(
        'Redirecting to payment gateway, do not reload page at this time',
        30
      );
      if (['ccbill', 'verotel', 'emerchant'].includes(paymentGateway)) { window.location.href = resp.paymentUrl; }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'error occured, please try again later');
    } finally {
      setSubmitting(false);
    }
  };

  const onTabClick = (t) => {
    if (t === 'livestream') {
      if (!performer.isSubscribed) {
        message.info(
          `Please subscribe to enjoy ${performer.username}'s streaming`
        );
        return;
      }

      if (performer.streamingStatus === 'private') {
        message.info(
          {
            content: `${performer.username} is streaming privately. Please connect after some time.`,
            key: 'warning-pvt-chat'
          }
        );
        return;
      }

      Router.push(
        {
          pathname: '/stream/[username]',
          query: { performer: JSON.stringify(performer) }
        },
        `/stream/${performer.username}`
      );
      return;
    }
    setTab(t);
    loadItems(t);
  };

  useEffect(() => {
    if (msg) message.info(msg);
    loadItems(tab);
    checkViewWelcomeVideo();
  }, []);

  // render error if have
  if (error) {
    return <ResultError error={error} />;
  }

  const {
    items: videos = [],
    total: totalVideos,
    requesting: loadingVid
  } = videoState;
  const {
    items: saleVideos = [],
    total: totalVods,
    requesting: loadingVod
  } = saleVideoState;
  const {
    items: products,
    total: totalProducts,
    requesting: loadingProduct
  } = productState;
  const {
    items: galleries,
    total: totalGalleries,
    requesting: loadingGallery
  } = galleryState;
  const {
    items: feeds = [],
    total: totalFeeds
  } = feedState;

  return (
    <Layout>
      <SeoMetaHead
        item={performer}
        keywords={performer.name}
        imageUrl={performer.avatar || '/no-avatar.png'}
      />
      <div className="main-container">
        <div
          className={style['top-profile']}
        >
          <div
            className="bg-top-profile"
            style={{
              backgroundImage: `url('${performer.cover || '/banner-image.jpg'}')`
            }}
          >
            <div className="stats-row">
              <div className="tab-stat">
                <div className="tab-item">
                  <span>
                    {shortenLargeNumber(performer?.stats?.totalFeeds || 0)}
                    {' '}
                    <FireOutlined />
                  </span>
                </div>
                <div className="tab-item">
                  <span>
                    {shortenLargeNumber(performer.stats?.totalVideos || 0)}
                    {' '}
                    <VideoCameraOutlined />
                  </span>
                </div>
                <div className="tab-item">
                  <span>
                    {shortenLargeNumber(performer.stats?.totalPhotos || 0)}
                    {' '}
                    <PictureOutlined />
                  </span>
                </div>
                <div className="tab-item">
                  <span>
                    {shortenLargeNumber(performer.stats?.totalProducts || 0)}
                    {' '}
                    <ShoppingOutlined />
                  </span>
                </div>
                <div className="tab-item">
                  <span>
                    {shortenLargeNumber(performer.stats?.likes || 0)}
                    {' '}
                    <LikeOutlined />
                  </span>
                </div>
                <div className="tab-item">
                  <span>
                    {shortenLargeNumber(performer.stats?.subscribers || 0)}
                    {' '}
                    <UsergroupAddOutlined />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <a
            aria-hidden
            className="arrow-back"
            onClick={() => Router.back()}
          >
            <ArrowLeftOutlined />
          </a>

          <div className="bottom-top-profile">
            <div className="fl-col">
              <img alt="Avatar" src={performer.avatar || '/no-avatar.png'} />
              <div className="m-user-name">
                <Tooltip title={performer.name}>
                  <h3>
                    {performer.name ? performer.name : ''}
                  &nbsp;
                    {performer.verifiedAccount && <CheckIcon />}
                  </h3>
                </Tooltip>
                <h4>
                  @
                  {performer.username || 'n/a'}
                </h4>
              </div>
            </div>
            <div className="btn-grp">
              {user && !user.isPerformer && (
              <Tooltip title="Send Message">
                <Button
                  className="primary"
                  onClick={() => handleClickMessage()}
                >
                  <MessageIcon />
                  <span className="hide-mobile"> Message</span>
                </Button>
              </Tooltip>
              )}
              {currentUser?._id === performer._id && (
              <Tooltip title="Go Live">
                <Button className="button-live">
                  <a href="/model/live">
                    <LiveStreamIcon />
                    {' '}
                    Go Live
                  </a>
                </Button>
              </Tooltip>
              )}

              <Tooltip title="Share profile">
                <Button className="secondary" onClick={onShare}>
                  <ShareAltOutlined />
                  <span className="hide-mobile"> Share profile</span>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className={style['main-profile']}>
          <div className="left-profile">
            {!performer.isSubscribed && !user?.isPerformer && (
            <div className="box-panel">
              <div className="title-box-panel"><h3>Subscription</h3></div>
              <div className="body-box-panel">

                <div className="subscription-bl">
                  <Button
                    block
                    size="large"
                    type="primary"
                    className="sub-btn"
                    disabled={
                  (submiting && subscriptionType === 'monthly')
                  || user?.isPerformer
                }
                    onClick={() => handleClickSubscribe('monthly')}
                  >
                    {`Monthly Subscription | $${performer.monthlyPrice.toFixed(2)}`}
                  </Button>
                  <Button
                    size="large"
                    type="primary"
                    block
                    className="sub-btn"
                    disabled={
                  (submiting && subscriptionType === 'yearly')
                  || user?.isPerformer
                }
                    onClick={() => handleClickSubscribe('yearly')}
                  >
                    {`Yearly Subscription | $${performer.yearlyPrice.toFixed(2)}`}
                  </Button>
                </div>

              </div>
            </div>
            )}
            <Collapse
              expandIconPosition="start"
              className="collapse-custom"
            >
              <Panel
                header="About me"
                key="1"
                className="site-collapse-custom-panel"
              >
                <div className={user.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>
                  <PerformerInfo performer={performer} bodyInfo={bodyInfo} />
                </div>
              </Panel>
              <div className="ant-collapse-content-box show-desktop">
                <div className={user.isPerformer ? 'mar-0 pro-desc' : 'pro-desc'}>
                  <PerformerInfo performer={performer} bodyInfo={bodyInfo} />
                </div>
              </div>
            </Collapse>

          </div>
          <div className="right-profile">
            <div className="box-panel">
              <Tabs defaultActiveKey="feed" size="large" onTabClick={onTabClick} className={style['tab-profile']}>
                <TabPane
                  tab={(
                    <Tooltip title="Feed">
                      <FireOutlined />
                      <div>Feed</div>
                    </Tooltip>
                      )}
                  key="feed"
                  className="tab-feed"
                >
                  <ScrollListFeed
                    items={feeds}
                    canLoadmore={feeds && feeds.length < totalFeeds}
                    loadMore={loadMoreItem.bind(this)}
                    isGrid={false}
                    onDelete={handleDeleteFeed.bind(this)}
                  />
                </TabPane>
                <TabPane
                  tab={(
                    <Tooltip placement="top" title="Videos">
                      <VideoCameraOutlined />
                      <div>Videos</div>
                    </Tooltip>
                        )}
                  key="video"
                >
                  <ScrollListVideo
                    items={videos}
                    loading={loadingVid}
                    canLoadmore={videos && videos.length < totalVideos}
                    loadMore={loadMoreItem.bind(this)}
                  />
                </TabPane>
                <TabPane
                  tab={(
                    <Tooltip placement="top" title="VOD">
                      <SaleVidIcon />
                      <div>VOD</div>
                    </Tooltip>
                      )}
                  key="saleVideo"
                >
                  <ScrollListVideo
                    items={saleVideos}
                    loading={loadingVod}
                    canLoadmore={saleVideos && saleVideos.length < totalVods}
                    loadMore={loadMoreItem.bind(this)}
                  />
                </TabPane>
                <TabPane
                  tab={(
                    <Tooltip placement="top" title="Galleries">
                      <PictureOutlined />
                      <div>Galleries</div>
                    </Tooltip>
                      )}
                  key="gallery"
                >
                  <ScrollListGallery
                    items={galleries}
                    loading={loadingGallery}
                    canLoadmore={galleries && galleries.length < totalGalleries}
                    loadMore={loadMoreItem.bind(this)}
                  />
                </TabPane>

                <TabPane
                  tab={(
                    <Tooltip placement="top" title="Merchandise">
                      <ShoppingOutlined />
                      <div>Merchandise</div>
                    </Tooltip>
                        )}
                  key="store"
                >
                  <ScrollListProduct
                    items={products}
                    loading={loadingProduct}
                    canLoadmore={products && products.length < totalProducts}
                    loadMore={loadMoreItem.bind(this)}
                  />
                </TabPane>
                {!currentUser?.isPerformer && (
                <TabPane
                  tab={(
                    <>
                      <LiveStreamIcon performerId={performer._id} />
                      {' '}
                      <span className="lable">Live Stream</span>
                    </>
)}
                  key="livestream"
                />
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {performer.welcomeVideoPath && performer.activateWelcomeVideo && (
        <Modal
          key="welcome-video"
          className="modal-custom"
          centered
          destroyOnClose
          width={767}
          visible={showWelcomeVideo}
          title={null}
          onCancel={() => setShowWelcomeVideo(false)}
          footer={[
            <Button
              key="close"
              className="secondary"
              onClick={() => setShowWelcomeVideo(false)}
            >
              Close
            </Button>,
            <Button
              style={{ marginLeft: 0 }}
              key="close-show"
              className="primary"
              onClick={handleViewWelcomeVideo}
            >
              Don&apos;t show me again
            </Button>
          ]}
        >
          <VideoPlayer
            {...{
              key: performer._id,
              autoplay: true,
              controls: true,
              playsinline: true,
              fluid: true,
              sources: [
                {
                  src: performer.welcomeVideoPath,
                  type: 'video/mp4'
                }
              ]
            }}
          />
        </Modal>
      )}
      <Modal
        key="subscribe_performer"
        className="modal-custom"
        centered
        width={400}
        title={null}
        visible={openSubscriptionModal}
        confirmLoading={submiting}
        footer={null}
        onCancel={() => setOpenSubscriptionModal(false)}
      >
        <ConfirmSubscriptionPerformerForm
          settings={settings}
          type={subscriptionType}
          performer={performer}
          submiting={submiting}
          onFinish={subscribe.bind(this)}
        />
      </Modal>
    </Layout>
  );
}

PerformerProfile.getInitialProps = async (ctx) => {
  try {
    const { query } = ctx;
    const { token = '' } = nextCookie(ctx);
    const performer = (await (
      await performerService.findOne(query.username, {
        Authorization: token
      })
    ).data) as IPerformer;

    if (!performer) {
      return redirect404(ctx);
    }
    const bodyInfo = await utilsService.bodyInfo();

    return {
      performer,
      bodyInfo: bodyInfo?.data,
      msg: query.msg
    };
  } catch (e) {
    return redirect404(ctx);
  }
};

PerformerProfile.authenticate = true;
PerformerProfile.noredirect = true;

const mapStates = (state: any) => ({
  videoState: { ...state.video.videos },
  saleVideoState: { ...state.video.saleVideos },
  productState: { ...state.product.products },
  galleryState: { ...state.gallery.galleries },
  feedState: { ...state.feed.feeds },
  currentUser: { ...state.user.current },
  settings: { ...state.settings },
  user: { ...state.user.current }
});

const mapDispatch = {
  getVideosHandler: getVideos,
  moreVideoHandler: moreVideo,
  getVodsHandler: getVods,
  listProductsHandler: listProducts,
  moreProductHandler: moreProduct,
  getGalleriesHandler: getGalleries,
  moreGalleryHandler: moreGalleries,
  moreVodHandler: moreVod,
  getFeedsHandler: getFeeds,
  moreFeedsHandler: moreFeeds,
  removeFeedSuccessHandler: removeFeedSuccess
};
export default connect(mapStates, mapDispatch)(PerformerProfile);
