import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { PerformerBlockCountriesForm } from '@components/performer';
import { SelectUserDropdown } from '@components/user';
import UsersBlockList from '@components/user/users-block-list';
import {
  Button, Form, Input, Layout, message, Modal, PageHeader, Tabs
} from 'antd';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ICountry, IPerformer } from 'src/interfaces';
import { blockService, utilsService } from 'src/services';

import style from './blacklist.module.less';

type IProps = {
  countries: ICountry[];
  user: IPerformer;
}

function BlacklistPage({ countries, user }: IProps) {
  const [loading, setLoading] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const limit = 10;
  const [blockUserId, setBlockUserId] = useState('');
  const [userBlockedList, setUserBlockedList] = useState([]);
  const [totalBlockedUsers, setTotalBlockedUsers] = useState(0);
  const [openBlockModal, setOpenBlockModal] = useState(false);
  const [pagination, setPagination] = useState({} as any);

  const handleUnblockUser = async (userId: string) => {
    if (!window.confirm('Are you sure to unblock this user')) return;
    try {
      await setSubmiting(true);
      await blockService.unBlockUser(userId);
      setUserBlockedList(userBlockedList.filter((u) => u.targetId !== userId));
      setSubmiting(false);
      message.success('Unblocked user successfully');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occured. Please try again later');
      setSubmiting(false);
    }
  };

  const handleUpdateBlockCountries = async (data) => {
    try {
      await setSubmiting(true);
      await blockService.blockCountries(data);
      message.success('Blocked countries were updated successfully!');
      setSubmiting(false);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try againl later');
      setSubmiting(false);
    }
  };

  const getBlockList = async (page = 1) => {
    try {
      await setLoading(true);
      const kq = await blockService.getBlockListUsers({
        limit,
        offset: (page - 1) * limit
      });
      setUserBlockedList(kq.data.data);
      setTotalBlockedUsers(kq.data.total);
      setPagination({
        ...pagination,
        total: kq.data.total,
        pageSize: limit
      });
      setLoading(false);
    } catch (e) {
      message.error('An error occured, please try again later');
      setLoading(false);
    }
  };

  const handlePageChange = (data) => {
    setPagination(data.current);
    getBlockList(data.current);
  };

  useEffect(() => {
    getBlockList();
  }, []);

  const blockUser = async (data) => {
    if (!blockUserId) {
      message.error('Please select a user');
      return;
    }
    try {
      await setSubmiting(true);
      await blockService.blockUser({ targetId: blockUserId, target: 'user', reason: data.reason });
      await setSubmiting(false);
      await setOpenBlockModal(false);
      message.success('Blocked user successfully');
      window.location.reload();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occured, please try again later');
      setSubmiting(false);
      setOpenBlockModal(false);
    }
  };

  const blockedIds = userBlockedList.map((u) => u.targetId);

  return (
    <Layout>
      <PageTitle title="Blacklist" />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="Blacklist"
        />
        <Tabs>
          <Tabs.TabPane key="block-user" tab={<span>Blacklist Users</span>}>
            <div className={style['block-user']}>
              <Button className="" type="primary" onClick={() => setOpenBlockModal(true)}>
                Block user
              </Button>
            </div>
            <div className="users-blocked-list">
              <div className="table-responsive">
                <UsersBlockList
                  items={userBlockedList}
                  searching={loading}
                  total={totalBlockedUsers}
                  onPaginationChange={(data) => handlePageChange(data)}
                  pageSize={limit}
                  submiting={submiting}
                  unblockUser={(userId) => handleUnblockUser(userId)}
                />
              </div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="block-countries" tab={<span>Blacklist Countries</span>}>
            <PerformerBlockCountriesForm
              onFinish={(data) => handleUpdateBlockCountries(data)}
              updating={submiting}
              blockCountries={user.blockCountries}
              countries={countries}
            />
          </Tabs.TabPane>
        </Tabs>

      </div>
      <Modal
        className="modal-custom"
        title="Block user"
        visible={openBlockModal}
        onCancel={() => setOpenBlockModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          name="blockForm"
          onFinish={(data) => blockUser(data)}
          initialValues={{
            reason: 'Disturbing'
          }}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          className="account-form"
        >
          <div className="modal-body-custom">
            <Form.Item label="Please select user you want to block">
              <SelectUserDropdown onSelect={(val) => setBlockUserId(val)} selectedIds={blockedIds} />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Tell us your reason' }]}
            >
              <Input.TextArea maxLength={150} showCount />
            </Form.Item>
          </div>
          <div className="modal-button-custom">
            <Button
              className="primary"
              htmlType="submit"
              loading={submiting}
              disabled={submiting}
            >
              Submit
            </Button>
            <Button
              className="secondary"
              onClick={() => setOpenBlockModal(false)}
            >
              Close
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
}

BlacklistPage.onlyPerformer = true;

BlacklistPage.authenticate = true;

BlacklistPage.getInitialProps = async () => {
  const [countries] = await Promise.all([
    utilsService.countriesList()
  ]);
  return {
    countries: countries?.data || []
  };
};

const mapStates = (state) => ({
  user: state.user.current
});

export default connect(mapStates)(BlacklistPage);
