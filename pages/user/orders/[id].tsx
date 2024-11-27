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
    default: return <Tag color="#FFCF00">{type}</Tag>;
  }
};

function OrderDetailPage({
  order
}: { order: IOrder }) {
  const downloadFile = async (r) => {
    const resp = await orderService.getDownloadLinkDigital(r.productId);
    window.open(resp.data.downloadLink, '_blank');
  };

  return (
    <Layout>
      <PageTitle title={`Order #${order?.orderNumber || ''}`} />
      {order && (
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
            {((order?.originalPrice || 0) * order?.couponInfo.value).toFixed(2)}
          </Item>
          )}
          <Item key="totalPrice" label="Total Price">
            {order?.payBy === 'money' && '$'}
            {(order?.totalPrice || 0).toFixed(2)}
            {order?.payBy === 'token' && 'Tokens'}
          </Item>
          <Item key="gateway" label="Payment Gateway">
            <Tag color="blue">{order?.paymentGateway}</Tag>
          </Item>
          <Item key="status" label="Status">
            <Tag color="red">{order?.status}</Tag>
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
            <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
              Shipping Code:
              {' '}
              <Tag color="blue">{order?.shippingCode || 'N/A'}</Tag>
            </div>
            <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
              Delivery Status:
              {' '}
              <Tag color="magenta">{order?.deliveryStatus || 'N/A'}</Tag>
            </div>
          </>
        ) : (
          <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
            Delivery Status:
            {' '}
            <Tag color="green">Delivered</Tag>
          </div>
        )}
        {order?.productType === 'digital' && (
        <div style={{ marginBottom: '10px' }}>
          Download Link:
          {' '}
          <a href="#" onClick={downloadFile.bind(this, order)}>Click to download</a>
        </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <Button danger onClick={() => Router.back()}>
            Back
          </Button>
        </div>
      </div>
      )}
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
