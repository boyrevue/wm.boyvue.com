import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { TableListSubscription } from '@components/subscription/user-table-list-subscription';
import { getResponseError } from '@lib/utils';
import { subscriptionService } from '@services/subscription.service';
import { Layout, message, PageHeader } from 'antd';
import Router from 'next/router';
import { useEffect, useState } from 'react';

function SubscriberPage() {
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('desc');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filter] = useState({});

  const getData = async () => {
    try {
      setLoading(true);
      const resp = await subscriptionService.search({
        ...filter,
        sortBy,
        sort,
        limit,
        offset: (page - 1) * limit
      });
      setSubscriptionList(resp.data.data);
      setTotal(resp.data.total);
    } catch (error) {
      message.error(
        getResponseError(error) || 'An error occured. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (data, _filter, sorter) => {
    setSortBy(sorter?.field || 'createdAt');
    setSort(sorter?.order === 'ascend' ? 'asc' : 'desc');
    setPage(data.current);
  };

  useEffect(() => {
    getData();
  }, [sort, sortBy, page]);

  return (
    <Layout>
      <PageTitle title="My Subscribers" />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="My Subscribers"
        />
        <div className="table-responsive">
          <TableListSubscription
            dataSource={subscriptionList}
            pagination={{
              total, pageSize: limit, current: page, showSizeChanger: false
            }}
            loading={loading}
            onChange={(data, _filter, sorter) => handleTabChange(data, _filter, sorter)}
            rowKey="_id"
          />
        </div>
      </div>
    </Layout>
  );
}

SubscriberPage.authenticate = true;

SubscriberPage.onlyPerformer = true;

export default SubscriberPage;
