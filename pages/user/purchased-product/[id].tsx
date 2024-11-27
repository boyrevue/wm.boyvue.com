/* eslint-disable no-unsafe-optional-chaining */
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { redirect404 } from '@lib/utils';
import {
  Button, Descriptions, Layout, PageHeader,
  Tag
} from 'antd';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import { IOrder } from 'src/interfaces';
import { orderService } from 'src/services';

const { Item } = Descriptions;

const productType = (type: string) => {
  switch (type) {
    case 'physical':
      return <Tag color="geekblue">Physical Product</Tag>;
    case 'digital':
      return <Tag color="cyan">Digital Product</Tag>;
    default:
      return <Tag color="#FFCF00">{type}</Tag>;
  }
};
const paymentGateway = (type: string) => {
  switch (type) {
    case 'ccbill':
      return <Tag color="gold">CCBill</Tag>;
    case 'verotel':
      return <Tag color="orange">Verotel</Tag>;
    case 'wallet':
      return <Tag color="cyan">Wallet</Tag>;
    default:
      return <Tag color="#FFCF00">{type}</Tag>;
  }
};
const paymentStatus = (status: string) => {
  switch (status) {
    case 'success':
      return <Tag color="green">Paid</Tag>;
    case 'failed':
      return <Tag color="red">Failed</Tag>;
    case 'pending':
      return <Tag color="gray">Pending</Tag>;
    default:
      return <Tag color="#FFCF00">{status}</Tag>;
  }
};

const deliveryStatus = (status: string) => {
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
};

export function OrderDetailPage({
  order
}: { order: IOrder }) {
  const downloadFile = async (r) => {
    const resp = await orderService.getDownloadLinkDigital(r.productId);
    window.open(resp.data.downloadLink, '_blank');
  };

  return (
    <Layout>
      <PageTitle title={`Order #${order?.orderNumber || ''}`} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={`Order ID: #${order?.orderNumber}`}
        />
        <Descriptions>
          <Item key="seller" label="Model">
            {order?.seller?.name || order?.seller?.username || 'N/A'}
          </Item>
          <Item key="name" label="Product">
            {order?.name || 'N/A'}
          </Item>
          <Item key="description" label="Description">
            {order?.description || 'N/A'}
          </Item>
          <Item key="productType" label="Product type">
            {productType(order?.productType)}
          </Item>
          <Item key="unitPrice" label="Unit price">
            {`$${order?.unitPrice}` || '0'}
          </Item>
          <Item key="quantiy" label="Quantity">
            {order?.quantity || '0'}
          </Item>
          <Item key="originalPrice" label="Original Price">
            {`$${order?.originalPrice}` || '0'}
          </Item>
          {order.couponInfo && (
          <Item key="discount" label="Discount">
            {`${(order?.couponInfo?.value || 0) * 100}%`}
            {' '}
            - $
            {(
              (order?.originalPrice || 0) * order?.couponInfo.value
            ).toFixed(2)}
          </Item>
          )}
          <Item key="totalPrice" label="Total Price">
            {order?.payBy === 'money' && '$'}
            {(order?.totalPrice || 0).toFixed(2)}
            {order?.payBy === 'token' && 'Tokens'}
          </Item>
          <Item key="paymentGateway" label="Payment Gateway">
            {paymentGateway(order?.paymentGateway)}
          </Item>
          <Item key="paymentStatus" label="Payment Status">
            {paymentStatus(order?.paymentStatus)}
          </Item>
        </Descriptions>
        {['physical'].includes(order?.productType) ? (
          <>
            <div style={{ marginBottom: '10px' }}>
              Delivery Address:
              {' '}
              {order?.deliveryAddress || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              Delivery Postal Code:
              {' '}
              {order?.postalCode || 'N/A'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              Delivery Phone Number:
              {' '}
              {order?.phoneNumber || 'N/A'}
            </div>
            <div
              style={{ marginBottom: '10px', textTransform: 'capitalize' }}
            >
              Shipping Code:
              {' '}
              <Tag color="magenta">{order?.shippingCode || 'N/A'}</Tag>
            </div>
            <div
              style={{ marginBottom: '10px', textTransform: 'capitalize' }}
            >
              Delivery Status:
              {' '}
              {deliveryStatus(order?.deliveryStatus)}
            </div>
          </>
        ) : (
          <div
            style={{ marginBottom: '10px', textTransform: 'capitalize' }}
          >
            Delivery Status:
            {' '}
            <Tag color="green">Delivered</Tag>
          </div>
        )}
        {order?.productType === 'digital' && (
        <div style={{ marginBottom: '10px' }}>
          Download Link:
          {' '}
          <a href="#" onClick={downloadFile.bind(this, order)}>
            Click to download
          </a>
        </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <Button danger onClick={() => Router.back()}>
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
}

OrderDetailPage.authenticate = true;

OrderDetailPage.getInitialProps = async (ctx) => {
  try {
    const { id } = ctx.query;
    if (!id) return redirect404(ctx);
    const { token = '' } = nextCookie(ctx);
    const resp = await orderService.findById(id, {
      Authorization: token
    });
    return {
      order: resp.data
    };
  } catch (e) {
    return redirect404(ctx);
  }
};

export default OrderDetailPage;
