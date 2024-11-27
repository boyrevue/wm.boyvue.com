import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import PayoutRequestForm from '@components/payout-request/form';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import React from 'react';
import { connect } from 'react-redux';
import { payoutRequestService } from 'src/services';

interface Props {
  user: any;
}

class PayoutRequestCreatePage extends React.PureComponent<Props> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    submiting: false,
    statsPayout: {
      totalPrice: 0,
      paidPrice: 0,
      unpaidPrice: 0
    }
  };

  componentDidMount() {
    const { user } = this.props;
    if (!user.bankingInformation && !user.paypalSetting) {
      message.error('Please update your Banking account or Paypal account first.');
      Router.push('/model/account');
    } else {
      this.calculateStatsPayout();
    }
  }

  calculateStatsPayout = async () => {
    try {
      const resp = await payoutRequestService.stats();
      this.setState({ statsPayout: resp.data });
    } catch {
      message.error('Something went wrong, please try again later');
    }
  };

  async submit(data: {
    request: number;
    requestNote: string;
  }) {
    try {
      const { totalPrice } = this.state.statsPayout;
      if (!totalPrice) {
        message.error('There is no balance for this request!');
        return;
      }

      await this.setState({ submiting: true });
      const body = { ...data };
      await payoutRequestService.create(body);
      message.success('Requested a payout');
      Router.push('/model/payout-request');
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting, statsPayout } = this.state;
    const { user } = this.props;
    return (
      <Layout>
        <PageTitle title="New Request Payout" />
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="New Request Payout"
          />
          <PayoutRequestForm
            statsPayout={statsPayout}
            submit={this.submit.bind(this)}
            submiting={submiting}
            performer={user as any}
          />
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user.current
});

export default connect(mapStateToProps)(PayoutRequestCreatePage);
