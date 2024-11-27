import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import React from 'react';
import { ITransaction } from 'src/interfaces';

type IProps = {
  dataSource: ITransaction[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
}

function PaymentTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange
}: IProps) {
  // const getProductType = (data) => {
  //   if (!data.details?.length) return 'Product';
  //   const { productType } = data.details[0];
  //   return productType === 'physical' ? 'Physical Product' : 'Digital Product';
  // };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {orderNumber}
          </span>
        );
      }
    },
    {
      title: 'Transaction Date',
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Model Name',
      dataIndex: 'seller',
      key: 'seller',
      render(seller) {
        if (!seller) {
          return null;
        }

        const { name, username } = seller;
        return (
          <span>
            {name || username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Transaction Type',
      dataIndex: 'productType',
      key: 'productType',
      render(type: string) {
        switch (type) {
          case 'free_subscription': return <Tag color="blue">Free Subscription</Tag>;
          case 'monthly_subscription': return <Tag color="blue">Monthly Subscription</Tag>;
          case 'yearly_subscription': return <Tag color="blue">Yearly Subscription</Tag>;
          case 'feed': return <Tag color="red">Feed</Tag>;
          case 'tip': return <Tag color="orange">Tip</Tag>;
          case 'physical': return <Tag color="green">Physical Product</Tag>;
          case 'digital': return <Tag color="green">Digital Product</Tag>;
          case 'performer_product': return <Tag color="green">Product</Tag>;
          case 'wallet': return <Tag color="magenta">Wallet Top-up</Tag>;
          case 'stream_private': return <Tag color="gold">Private Show</Tag>;
          case 'sale_video': return <Tag color="red">PPV Purchase</Tag>;
          default: return <Tag>{type}</Tag>;
        }
      }
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      render(totalPrice) {
        return (
          <span>
            $
            {(totalPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentGateway',
      render(paymentGateway: string) {
        switch (paymentGateway) {
          case 'ccbill':
            return <Tag color="blue">CCBill</Tag>;
          case 'verotel':
            return <Tag color="pink">Verotel</Tag>;
          case 'wallet':
            return <Tag color="gold">Wallet</Tag>;
          case 'emerchant':
            return <Tag color="green">Emerchant</Tag>;
          default: return <Tag color="#FFCF00">{paymentGateway || 'CCBill'}</Tag>;
        }
      }
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'paid': case 'success':
            return <Tag color="success">Success</Tag>;
          case 'pending': case 'created':
            return <Tag color="warning">Created</Tag>;
          case 'cancelled':
            return <Tag color="danger">Cancelled</Tag>;
          case 'chargeback':
            return <Tag color="danger">Chargeback</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
        scroll={{ x: true }}
      />
    </div>
  );
}
export default PaymentTableList;
