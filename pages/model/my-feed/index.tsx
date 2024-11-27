/* eslint-disable no-restricted-globals */
import { PlusCircleOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/common/search-filter';
import ScrollListFeed from '@components/feed/scroll-list';
import { feedService } from '@services/index';
import {
  Layout,
  message
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/index';

interface IProps {
  ui: IUIConfig;
}

class FeedListing extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    list: [] as any,
    total: 0,
    limit: 10,
    currentPage: 1,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  async handleFilter(filter) {
    this.setState({ filter, currentPage: 1, list: [] }, () => this.search());
  }

  async search() {
    const {
      filter, limit, sortBy, sort, list, currentPage
    } = this.state;
    try {
      const resp = await feedService.search({
        ...filter,
        limit,
        offset: (currentPage - 1) * limit,
        sort,
        sortBy
      });
      this.setState({
        list: [...list, ...resp.data.data],
        total: resp.data.total
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
    }
  }

  async loadMore() {
    const {
      currentPage
    } = this.state;
    this.setState({ currentPage: currentPage + 1 }, () => this.search());
  }

  async deleteFeed(feed) {
    const { list } = this.state;
    if (!confirm('Are you sure to delete this post?')) {
      return false;
    }
    try {
      await feedService.delete(feed._id);
      const newList = list.filter((f) => f._id !== feed._id);
      await this.setState({ list: newList });
      message.success('Deleted the post successfully');
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { list, total } = this.state;
    const { ui } = this.props;
    const type = [
      {
        key: '',
        text: 'All feeds'
      },
      {
        key: 'text',
        text: 'Text feeds'
      },
      {
        key: 'video',
        text: 'Video feeds'
      },
      {
        key: 'photo',
        text: 'Photo feeds'
      }
    ];
    return (
      <Layout>
        <Head>
          <title>
            { ui?.siteName }
            {' '}
            | My Feeds
          </title>
        </Head>
        <div className="main-container feedpage">
          <Page>
            <div className="page-heading" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>My Feeds</span>
              <Link href="/model/my-feed/create">
                <a>
                  {' '}
                  <PlusCircleOutlined />
                  {' '}
                  New Feed
                </a>
              </Link>
            </div>
            <div />
            <div>
              <SearchFilter
                onSubmit={this.handleFilter.bind(this)}
                type={type}
                searchWithKeyword
              />
            </div>
            <div className="main-background">
              <ScrollListFeed
                items={list}
                canLoadmore={total > list.length}
                loadMore={this.loadMore.bind(this)}
                onDelete={this.deleteFeed.bind(this)}
              />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});
export default connect(mapStates)(FeedListing);
