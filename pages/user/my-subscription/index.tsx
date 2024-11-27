import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { TableListSubscription } from '@components/subscription/table-list-subscription';
import { formatDate } from '@lib/date';
import { getResponseError } from '@lib/utils';
import { paymentService, subscriptionService } from '@services/index';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import { PureComponent } from 'react';
import { ISubscription } from 'src/interfaces';

interface IStates {
  subscriptionList: ISubscription[];
  loading: boolean;
  pagination: {
    pageSize: number;
    current: number;
    total: number;
  };
  sort: string;
  sortBy: string;
  filter: {};
}

class SubscriptionPage extends PureComponent<any, IStates> {
  static authenticate = true;

  constructor(props) {
    super(props);
    this.state = {
      subscriptionList: [],
      loading: false,
      pagination: {
        pageSize: 10,
        current: 1,
        total: 0
      },
      sort: 'desc',
      sortBy: 'updatedAt',
      filter: {}
    };
  }

  componentDidMount() {
    this.getData();
  }

  async handleTabChange(data, _filter, sorter) {
    const { pagination } = this.state;
    const sort = sorter?.order === 'ascend' ? 'asc' : 'desc';
    const sortBy = sorter?.field || 'updatedAt';
    this.setState({
      pagination: { ...pagination, current: data.current },
      sort,
      sortBy
    }, () => this.getData());
  }

  async getData() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      this.setState({ loading: true });
      const resp = await subscriptionService.userSearch({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      this.setState({
        subscriptionList: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      message.error(
        getResponseError(error) || 'An error occured. Please try again.'
      );
    } finally {
      this.setState({ loading: false });
    }
  }

  async cancelSubscription(subscription: ISubscription) {
    if (subscription.subscriptionType === 'system' && !window.confirm(`You are trying to cancel a subscription created by the site admin. Cancelling this will block access to ${subscription?.performerInfo?.name || subscription?.performerInfo?.username || 'the model'}'s content immediately. Do you wish to continue?`)) {
      return;
    }
    if (subscription.subscriptionType !== 'system' && !window.confirm(`Are you sure want to cancel this subscription? You can still enjoy the subscription benefits until ${formatDate(subscription?.expiredAt, 'll')}`)) {
      return;
    }
    try {
      await paymentService.cancelSubscription(subscription._id);
      message.success('This subscription have been suspended');
      this.getData();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    }
  }

  render() {
    const { subscriptionList, pagination, loading } = this.state;
    return (
      <Layout>
        <PageTitle title="My Subscriptions" />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="My Subscriptions"
          />
          <div className="table-responsive">
            <TableListSubscription
              dataSource={subscriptionList}
              pagination={{ ...pagination, showSizeChanger: false }}
              loading={loading}
              onChange={this.handleTabChange.bind(this)}
              rowKey="_id"
              cancelSubscription={this.cancelSubscription.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default SubscriptionPage;
