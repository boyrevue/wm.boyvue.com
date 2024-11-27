import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import { TableProps } from 'antd/lib/table';
import { IEarning } from 'src/interfaces';

interface IProps extends TableProps<IEarning> {}

export function TableListEarning({
  dataSource, rowKey, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId'
    },
    {
      title: 'Transaction Date',
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date, 'DD/MM/YYYY HH:mm')}</span>;
      }
    },
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(userInfo) {
        return (
          <span>
            {userInfo?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Transaction Type',
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'monthly_subscription':
            return <Tag color="red">Monthly Subscription</Tag>;
          case 'yearly_subscription':
            return <Tag color="red">Yearly Subscription</Tag>;
          case 'sale_video':
            return <Tag color="#FFCF00">PPV Purchase</Tag>;
          case 'digital':
            return <Tag color="blue">Digital Product</Tag>;
          case 'physical':
            return <Tag color="blue">Physical Product</Tag>;
          case 'stream_private':
            return <Tag color="yellow">Private Show</Tag>;
          case 'tip':
            return <Tag color="magenta">Tip</Tag>;
          case 'feed':
            return <Tag color="magenta">Feed</Tag>;
          default:
            return <Tag color="#936dc9">{type}</Tag>;
        }
      }
    },
    {
      title: 'Gross Price',
      key: 'grossPrice',
      dataIndex: 'grossPrice',
      render: (grossPrice: number) => (grossPrice ? grossPrice.toFixed(2) : ''),
      sorter: true
    },
    {
      title: 'Admin Commission',
      dataIndex: 'commission',
      render(commission: number) {
        return (
          <span>
            {commission * 100}
            %
          </span>
        );
      }
    },
    {
      title: 'Net Price',
      key: 'netPrice',
      dataIndex: 'netPrice',
      render: (netPrice: number) => (netPrice ? netPrice.toFixed(2) : ''),
      sorter: true
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      render(paymentMethod: string) {
        switch (paymentMethod) {
          case 'ccbill':
            return <Tag color="gold">CCBill</Tag>;
          case 'verotel':
            return <Tag color="orange">Verotel</Tag>;
          case 'wallet':
            return <Tag color="cyan">Wallet</Tag>;
          default:
            return <Tag color="#FFCF00">{paymentMethod}</Tag>;
        }
      }
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      render(paymentStatus: string) {
        switch (paymentStatus) {
          case 'paid': case 'success':
            return <Tag color="success">Success</Tag>;
          case 'pending': case 'created':
            return <Tag color="warning">Created</Tag>;
          case 'cancelled':
            return <Tag color="danger">Cancelled</Tag>;
          case 'chargeback':
            return <Tag color="danger">Chargeback</Tag>;
          default:
            return <Tag color="#FFCF00">{paymentStatus}</Tag>;
        }
      }
    },
    {
      title: 'Payout Status',
      dataIndex: 'payoutStatus',
      render(payoutStatus: string) {
        switch (payoutStatus) {
          case 'done':
            return <Tag color="green" style={{ textTransform: 'capitalize' }}>Paid</Tag>;
          case 'pending':
            return <Tag color="orange" style={{ textTransform: 'capitalize' }}>Unpaid</Tag>;
          case 'rejected':
            return <Tag color="red" style={{ textTransform: 'capitalize' }}>Rejected</Tag>;
          default:
            return <Tag color="#FFCF00">{payoutStatus}</Tag>;
        }
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        // loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        pagination={pagination}
        onChange={onChange.bind(this)}
        scroll={{ x: true }}
      />
    </div>
  );
}

export default TableListEarning;
