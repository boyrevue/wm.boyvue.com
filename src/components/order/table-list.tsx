import { EyeOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import Link from 'next/link';
import { IOrder, IUser } from 'src/interfaces';

type IProps = {
  dataSource: IOrder[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
  user: IUser;
}

function OrderTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange,
  user
}: IProps) {
  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {orderNumber || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'sale_video':
            return <Tag color="green">VOD</Tag>;
          case 'digital':
            return <Tag color="red">Digital Product</Tag>;
          case 'physical':
            return <Tag color="red">Physical Product</Tag>;
          case 'monthly_subscription':
            return <Tag color="blue">Monthly Subscription</Tag>;
          case 'yearly_subscription':
            return <Tag color="blue">Yearly Subscription</Tag>;
          case 'feed':
            return <Tag color="pink">Post Feed</Tag>;
          default: return <Tag color="#FFCF00">{type}</Tag>;
        }
      }
    },
    {
      title: 'Total Price',
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
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'refunded':
            return <Tag color="red">Refunded</Tag>;
          case 'created':
            return <Tag color="gray">Created</Tag>;
          case 'paid':
            return <Tag color="blue">Paid</Tag>;
          default: return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    // {
    //   title: 'Delivery Status',
    //   dataIndex: 'deliveryStatus',
    //   render(status: string) {
    //     switch (status) {
    //       case 'created':
    //         return <Tag color="gray">Created</Tag>;
    //       case 'processing':
    //         return <Tag color="#FFCF00">Processing</Tag>;
    //       case 'shipping':
    //         return <Tag color="#00dcff">Shipping</Tag>;
    //       case 'delivered':
    //         return <Tag color="#00c12c">Delivered</Tag>;
    //       case 'refunded':
    //         return <Tag color="red">Refunded</Tag>;
    //       default: return <Tag color="#FFCF00">{status}</Tag>;
    //     }
    //   }
    // },
    {
      title: 'Updated at',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: '#',
      dataIndex: '_id',
      sorter: true,
      render(id: string) {
        return (
          // eslint-disable-next-line react/prop-types
          <Link href={{ pathname: user.isPerformer ? '/model/my-order/[id]' : '/user/orders/[id]', query: { id } }}>
            <a>
              <EyeOutlined />
            </a>
          </Link>
        );
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

export default OrderTableList;
