import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import {
  PerformerBankingForm,
  PerformerPaypalForm
} from '@components/performer';
import { getResponseError } from '@lib/utils';
import {
  performerService, utilsService
} from '@services/index';
import {
  Layout, message, PageHeader,
  Tabs
} from 'antd';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IBanking, IPerformer
} from 'src/interfaces';
import {
  updateCurrentUserAvatar, updateCurrentUserCover,
  updatePerformer
} from 'src/redux/user/actions';

type IProps = {
  currentUser: IPerformer;
  countries: any;
}

class AccountSettings extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps() {
    const [countries] = await Promise.all([
      utilsService.countriesList()
    ]);
    return {
      countries: countries?.data || []
    };
  }

  state = {
    submiting: false
  };

  async handleUpdateBanking(data: IBanking) {
    try {
      this.setState({ submiting: true });
      const { currentUser } = this.props;
      const info = { ...data, performerId: currentUser._id };
      await performerService.updateBanking(currentUser._id, info);
      this.setState({ submiting: false });
      message.success('Banking account was updated successfully!');
    } catch (error) {
      this.setState({ submiting: false });
      message.error(getResponseError(await error) || 'An error orccurred, please try again.');
    }
  }

  async handleUpdatePaypal(data) {
    const { currentUser } = this.props;
    try {
      this.setState({ submiting: false });
      const payload = { key: 'paypal', value: data, performerId: currentUser._id };
      await performerService.updatePaymentGateway(currentUser._id, payload);
      message.success('Paypal account was updated successfully!');
      this.setState({ submiting: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      currentUser, countries
    } = this.props;
    const { submiting } = this.state;
    return (
      <Layout>
        <PageTitle title="Banking (to earn)" />
        <div className="main-container user-account">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Banking (to earn)"
          />
          <Tabs
            defaultActiveKey="basic"
            tabPosition="top"
            className="nav-tabs"
          >
            <Tabs.TabPane
              tab={(
                <span>
                  <img src="/banking-ico.png" alt="banking" height="25px" />
                </span>
              )}
              key="bankInfo"
            >
              <PerformerBankingForm
                onFinish={this.handleUpdateBanking.bind(this)}
                updating={submiting}
                user={currentUser}
                countries={countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={(
                <span>
                  <img src="/paypal-ico.png" alt="paypal" height="25px" />
                </span>
              )}
              key="paypalInfo"
            >
              <PerformerPaypalForm
                onFinish={this.handleUpdatePaypal.bind(this)}
                updating={submiting}
                user={currentUser}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover
};
export default connect(mapStates, mapDispatch)(AccountSettings);
