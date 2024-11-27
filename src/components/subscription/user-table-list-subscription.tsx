import { formatDate } from '@lib/date';
import { Avatar, Table, Tag } from 'antd';
import moment from 'moment';
import React from 'react';
import { ISubscription } from 'src/interfaces';

type IProps = {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange: any;
  loading: boolean;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading
}: IProps) {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(data, records) {
        return (
          <span>
            <Avatar src={records?.userInfo?.avatar || '/no-avatar.png'} />
            {' '}
            {records?.userInfo?.name || records?.userInfo?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="#936dc9">Monthly Subscription</Tag>;
          case 'yearly':
            return <Tag color="#00dcff">Yearly Subscription</Tag>;
          case 'system':
            return <Tag color="#FFCF00">System</Tag>;
          default:
            return null;
        }
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'createdAt',
      render(data, records) {
        return <span>{records.createdAt ? formatDate(records.createdAt, 'LL') : 'N/A'}</span>;
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiredAt',
      render(date: Date, record: ISubscription) {
        return <span>{record.expiredAt && formatDate(date, 'LL')}</span>;
      }
    },
    {
      title: 'Renewal Date',
      dataIndex: 'nextRecurringDate',
      render(date: Date, record: ISubscription) {
        return <span>{record.status === 'active' && record.subscriptionId && moment().isBefore(record.expiredAt) && formatDate(date, 'LL')}</span>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string, record: ISubscription) {
        if (!moment().isBefore(record.expiredAt)) {
          return <Tag color="red">Suspended</Tag>;
        }
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'deactivated':
            return <Tag color="red">Inactive</Tag>;
          default: return <Tag color="red">Inactive</Tag>;
        }
      }
    },
    {
      title: 'Last update',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange}
        loading={loading}
        scroll={{ x: true }}
      />
    </div>
  );
}
