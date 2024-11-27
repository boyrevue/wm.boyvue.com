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

function ProductTableList({
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
      sorter: true,
      render(orderNumber) {
        return (
          <span style={{ whiteSpace: 'nowrap' }}>{orderNumber || 'N/A'}</span>
        );
      }
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'productName',
      render(name) {
        return <span style={{ whiteSpace: 'nowrap' }}>{name || 'N/A'}</span>;
      }
    },
    {
      title: user.isPerformer ? 'User Name' : 'Model Name',
      key: 'modelName',
      render(record) {
        if (user.isPerformer) {
          return (
            <span style={{ whiteSpace: 'nowrap' }}>
              {record.buyer?.name || record.buyer?.username || 'N/A'}
            </span>
          );
        }
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {record.seller?.name || record.seller?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Product Type',
      dataIndex: 'productType',
      render(productType: string) {
        switch (productType) {
          case 'physical':
            return <Tag color="geekblue">Physical Product</Tag>;
          case 'digital':
            return <Tag color="cyan">Digital Product</Tag>;
          default:
            return <Tag color="#FFCF00">{productType}</Tag>;
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
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
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
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentGateway',
      render(status: string) {
        switch (status) {
          case 'ccbill':
            return <Tag color="gold">CCBill</Tag>;
          case 'verotel':
            return <Tag color="orange">Verotel</Tag>;
          case 'wallet':
            return <Tag color="cyan">Wallet</Tag>;
          default:
            return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: 'Delivery Status',
      dataIndex: 'deliveryStatus',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="magenta">Created</Tag>;
          case 'processing':
            return <Tag color="blue">Processing</Tag>;
          case 'cancelled':
            return <Tag color="red">Cancelled</Tag>;
          case 'shipped':
            return <Tag color="cyan">Shipped</Tag>;
          case 'delivered':
            return <Tag color="green">Delivered</Tag>;
          default:
            return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: 'Shipping Code',
      dataIndex: 'shippingCode',
      render(shippingCode: string) {
        return <span>{shippingCode || 'N/A'}</span>;
      }
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
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
      dataIndex: '_id',
      render(id: string) {
        return (
          <Link
            href={{
              pathname: user.isPerformer
                ? '/model/product-orders/[id]'
                : '/user/purchased-product/[id]',
              query: { id }
            }}
          >
            <a>{user.isPerformer ? 'Update Status' : 'Check Status'}</a>
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

export default ProductTableList;
