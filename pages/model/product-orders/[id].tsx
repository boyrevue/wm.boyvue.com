/* eslint-disable no-unsafe-optional-chaining */
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { getResponseError } from '@lib/utils';
import {
  Alert,
  Button,
  Descriptions,
  Input,
  Layout,
  message,
  PageHeader,
  Select,
  Tag
} from 'antd';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IOrder } from 'src/interfaces';
import { orderService } from 'src/services';

const { Item } = Descriptions;
type IProps = {
  id: string;
}

interface IStates {
  submitting: boolean;
  order: IOrder;
  shippingCode: string;
  deliveryStatus: string;
}

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

const paymentStatus = (status: string) => {
  switch (status) {
    case 'success':
      return <Tag color="green">Success</Tag>;
    case 'cancelled':
      return <Tag color="red">Cancelled</Tag>;
    case 'chargeback':
      return <Tag color="gray">Chargeback</Tag>;
    default:
      return <Tag color="#FFCF00">{status}</Tag>;
  }
};

class OrderDetailPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      submitting: false,
      order: null,
      shippingCode: '',
      deliveryStatus: ''
    };
  }

  componentDidMount() {
    this.getData();
  }

  async onUpdate() {
    const { deliveryStatus, shippingCode } = this.state;
    const { id } = this.props;
    if (!shippingCode) {
      message.error('Missing shipping code');
      return;
    }
    try {
      this.setState({ submitting: true });
      await orderService.update(id, { deliveryStatus, shippingCode });
      message.success('Changes saved.');
      Router.back();
    } catch (e) {
      message.error(getResponseError(e));
    } finally {
      await this.setState({ submitting: false });
    }
  }

  async getData() {
    try {
      const { id } = this.props;
      const order = await orderService.findById(id);
      await this.setState({
        order: order.data,
        shippingCode: order.data.shippingCode,
        deliveryStatus: order.data.deliveryStatus
      });
    } catch (e) {
      message.error('cannot find order!');
      Router.back();
    }
  }

  render() {
    const { order, submitting } = this.state;
    return (
      <Layout>
        <PageTitle title={`Order #${order?.orderNumber}`} />
        <div className="main-container">
          {order && (
            <div className="main-container">
              <PageHeader
                onBack={() => Router.back()}
                backIcon={<ArrowLeftOutlined />}
                title={`Order ID: ${order?.orderNumber}`}
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
                  {productType(order.productType)}
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
                    {order?.couponInfo?.value * (order?.originalPrice || 0)
                      || ''}
                  </Item>
                )}
                <Item key="totalPrice" label="Total Price">
                  {order?.payBy === 'money' && '$'}
                  {(order?.totalPrice || 0).toFixed(2)}
                  {order?.payBy === 'token' && 'Tokens'}
                </Item>
                {order?.status && (
                  <Item key="status" label="Payment Status">
                    {paymentStatus(order?.paymentStatus)}
                  </Item>
                )}

                {order.productType === 'physical' && (
                  <>
                    <Item key="phoneNumber" label="Phone number">
                      {order.phoneNumber}
                    </Item>
                    <Item key="postalCode" label="Postal code">
                      {order.postalCode}
                    </Item>
                  </>
                )}
              </Descriptions>
              {['physical'].includes(order?.productType) ? (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    Delivery Address:
                    {' '}
                    {order.deliveryAddress || 'N/A'}
                  </div>
                  <Alert
                    type="warning"
                    message="Update shipping code & delivery status below!"
                  />
                  <div style={{ marginBottom: '10px' }}>
                    Shipping Code:
                    <Input
                      placeholder="Enter shipping code here"
                      defaultValue={order.shippingCode}
                      onChange={(e) => this.setState({ shippingCode: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    Delivery Status:
                    {' '}
                    <Select
                      onChange={(e) => {
                        if (order.productType !== 'physical') return;
                        this.setState({ deliveryStatus: e });
                      }}
                      defaultValue={order.deliveryStatus}
                      disabled={submitting}
                      style={{ minWidth: '120px' }}
                    >
                      <Select.Option key="created" value="created">
                        Created
                      </Select.Option>
                      <Select.Option key="processing" value="processing">
                        Processing
                      </Select.Option>
                      <Select.Option key="shipped" value="shipped">
                        Shipped
                      </Select.Option>
                      <Select.Option key="delivered" value="delivered">
                        Delivered
                      </Select.Option>
                      <Select.Option key="cancelled" value="cancelled">
                        Cancelled
                      </Select.Option>
                    </Select>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <Button
                      danger
                      onClick={this.onUpdate.bind(this)}
                      disabled={submitting}
                    >
                      Update
                    </Button>
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '10px' }}>
                  Delivery Status:
                  {' '}
                  <Tag color="green">Delivered</Tag>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default OrderDetailPage;
