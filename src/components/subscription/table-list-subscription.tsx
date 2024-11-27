import { formatDate } from '@lib/date';
import {
  Avatar,
  Button, Table, Tag
} from 'antd';
import moment from 'moment';
import Link from 'next/link';
import React from 'react';
import { ISubscription } from 'src/interfaces';

type IProps = {
  dataSource: ISubscription[];
  pagination: any;
  rowKey: string;
  onChange(): any;
  loading: boolean;
  cancelSubscription: Function;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  cancelSubscription
}: IProps) {
  const columns = [
    {
      title: 'Model',
      dataIndex: 'performerInfo',
      render(data, records) {
        return (
          <Link
            href={{
              pathname: '/model/[username]',
              query: { username: records?.performerInfo?.username || records?.performerInfo?._id }
            }}
            as={`/${records?.performerInfo?.username || records?.performerInfo?._id}`}
          >
            <a>
              <Avatar src={records?.performerInfo?.avatar || '/no-avatar.png'} />
              {' '}
              {records?.performerInfo?.username || records?.performerInfo?.name || 'N/A'}
            </a>
          </Link>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'monthly':
            return <Tag color="orange">Monthly Subscription</Tag>;
          case 'yearly':
            return <Tag color="orange">Yearly Subscription</Tag>;
          case 'system':
            return <Tag color="orange">System</Tag>;
          default:
            return <Tag color="orange">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'createdAt',
      render(data, records) {
        return <span>{records?.status === 'active' ? formatDate(records.createdAt, 'LL') : 'N/A'}</span>;
      }
    },
    {
      title: 'Renewal Date',
      dataIndex: 'expiredAt',
      render(date: Date, record: ISubscription) {
        return <span>{record.status === 'active' && record.paymentGateway === 'emerchant' ? formatDate(record.nextRecurringDate, 'LL') : record.subscriptionId && moment().isBefore(record.expiredAt) && formatDate(date, 'LL')}</span>;
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiredAt',
      sorter: true,
      render(date: Date, record: ISubscription) {
        return <span>{(record.status !== 'active' || record.subscriptionType === 'system') && record.paymentGateway === 'emerchant' ? formatDate(date, 'LL') : formatDate(date, 'LL')}</span>;
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
    },
    {
      title: 'Actions',
      render(record) {
        return record.status === 'active' && moment().isBefore(moment(record.expiredAt)) && (
          <Button danger onClick={() => cancelSubscription(record)}>
            Cancel subscription
          </Button>
        );
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
