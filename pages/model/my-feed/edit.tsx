import { ArrowLeftOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import FeedForm from '@components/feed/form';
import { feedService } from '@services/index';
import {
  Layout
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IFeed, IUIConfig } from 'src/interfaces/index';

interface IProps {
  ui: IUIConfig;
  feed: IFeed;
}

class EditFeed extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps(ctx) {
    try {
      const { token = '' } = nextCookie(ctx);
      const feed = await (await feedService.findOne(ctx.query.id, { Authorization: token })).data;
      return { feed };
    } catch (e) {
      return { ctx };
    }
  }

  componentDidMount() {
    const { feed } = this.props;
    if (!feed) {
      Router.back();
    }
  }

  render() {
    const { feed, ui } = this.props;
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {feed && (
        <Layout>
          <Head>
            <title>
              {ui?.siteName}
              {' '}
              | Edit Feed
            </title>
          </Head>
          <div className="main-container">
            <Page>
              <div className="page-heading">
                <a aria-hidden onClick={() => Router.back()}><ArrowLeftOutlined /></a>
                &nbsp;
                <span>Edit Feed</span>
              </div>
              <div>
                <FeedForm feed={feed} />
              </div>
            </Page>
          </div>
        </Layout>
        )}
      </>
    );
  }
}
const mapStates = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStates)(EditFeed);
