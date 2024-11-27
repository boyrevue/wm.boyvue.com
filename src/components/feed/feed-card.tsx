/* eslint-disable no-prototype-builtins */
import {
  CommentOutlined,
  DollarOutlined,
  EyeOutlined,
  FileImageOutlined,
  FlagOutlined,
  HeartFilled,
  HeartOutlined,
  LockOutlined,
  MoreOutlined,
  PushpinFilled,
  UnlockOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { CommentForm, ListComments } from '@components/comment';
import { Countdown } from '@components/common/count-down';
import { ConfirmSubscriptionPerformerForm } from '@components/performer';
import { TipPerformerForm } from '@components/performer/tip-form';
import ReportForm from '@components/report/report-form';
import VideoPlayer from '@components/video/video-player';
// import { Twitter, Facebook } from 'react-social-sharing';
import { formatDateFromnow, videoDuration } from '@lib/index';
import {
  createComment,
  deleteComment,
  getComments,
  moreComment
} from '@redux/comment/actions';
import { updateBalance } from '@redux/user/actions';
import {
  feedService, paymentService, paymentWalletService, reactionService, reportService,
  settingService
} from '@services/index';
import {
  Button,
  Divider,
  Dropdown,
  Menu,
  message,
  Modal
} from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Router from 'next/router';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';

import { IFeed, ISettings, IUser } from '../../interfaces';
import style from './index.module.less';
import { PurchaseFeedForm } from './purchase-feed-form';

// const VideoPlayer = dynamic(() => import('@components/video/video-player'), {
//   ssr: false
// });

const FeedSlider = dynamic(() => import('./feed-slider'), { ssr: false });

interface IProps {
  feed: IFeed;
  // eslint-disable-next-line react/require-default-props
  onDelete?: Function;
  user: IUser;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  deleteComment: Function;
  updateBalance: Function;
  commentMapping: any;
  comment: any;
  settings: ISettings;
  loggedIn: boolean;
}

interface IStates {
  isOpenComment: boolean;
  isLiked: boolean;
  // isBookMarked: boolean;
  totalLike: number;
  totalTips: number;
  totalComment: number;
  isFirstLoadComment: boolean;
  itemPerPage: number;
  commentPage: number;
  isHovered: boolean;
  openTipModal: boolean;
  openPurchaseModal: boolean;
  openTeaser: boolean;
  submiting: boolean;
  polls: any;
  requesting: boolean
  // shareUrl: string;
  openSubscriptionModal: boolean;
  openReportModal: boolean;
  showPinned: boolean;
}

function thoudsandToK(value: number) {
  if (value < 1000) return value;
  return `${(value / 1000).toFixed(1)}K`;
}

class FeedCard extends Component<IProps, IStates> {
  subscriptionType = 'monthly';

  videplayer = createRef<any>();

  constructor(props: IProps) {
    super(props);
    this.state = {
      isOpenComment: false,
      isLiked: false,
      // isBookMarked: false,
      totalLike: 0,
      totalTips: 0,
      totalComment: 0,
      isFirstLoadComment: true,
      itemPerPage: 10,
      commentPage: 0,
      isHovered: false,
      openTipModal: false,
      openPurchaseModal: false,
      openTeaser: false,
      submiting: false,
      polls: [],
      requesting: false,
      // shareUrl: '',
      openSubscriptionModal: false,
      openReportModal: false,
      showPinned: false
    };
  }

  componentDidMount() {
    const { feed } = this.props;
    if (feed) {
      this.setState({
        isLiked: feed.isLiked,
        // isBookMarked: feed.isBookMarked,
        totalLike: feed.totalLike,
        totalTips: feed.totalTips,
        totalComment: feed.totalComment,
        showPinned: feed.isPinned && (Router.pathname === '/model/[username]' || Router.pathname === '/model/my-feed'),
        polls: feed.polls ? feed.polls : []
        // shareUrl: `${window.location.origin}/post/${feed._id}`
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { feed, commentMapping, comment } = this.props;
    const { totalComment } = this.state;
    if (
      (!prevProps.comment.data
        && comment.data
        && comment.data.objectId === feed._id)
      || (prevProps.commentMapping[feed._id]
        && totalComment !== commentMapping[feed._id].total)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ totalComment: commentMapping[feed._id].total });
    }
  }

  async handleLike() {
    const { feed, user } = this.props;
    const { isLiked, totalLike, requesting } = this.state;
    if (!user?._id) {
      message.error('Please login or register to Like');
      Router.push('/auth/login');
      return;
    }
    if (requesting) return;
    try {
      await this.setState({ requesting: true });
      if (!isLiked) {
        await reactionService.create({
          objectId: feed._id,
          action: 'like',
          objectType: 'feed'
        });
        this.setState({ isLiked: true, totalLike: totalLike + 1 });
      } else {
        await reactionService.delete({
          objectId: feed._id,
          action: 'like',
          objectType: 'feed'
        });
        this.setState({ isLiked: false, totalLike: totalLike - 1 });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      await this.setState({ requesting: false });
    }
  }

  async handleReport(payload: any) {
    const { feed } = this.props;
    try {
      if (!payload.title) return;

      this.setState({ requesting: true });
      await reportService.create({
        ...payload,
        target: 'feed',
        targetId: feed._id,
        performerId: feed.performer._id
      });
      message.success('Feed has been reported for violation');
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    } finally {
      this.setState({ requesting: false, openReportModal: false });
    }
  }

  handleClickViewFeed = () => {
    const { user } = this.props;
    if (!user?._id) {
      message.error('You can subscribe to the model once you login/register.');
      Router.push('/auth/login');
    } else {
      this.setState({ openSubscriptionModal: true });
    }
  };

  handleClickTips = () => {
    const { user, feed } = this.props;
    const { performer } = feed;
    if (!user?._id) {
      message.error('Please login or register to send a tip');
      Router.push('/auth/login');
      return;
    }

    if (user?._id !== performer?._id) {
      this.setState({ openTipModal: true });
    }
  };

  async onOpenComment() {
    const { feed, getComments: handleGetComment } = this.props;
    const {
      isOpenComment, isFirstLoadComment, itemPerPage, commentPage
    } = this.state;
    this.setState({ isOpenComment: !isOpenComment });
    if (isFirstLoadComment) {
      await this.setState({ isFirstLoadComment: false });
      handleGetComment({
        objectId: feed._id,
        objectType: 'feed',
        limit: itemPerPage,
        offset: commentPage
      });
    }
  }

  pinToProfile = async (feedId: string) => {
    try {
      await feedService.pinToProfile(feedId);
      message.success('Pinned to profile successfull');
      window.location.reload();
    } catch (error) {
      message.error('An error occorred, please try again!');
    }
  };

  unPinToProfile = async (feedId: string) => {
    try {
      await feedService.unPinToProfile(feedId);
      message.success('UnPinned to profile successfull');
      window.location.reload();
    } catch (error) {
      message.error('An error occorred, please try again!');
    }
  };

  copyLink(feedId: string) {
    const str = `${window.location.origin}/post/${feedId}`;
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    message.success('Copied to clipboard');
  }

  async moreComment() {
    const { feed, moreComment: handleLoadMore } = this.props;
    const { commentPage, itemPerPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleLoadMore({
      limit: itemPerPage,
      offset: (commentPage + 1) * itemPerPage,
      objectId: feed._id
    });
  }

  async deleteComment(item) {
    const { deleteComment: handleDelete } = this.props;
    if (!window.confirm('Are you sure to remove this comment?')) return;
    handleDelete(item);
  }

  async subscribe() {
    const { feed } = this.props;
    try {
      await this.setState({ submiting: true });
      const resp = await (
        await paymentService.subscribe({
          type: this.subscriptionType,
          performerId: feed.performer._id
        })
      ).data;
      window.location.href = resp?.paymentUrl;
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async sendTip(amount: number) {
    const { feed, updateBalance: handleUpdateBalance } = this.props;
    const { totalTips } = this.state;
    try {
      await this.setState({ submiting: true });
      const setting = await settingService.valueByKeys(['minTippingAmount', 'maxTippingAmount']);
      const {
        minTippingAmount,
        maxTippingAmount
      } = setting;
      if (minTippingAmount && amount < minTippingAmount) {
        message.error({ content: `Minimum top-up amount is $${minTippingAmount}`, key: 'wallet-amount-limit' });
        await this.setState({ submiting: false });
        return;
      }

      if (maxTippingAmount && amount > maxTippingAmount) {
        message.error({ content: `Maximum top-up amount is $${maxTippingAmount}`, key: 'wallet-amount-limit' });
        await this.setState({ submiting: false });
        return;
      }

      const resp = await (
        await paymentWalletService.tipFeed({
          performerId: feed?.performer?._id,
          feedId: feed._id,
          amount
        })
      ).data;
      if (resp.success) {
        message.info('Thank you for the tip');
        handleUpdateBalance(-1 * amount);
      }
      this.setState({ totalTips: totalTips + amount });
    } catch (e) {
      const err = await e;
      message.error(err.message || 'error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async votePoll(poll: any) {
    const { feed, loggedIn, user } = this.props;
    if (!loggedIn) {
      message.error('Please login or register to vote');
      return;
    }
    if (user.isPerformer && user._id !== poll.createdBy) return;
    const { polls } = this.state;
    const isExpired = new Date(feed.pollExpiredAt) < new Date();
    if (isExpired) {
      message.error('Poll has already expired to vote');
      return;
    }
    if (!window.confirm('Vote it?')) return;

    try {
      await this.setState({ requesting: true });
      await feedService.votePoll(poll._id);
      const index = polls.findIndex((p) => p._id === poll._id);
      await this.setState((prevState: any) => {
        const newItems = [...prevState.polls];
        newItems[index].totalVote += 1;
        return { polls: newItems };
      });
    } catch (e) {
      const error = await e;
      message.error(
        error.message || 'Something went wrong, please try again later'
      );
    } finally {
      await this.setState({ requesting: false });
    }
  }

  render() {
    const {
      feed,
      user,
      commentMapping,
      comment,
      onDelete: handleDelete,
      createComment: handleCreateComment,
      settings
    } = this.props;
    const { performer } = feed;
    const { requesting: commenting } = comment;
    const fetchingComment = commentMapping.hasOwnProperty(feed._id)
      ? commentMapping[feed._id].requesting
      : false;
    const comments = commentMapping.hasOwnProperty(feed._id)
      ? commentMapping[feed._id].items
      : [];
    const totalComments = commentMapping.hasOwnProperty(feed._id)
      ? commentMapping[feed._id].total
      : 0;
    const {
      isOpenComment,
      isLiked,
      totalComment,
      totalLike,
      totalTips,
      isHovered,
      openTipModal,
      openPurchaseModal,
      submiting,
      polls,
      // isBookMarked,
      // shareUrl,
      openTeaser,
      openSubscriptionModal,
      openReportModal,
      showPinned
    } = this.state;
    const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
    const videos = feed.files && feed.files.filter((f) => f.type === 'feed-video');
    let totalVote = 0;
    polls
      && polls.forEach((poll) => {
        totalVote += poll.totalVote;
      });
    const menu = (
      <Menu key={`menu_${feed._id}`}>
        {!Router.pathname.includes('/post/') && (
        <Menu.Item key={`post_detail_${feed._id}`}>
          <Link
            href={{
              pathname: '/post/[id]',
              query: { id: feed._id }
            }}
            as={`/post/${feed._id}`}
          >
            <a>Post details</a>
          </Link>
        </Menu.Item>
        )}
        <Menu.Item
          key={`copy_link_${feed._id}`}
          onClick={this.copyLink.bind(this, feed._id)}
        >
          <a>Copy link to clipboard</a>
        </Menu.Item>
        {user._id === feed.fromSourceId && !feed.isPinned && (
          <Menu.Item
            key={`pin_profile_${feed._id}`}
            onClick={this.pinToProfile.bind(this, feed._id)}
          >
            <a>
              Pin to profile page
            </a>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && feed.isPinned && (
          <Menu.Item
            key={`un_pin_profile_${feed._id}`}
            onClick={this.unPinToProfile.bind(this, feed._id)}
          >
            <a>
              Unpinned
            </a>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && (
          <Menu.Item key={`edit_feed_${feed._id}`}>
            <Link
              href={{
                pathname: '/model/my-feed/edit',
                query: { id: feed._id }
              }}
            >
              <a>Edit feed</a>
            </Link>
          </Menu.Item>
        )}
        {user._id === feed.fromSourceId && (
          <Divider style={{ margin: '10px 0' }} />
        )}
        {user._id === feed.fromSourceId && (
          <Menu.Item key={`delete_post_${feed._id}`}>
            <a aria-hidden onClick={handleDelete.bind(this, feed)}>
              Delete feed
            </a>
          </Menu.Item>
        )}
      </Menu>
    );
    const dropdown = (
      <Dropdown overlay={menu}>
        <a
          aria-hidden
          className="ant-dropdown-link"
          onClick={(e) => e.preventDefault()}
        >
          <MoreOutlined />
        </a>
      </Dropdown>
    );

    return (
      <div className={style['feed-card']}>
        <div className="feed-top">
          <Link
            href={{
              pathname: '/model/[username]',
              query: { username: performer?.username }
            }}
            as={`/${performer?.username}`}
          >
            <div className="feed-top-left">
              <img
                alt="per_atv"
                src={performer?.avatar || '/no-avatar.png'}
                width="50px"
              />
              <div className="feed-name">
                <h4>
                  {performer?.name || 'N/A'}
                  {/* {' '}
                  {performer?.verifiedAccount && <CheckCircleOutlined className="theme-color" />} */}
                </h4>
                <h5>
                  @
                  {performer?.username || 'N/A'}
                </h5>
              </div>
              {performer?.isOnline ? (
                <span className="online-status" />
              ) : (
                <span className="online-status off" />
              )}
            </div>
          </Link>
          <div className="feed-top-right">
            {showPinned && <PushpinFilled />}
            <span className="feed-time">
              {formatDateFromnow(feed.updatedAt)}
            </span>
            {dropdown}
          </div>
        </div>
        <div className="feed-text">
          {feed.text}
        </div>
        <div className="feed-container">
          {((!feed.isSale && feed.isSubscribed) || (feed.isSale && feed.isBought)) ? (
            <div className="feed-content">
              <FeedSlider feed={feed} />
            </div>
          ) : null}
          {((feed.type !== 'text' && !feed.isSale && !feed.isSubscribed) || (feed.isSale && !feed.isBought)) ? (
            <div
              className="lock-content"
              style={
                  feed.thumbnailUrl ? {
                    backgroundImage: `url(${feed.thumbnailUrl})`
                  } : {}
                }
            >
              <div
                className="text-center"
                style={{ cursor: user.isPerformer ? 'not-allowed' : 'pointer', opacity: user.isPerformer ? 0.7 : 'unset' }}
                onMouseEnter={() => this.setState({ isHovered: true })}
                onMouseLeave={() => this.setState({ isHovered: false })}
              >
                {(user.isPerformer && <LockOutlined />) || (!user.isPerformer && !isHovered ? <LockOutlined /> : <UnlockOutlined />)}
                {!feed.isSale && !feed.isSubscribed && performer && (
                <p
                  aria-hidden
                  onClick={this.handleClickViewFeed}
                  style={{ pointerEvents: user.isPerformer ? 'none' : 'unset' }}
                >
                  subscribe to see feed
                </p>
                )}
                {feed.isSale && !feed.isBought && performer && (
                <p
                  aria-hidden
                  onClick={() => this.setState({ openPurchaseModal: true })}
                  style={{ pointerEvents: user.isPerformer ? 'none' : 'unset' }}
                >
                  Unlock feed for $
                  {feed.price || 0}
                </p>
                )}
                {feed.teaser && (
                <div className="text-center">
                  <Button
                    type="primary"
                    onClick={() => this.setState({ openTeaser: true })}
                    disabled={user.isPerformer}
                  >
                    <EyeOutlined />
                    View teaser video
                  </Button>
                </div>
                )}
              </div>
              {feed.files && feed.files.length > 0 && (
              <div className="count-media">
                <span className="count-media-item">
                  {images.length > 0 && (
                  <span>
                    {images.length > 1 && images.length}
                    {' '}
                    <FileImageOutlined />
                    {' '}
                  </span>
                  )}
                  {videos.length > 0 && images.length > 0 && '|'}
                  {videos.length > 0 && (
                  <span>
                    {videos.length > 1 && videos.length}
                    {' '}
                    <VideoCameraOutlined />
                    {' '}
                    {videos.length === 1
                            && videoDuration(videos[0].duration)}
                  </span>
                  )}
                </span>
              </div>
              )}
            </div>
          ) : null}
          <div className={style['feed-polls']}>
            {polls?.length > 0
              && polls.map((poll) => (
                <div
                  aria-hidden
                  className={style['feed-poll']}
                  key={poll._id}
                  onClick={this.votePoll.bind(this, poll)}
                >
                  <span>{poll.description}</span>
                  {' '}
                  <span>{poll.totalVote}</span>
                </div>
              ))}
            {polls?.length > 0 && (
              <div className={style['total-vote']}>
                <span>
                  Total
                  {' '}
                  {totalVote}
                  {' '}
                  votes
                </span>
                <Countdown toDate={feed.pollExpiredAt} />
              </div>
            )}
          </div>
        </div>
        <div className="feed-bottom">
          <div className="feed-actions">
            <div className="action-item">
              <Button
                aria-hidden
                className={isLiked ? 'actionIco liked' : 'actionIco'}
                onClick={this.handleLike.bind(this)}
                disabled={feed.fromSourceId !== user?._id && user?.isPerformer}
                style={{ cursor: feed.fromSourceId !== user?._id && user?.isPerformer ? 'not-allowed' : 'pointer', opacity: feed.fromSourceId !== user?._id && user?.isPerformer ? 0.7 : 'unset' }}
              >
                {isLiked ? <HeartFilled /> : <HeartOutlined />}
                {' '}
                {totalLike > 0 ? thoudsandToK(totalLike) : '0'}
              </Button>
              <Button
                aria-hidden
                className={isOpenComment ? 'actionIco active' : 'actionIco'}
                onClick={this.onOpenComment.bind(this)}
                disabled={feed.fromSourceId !== user?._id && user?.isPerformer}
                style={{ cursor: feed.fromSourceId !== user?._id && user?.isPerformer ? 'not-allowed' : 'pointer', opacity: feed.fromSourceId !== user?._id && user?.isPerformer ? 0.7 : 'unset' }}
              >
                <CommentOutlined />
                {' '}
                {totalComment > 0 && thoudsandToK(totalComment)}
              </Button>
              {performer && (
                <Button
                  aria-hidden
                  className={style.actionIco}
                  onClick={this.handleClickTips}
                  disabled={feed.fromSourceId !== user?._id && user?.isPerformer}
                  style={{ cursor: feed.fromSourceId !== user?._id && user?.isPerformer ? 'not-allowed' : 'pointer', opacity: feed.fromSourceId !== user?._id && user?.isPerformer ? 0.7 : 'unset' }}
                >
                  <DollarOutlined />
                  {' '}
                  {totalTips > 0 ? thoudsandToK(totalTips) : '0'}
                </Button>
              )}
              <Button
                disabled={
                  !user?._id || user?.isPerformer
                }
                className={openReportModal ? 'react-btn active' : 'react-btn'}
                onClick={() => this.setState({ openReportModal: true })}
              >
                <FlagOutlined />
              </Button>
            </div>
            {/* <div className="action-item">
              <Twitter link={shareUrl} />
              <Facebook link={shareUrl} />
              {user._id && !user.isPerformer && (
              <span aria-hidden className={isBookMarked ? 'actionIco active' : 'actionIco'} onClick={this.handleBookmark.bind(this)}>
                <Tooltip title={!isBookMarked ? 'Add to Bookmarks' : 'Remove from Bookmarks'}><BookOutlined /></Tooltip>
              </span>
              )}
            </div> */}
          </div>
          {isOpenComment && (
            <div className="feed-comment">
              <CommentForm
                creator={user}
                onSubmit={handleCreateComment.bind(this)}
                objectId={feed._id}
                objectType="feed"
                requesting={commenting}
              />
              <ListComments
                key={`list_comments_${feed._id}_${comments.length}`}
                requesting={fetchingComment}
                comments={comments}
                onDelete={this.deleteComment.bind(this)}
                user={user}
                canReply
              />
              {comments.length < totalComments && (
                <p className="text-center">
                  <a aria-hidden onClick={this.moreComment.bind(this)}>
                    More comments...
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
        <Modal
          key="tip_performer"
          className={style['tip-performer-modal']}
          title={null}
          width={350}
          visible={openTipModal}
          onOk={() => this.setState({ openTipModal: false })}
          footer={null}
          onCancel={() => this.setState({ openTipModal: false })}
        >
          <TipPerformerForm
            performer={performer}
            submiting={submiting}
            onFinish={this.sendTip.bind(this)}
          />
        </Modal>
        <Modal
          key="purchase_feed"
          className="subscription-modal"
          title={null}
          visible={openPurchaseModal}
          confirmLoading={submiting}
          footer={null}
          destroyOnClose
          onCancel={() => this.setState({ openPurchaseModal: false })}
          centered
        >
          <PurchaseFeedForm feed={feed} />
        </Modal>
        <Modal
          key="subscribe_performer"
          className="subscription-modal modal-custom"
          width={400}
          title={null}
          visible={openSubscriptionModal}
          footer={null}
          onCancel={() => this.setState({ openSubscriptionModal: false })}
        >
          <ConfirmSubscriptionPerformerForm
            settings={settings}
            type={this.subscriptionType || 'monthly'}
            performer={performer}
            submiting={submiting}
            onFinish={this.subscribe.bind(this)}
          />
        </Modal>
        <Modal
          key="teaser_video"
          className="modal-custom"
          title="Teaser video"
          visible={openTeaser}
          footer={null}
          centered
          onCancel={() => {
            this.setState({ openTeaser: false });
            if (this.videplayer.current && this.videplayer.current.pause) {
              this.videplayer.current?.pause();
            }
          }}
          width={990}

        >
          <VideoPlayer
            key={feed?.teaser?._id}
            id={feed?.teaser?._id}
            ref={this.videplayer}
            pauseHiddenVideo
            {...{
              autoplay: false,
              controls: true,
              playsinline: true,
              sources: [
                {
                  src: feed?.teaser?.url,
                  type: 'video/mp4'
                }
              ]
            }}
          />
        </Modal>
        <Modal
          key="report_post"
          className="subscription-modal modal-custom "
          title="Report post"
          visible={openReportModal}
          confirmLoading={submiting}
          footer={null}
          destroyOnClose
          onCancel={() => this.setState({ openReportModal: false })}
        >
          <ReportForm submiting={submiting} onFinish={this.handleReport.bind(this)} />
        </Modal>
      </div>
    );
  }
}

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    user: state.user.current,
    settings: state.settings,
    commentMapping,
    comment,
    loggedIn: state.auth.loggedIn
  };
};

const mapDispatch = {
  getComments,
  moreComment,
  createComment,
  deleteComment,
  updateBalance
};
export default connect(mapStates, mapDispatch)(FeedCard);
