import { ArrowLeftOutlined } from '@ant-design/icons';
import ScrollListFeed from '@components/feed/scroll-list';
import {
  Layout, message, PageHeader,
  Pagination
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IFeed, IUIConfig, IUser } from 'src/interfaces';
import { feedService } from 'src/services';

interface IProps {
  ui: IUIConfig;
  user: IUser;
}
interface IStates {
  loading: boolean;
  feeds: any[];
  currentPage: number;
  limit: number;
  total: number;
}

class FavouriteVideoPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      feeds: [],
      currentPage: 1,
      limit: 12,
      total: 0
    };
  }

  componentDidMount() {
    this.getBookmarkedPosts();
  }

  componentDidUpdate(_, prevState: IStates): void {
    const { currentPage } = this.state;
    if (prevState.currentPage !== currentPage) {
      this.getBookmarkedPosts();
    }
  }

  async handlePagechange(page: number) {
    await this.setState({ currentPage: page });
  }

  async onDeleteFeed(feed: IFeed) {
    const { user } = this.props;
    const { feeds } = this.state;
    if (user._id !== feed.fromSourceId) {
      return message.error('Permission denied');
    }
    if (!window.confirm('Are you sure to delete this post?')) return undefined;
    try {
      await feedService.delete(feed._id);
      feeds.filter((f) => f._id !== feed._id);
      message.success('Removed successfully');
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Something went wrong, please try again later');
    }
    return undefined;
  }

  async getBookmarkedPosts() {
    const { currentPage, limit } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await feedService.getBookmark({
        limit,
        offset: (currentPage - 1) * limit
      });
      this.setState({
        feeds: resp.data.data,
        total: resp.data.total
      });
    } catch (error) {
      message.error('Server error');
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      loading, feeds, limit, total
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {ui && ui.siteName}
            {' '}
            | Bookmarked Feeds
          </title>
        </Head>
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Bookmarked Feeds"
          />
          {feeds && feeds.length > 0 && (
            <ScrollListFeed
              items={feeds.map((item) => item.objectInfo)}
              canLoadmore={feeds && feeds.length < total}
              loadMore={this.handlePagechange.bind(this, 'feeds')}
              onDelete={this.onDeleteFeed.bind(this)}
            />
          )}
          {!loading && !feeds.length && (
          <div style={{ textAlign: 'center' }}>
            No bookmarked feed was found.
          </div>
          )}
          {total > limit && (
          <div className="paging">
            <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              total={total}
              pageSize={limit}
              onChange={this.handlePagechange.bind(this)}
            />
          </div>
          )}
        </div>
      </Layout>
    );
  }
}
const mapState = (state: any) => ({ ui: state.ui, user: state.user.current });
export default connect(mapState)(FavouriteVideoPage);
