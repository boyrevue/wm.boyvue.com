import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import {
  PerformerAccountForm,
  PerformerBankingForm, PerformerPaypalForm,
  PerformerSubscriptionForm, PerformerVerificationForm
} from '@components/performer';
import ChatPriceForm from '@components/performer/chat-price-form';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { getResponseError } from '@lib/utils';
import {
  authService, performerService, settingService, userService,
  utilsService
} from '@services/index';
import {
  Layout, message, PageHeader, Tabs
} from 'antd';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IPerformer
} from 'src/interfaces';
import {
  updateCurrentUser,
  updateCurrentUserAvatar, updateCurrentUserCover, updatePerformer
} from 'src/redux/user/actions';

type IProps = {
  currentUser: IPerformer;
  updatePerformer: Function;
  updating: boolean;
  updateCurrentUserAvatar: Function;
  updateCurrentUserCover: Function;
  updateCurrentUser: Function;
  phoneCodes: any;
  languages: any;
  countries: any;
  error: any;
  updateSuccess: any;
  bodyInfo: any;
}

class AccountSettings extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps() {
    const [countries, phoneCodes, languages, bodyInfo] = await Promise.all([
      utilsService.countriesList(),
      utilsService.phoneCodesList(),
      utilsService.languagesList(),
      utilsService.bodyInfo()
    ]);
    return {
      countries: countries?.data || [],
      phoneCodes: phoneCodes?.data || [],
      languages: languages?.data || [],
      bodyInfo: bodyInfo?.data
    };
  }

  state = {
    submiting: false,
    ondatoVerifying: false,
    ondatoEnabled: false
  };

  componentDidMount() {
    const { currentUser } = this.props;
    if (!currentUser || (currentUser && !currentUser.isPerformer)) {
      message.error('You have no permission on this page!');
      Router.push('/');
    }
    this.getSettings();
    this.loadProfile();
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    const { error, updateSuccess } = this.props;
    if (error && error !== prevProps.error) {
      message.error(getResponseError(error));
    }

    if (updateSuccess && updateSuccess !== prevProps.updateSuccess) {
      message.success('Changes saved.');
    }
  }

  onCoverUploaded(data: any) {
    const {
      updateCurrentUserCover: updateCurrentUserCoverHandler
    } = this.props;
    message.success('Changes saved.');
    updateCurrentUserCoverHandler(data.response.data.url);
  }

  onAvatarUploaded = (data: any) => {
    const {
      updateCurrentUserAvatar: updateCurrentUserAvatarHandler
    } = this.props;
    message.success('Changes saved.');
    updateCurrentUserAvatarHandler(data.response.data.url);
  };

  handleUpdateBanking = async (data) => {
    try {
      this.setState({ submiting: true });
      const { currentUser } = this.props;
      const info = { ...data, performerId: currentUser._id };
      await performerService.updateBanking(currentUser._id, info);
      this.setState({ submiting: false });
      message.success('Banking account was updated successfully!');
      this.loadProfile();
    } catch (error) {
      this.setState({ submiting: false });
      const err = await error;
      message.error(err?.message || 'An error orccurred, please try again.');
    }
  };

  handleUpdatePaypal = async (data) => {
    const { currentUser } = this.props;
    try {
      this.setState({ submiting: false });
      const payload = { key: 'paypal', value: data, performerId: currentUser._id };
      await performerService.updatePaypal(currentUser._id, payload);
      message.success('Paypal account was updated successfully!');
      this.setState({ submiting: false });
      this.loadProfile();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      this.setState({ submiting: false });
    }
  };

  async ondatoGenerateIDV() {
    const { currentUser } = this.props;
    try {
      await this.setState({ ondatoVerifying: true });
      const body = {
        registration: {
          email: currentUser?.email
        },
        externalReferenceId: currentUser._id
      };
      const resp = await authService.ondatoCreation(body);
      if (resp?.data?.url) {
        Router.push(resp.data.url);
      } else message.error('An error occured, please try again later');
    } catch (e) {
      // const error = await e;
      // message.error(error?.message || 'An error occured, please try again later');
    } finally {
      this.setState({ ondatoVerifying: false });
    }
  }

  async getSettings() {
    const resp = await settingService.valueByKeys(['ondatoEnabled']);
    this.setState({ ondatoEnabled: resp.ondatoEnabled });
  }

  submit = async (data: any) => {
    try {
      const {
        currentUser, updatePerformer: updatePerformerHandler
      } = this.props;
      const { ondatoEnabled } = this.state;
      if (!currentUser?.verifiedDocument && ondatoEnabled) {
        this.ondatoGenerateIDV();
      }
      updatePerformerHandler({
        ...currentUser,
        ...data
      });
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(err?.message || 'Something went wrong, please try again.');
    }
  };

  updatePassword = async (data: any) => {
    try {
      this.setState({ submiting: true });
      await authService.updatePassword(data.password, 'performer');
      message.success('Changes saved.');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ submiting: false });
    }
  };

  loadProfile = async () => {
    const user = await userService.me();
    const { updateCurrentUser: updateCurrentUserHandler } = this.props;
    updateCurrentUserHandler(user.data);
  };

  render() {
    const {
      currentUser, updating, phoneCodes, languages, bodyInfo, countries
    } = this.props;
    const { submiting, ondatoVerifying } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <PageTitle title="Edit profile" />
        <div className="main-container user-account">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Edit Profile"
          />
          <Tabs defaultActiveKey="basic" tabPosition="top" className="nav-tabs">
            <Tabs.TabPane tab={<span>Profile</span>} key="basic">
              <PerformerAccountForm
                onFinish={this.submit.bind(this)}
                user={currentUser}
                updating={updating || ondatoVerifying}
                options={{
                  uploadHeaders,
                  avatarUploadUrl: performerService.getAvatarUploadUrl(),
                  onAvatarUploaded: this.onAvatarUploaded.bind(this),
                  coverUploadUrl: performerService.getCoverUploadUrl(),
                  onCoverUploaded: this.onCoverUploaded.bind(this),
                  videoUploadUrl: performerService.getVideoUploadUrl()
                }}
                countries={countries}
                phoneCodes={phoneCodes}
                languages={languages}
                bodyInfo={bodyInfo}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>ID Documents</span>} key="verification">
              <PerformerVerificationForm
                onFinish={this.submit.bind(this)}
                updating={updating}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Stream setting" key="stream-setting">
              <ChatPriceForm
                updating={updating}
                onFinish={this.submit.bind(this)}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Subscriptions</span>} key="subscription">
              <PerformerSubscriptionForm
                onFinish={this.submit.bind(this)}
                updating={updating}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Banking</span>} key="banking">
              <PerformerBankingForm
                onFinish={this.handleUpdateBanking.bind(this)}
                updating={submiting}
                user={currentUser}
                countries={countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Paypal</span>} key="paypal">
              <PerformerPaypalForm
                onFinish={this.handleUpdatePaypal.bind(this)}
                updating={submiting}
                user={currentUser}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Password</span>} key="password">
              <UpdatePaswordForm
                onFinish={this.updatePassword.bind(this)}
                updating={submiting}
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
  updating: state.user.updating,
  error: state.user.error,
  ...state.user
});
const mapDispatch = {
  updatePerformer,
  updateCurrentUserAvatar,
  updateCurrentUserCover,
  updateCurrentUser
};
export default connect(mapStates, mapDispatch)(AccountSettings);
