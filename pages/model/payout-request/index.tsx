import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { getResponseError } from '@lib/utils';
import { payoutRequestService } from '@services/index';
import {
  Button, Col,
  Divider, Layout, message, PageHeader, Row, Statistic
} from 'antd';
import Router from 'next/router';
import React, { PureComponent } from 'react';
import PayoutRequestList from 'src/components/payout-request/table';

import style from './payment-request.module.less';

class PerformerPayoutRequestPage extends PureComponent {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    items: [],
    loading: false,
    pagination: {
      pageSize: 10,
      current: 1,
      total: 0
    } as any,
    sort: 'desc',
    sortBy: 'updatedAt',
    filter: {},
    statsPayout: {
      totalPrice: 0,
      paidPrice: 0,
      unpaidPrice: 0
    },
    totalPayoutRequest: 0
  };

  componentDidMount() {
    this.getData();
    this.calculateStatsPayout();
    this.calculatTotalPayoutRequest();
  }

  async handleTabChange(data, _filter, sorter) {
    const { pagination } = this.state;
    const sort = sorter?.order === 'ascend' ? 'asc' : 'desc';
    const sortBy = sorter?.field || 'updatedAt';
    await this.setState({
      pagination: { ...pagination, current: data.current },
      sort,
      sortBy
    });
    this.getData();
  }

  async getData() {
    try {
      const {
        filter, sort, sortBy, pagination
      } = this.state;
      await this.setState({ loading: true });
      const resp = await payoutRequestService.search({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      await this.setState({
        items: resp.data.data,
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

  calculatTotalPayoutRequest = async () => {
    try {
      const resp = await payoutRequestService.totalPayoutRequest();
      this.setState({ totalPayoutRequest: resp.data.totalRequestedPrice });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  };

  calculateStatsPayout = async () => {
    try {
      const resp = await payoutRequestService.stats();
      this.setState({ statsPayout: resp.data });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  };

  async createPayoutRequest() {
    const resp = await payoutRequestService.checkPending();
    if (resp.data.hasPending) {
      return message.error('Please wait for the previous payout to be closed.');
    }
    return Router.push('/model/payout-request/create');
  }

  render() {
    const {
      pagination, items, loading, statsPayout, totalPayoutRequest
    } = this.state;

    return (
      <Layout>
        <PageTitle title="Payout Requests" />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Total Payout Requested"
          />
          <div className={style['statistic-payment']}>
            <Row>
              <Col span={8}>
                <Statistic
                  title="Total Payout Requested "
                  value={totalPayoutRequest || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Admin payout"
                  value={statsPayout?.paidPrice || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pending payout"
                  value={statsPayout?.unpaidPrice || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
            </Row>
          </div>
          <Divider />
          <div style={{ margin: '10px 0' }}>
            <Button
              type="primary"
              onClick={() => this.createPayoutRequest()}
            >
              Request a Payout
            </Button>
          </div>
          <div className="table-responsive">
            <PayoutRequestList
              payouts={items}
              searching={loading}
              total={pagination.total}
              onChange={this.handleTabChange.bind(this)}
              pageSize={pagination.pageSize}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default PerformerPayoutRequestPage;
