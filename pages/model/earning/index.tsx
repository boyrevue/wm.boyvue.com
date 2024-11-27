import { ArrowLeftOutlined } from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import { TableListEarning } from '@components/performer/table-earning';
import { getResponseError } from '@lib/utils';
import {
  Col,
  Layout,
  message,
  PageHeader,
  Row,
  Statistic
} from 'antd';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { SearchFilter } from 'src/components/common/search-filter';
import { earningService } from 'src/services';

import style from './earning.module.less';

const CommissionCheckButton = dynamic(() => import('@components/performer/commission-check-button'), {
  ssr: false
});

function EarningPage() {
  const [loading, setLoading] = useState(false);
  const [earning, setEarning] = useState([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({} as any);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sort, setSort] = useState('desc');
  const [type, setType] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [payoutStatus, setPayoutStatus] = useState('');

  const getData = async () => {
    try {
      const resp = await earningService.performerSearch({
        limit,
        offset: (page - 1) * limit,
        sortBy: sortBy || 'createdAt',
        sort: sort || 'desc',
        type,
        fromDate: dateRange?.fromDate || '',
        toDate: dateRange?.toDate || '',
        payoutStatus
      });

      setEarning(resp.data.data);
      setTotal(resp.data.total);
    } catch (error) {
      message.error(getResponseError(error));
    } finally {
      setLoading(false);
    }
  };

  const getPerformerStats = async () => {
    const resp = await earningService.performerStarts({
      type: type || '',
      payoutStatus: payoutStatus || '',
      fromDate: dateRange?.fromDate || '',
      toDate: dateRange?.toDate || ''
    });
    setStats({ stats: resp?.data });
  };

  const handleFilter = async (data) => {
    setType(data.type || '');
    setPayoutStatus(data.payoutStatus || '');
    setDateRange({
      ...dateRange,
      fromDate: data.fromDate,
      toDate: data.toDate
    });
  };

  const handleTabChange = async (data, _filter, sorter) => {
    setPage(data.current);
    setSortBy(sorter?.field || 'createdAt');
    setSort(sorter?.order === 'ascend' ? 'asc' : 'desc');
  };

  useEffect(() => {
    getData();
  }, [sort, sortBy, type, payoutStatus, dateRange, page]);

  useEffect(() => {
    getPerformerStats();
  }, [sort, sortBy, type, payoutStatus, dateRange]);

  return (
    <Layout>
      <SeoMetaHead item={{
        title: 'Earning Report'
      }}
      />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="Earning Report"
        />
        <Row align="middle">
          <Col lg={16} xs={24} md={24}>
            <SearchFilter
              type={[
                { key: '', text: 'All transaction types' },
                { key: 'monthly_subscription', text: 'Monthly Subscription' },
                { key: 'yearly_subscription', text: 'Yearly Subscription' },
                { key: 'sale_video', text: 'PPV Purchase' },
                { key: 'physical', text: 'Physical Product' },
                { key: 'digital', text: 'Digital Product' },
                { key: 'stream_private', text: 'Private Show' },
                { key: 'tip', text: 'Tip' },
                { key: 'feed', text: 'Feed' }
              ]}
              onSubmit={(data) => handleFilter(data)}
              dateRange
              searchPayoutStatus
            />
          </Col>
          <Col lg={8} xs={24} md={24}>
            <CommissionCheckButton />
          </Col>
        </Row>
        <Row align="middle" className={style['statistic-earning']}>
          <Col span={12} sm={6}>
            <Statistic
              title="Total Gross Price"
              prefix="$"
              value={stats?.stats?.totalGrossPrice > 0 ? stats?.stats?.totalGrossPrice : 0}
              precision={2}
            />
          </Col>
          <Col span={12} sm={6}>
            <Statistic
              title="Admin earned"
              prefix="$"
              value={stats?.stats?.totalCommission || 0}
              precision={2}
            />
          </Col>
          <Col span={12} sm={6}>
            <Statistic
              title="You earned"
              prefix="$"
              value={stats?.stats?.totalNetPrice || 0}
              precision={2}
            />
          </Col>
          <Col span={12} sm={6}>
            <Statistic
              title="Unpaid Balance"
              prefix="$"
              // eslint-disable-next-line no-unsafe-optional-chaining
              value={(stats?.stats?.totalNetPrice - stats?.stats?.paidPrice) || 0}
              precision={2}
            />
          </Col>
        </Row>
        <div className="table-responsive">
          <TableListEarning
            loading={loading}
            dataSource={earning}
            rowKey="_id"
            pagination={{
              total, current: page, pageSize: limit, showSizeChanger: false
            }}
            onChange={(data, _filter, sorter) => handleTabChange(data, _filter, sorter)}
            scroll={{ x: true }}
          />
        </div>
      </div>
    </Layout>
  );
}

EarningPage.authenticate = true;

EarningPage.onlyPerformer = true;

export default EarningPage;
