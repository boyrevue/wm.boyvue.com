import { ArrowLeftOutlined, ContactsOutlined, HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import {
  IError,
  IFeed, IUIConfig, IUser
} from '@interfaces/index';
import { feedService } from '@services/index';
import {
  Button,
  Layout, message, Result
} from 'antd';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

const FeedCard = dynamic(() => import('@components/feed/feed-card'), { ssr: false });

interface IProps {
  ui: IUIConfig;
  feed: IFeed;
  user: IUser;
  error: IError;
}

class PostDetails extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  static async getInitialProps(ctx) {
    try {
      const { token = '' } = nextCookie(ctx);
      const feed = await (await feedService.findOne(ctx.query.id, { Authorization: token })).data;
      return { feed };
    } catch (e) {
      return { error: await e };
    }
  }

  async onDelete(feed: IFeed) {
    const { user } = this.props;
    if (user._id !== feed.fromSourceId) {
      return message.error('Permission denied');
    }
    if (!window.confirm('Are you sure to delete this post?')) return false;
    try {
      await feedService.delete(feed._id);
      message.success('Deleted the post successfully');
      Router.back();
    } catch {
      message.error('Something went wrong, please try again later');
    }
    return undefined;
  }

  render() {
    const { feed, ui, error } = this.props;
    const { performer } = feed;
    if (error) {
      return (
        <Result
          status={error?.statusCode === 404 ? '404' : 'error'}
          title={error?.statusCode === 404 ? null : error?.statusCode}
          subTitle={error?.statusCode === 404 ? 'Alas! It hurts us to realize that we have let you down. We are not able to find the page you are hunting for :(' : error?.message}
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/')}>
              <HomeOutlined />
              BACK HOME
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
              <ContactsOutlined />
              CONTACT US
            </Button>
          ]}
        />
      );
    }
    return (
      <Layout>
        <Head>
          <title>
            {`${ui?.siteName} | ${performer?.name}`}
          </title>
          <meta
            name="keywords"
            content={`${performer?.name}, ${performer?.username}, ${feed?.text}`}
          />
          <meta
            name="description"
            content={feed?.text}
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${performer?.name}, ${performer?.username}`}
            key="title"
          />
          <meta
            property="og:keywords"
            content={`${performer?.name}, ${performer?.username}, ${feed?.text}`}
          />
          <meta
            property="og:description"
            content={feed?.text}
          />
        </Head>
        <div className="main-container">
          <Page>
            <div className="page-heading">
              <a aria-hidden onClick={() => Router.back()}>
                <ArrowLeftOutlined />
                {' '}
                {`${performer?.name} post`}
              </a>
            </div>
            <div className="main-container custom">
              <FeedCard feed={feed} onDelete={this.onDelete.bind(this)} />
            </div>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui },
  user: state.user.current
});
export default connect(mapStates)(PostDetails);
