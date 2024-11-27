import {
  CodeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  TagOutlined
} from '@ant-design/icons';
import {
  Button, Col, Divider,
  Form, Input, message,
  Radio, Row, Space
} from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICoupon, IProduct, ISettings, IUser
} from 'src/interfaces/index';

import style from './form-checkout.module.less';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  settings: ISettings;
  onFinish: Function;
  submiting: boolean;
  products: IProduct[];
  coupon: ICoupon;
  isApplyCoupon: boolean;
  onApplyCoupon: Function;
  user: IUser;
}

const calTotal = (items, couponValue: number = 0) => {
  let total = 0;
  items?.length
    && items.forEach((item) => {
      total += (item.quantity || 1) * item.price;
    });
  if (couponValue) {
    total -= total * couponValue;
  }
  return total.toFixed(2) || 0;
};

class CheckOutForm extends PureComponent<IProps> {
  state = {
    gateway: 'emerchant',
    couponCode: ''
  };

  componentDidUpdate(prevProps: Readonly<IProps>) {
    const { isApplyCoupon, coupon } = this.props;
    if (
      prevProps.isApplyCoupon
      && prevProps.coupon
      && !isApplyCoupon
      && !coupon
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ couponCode: '' });
    }
  }

  render() {
    const {
      onFinish,
      submiting,
      products,
      coupon,
      isApplyCoupon,
      onApplyCoupon,
      settings,
      user
    } = this.props;
    const { ccbillEnabled, verotelEnabled, emerchantEnabled } = settings;
    const { couponCode, gateway } = this.state;
    let valid = true;
    products.forEach((p) => {
      if (p.type === 'physical') valid = false;
    });
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          const price = calTotal(products, coupon?.value);
          if (Number(price) > 300 && gateway !== 'wallet') {
            message.error('Maximum amount of this payment gateway is not greater than $300');
            return;
          }
          const data = { ...values, paymentGateway: gateway };
          if (coupon && coupon._id) {
            data.couponCode = coupon.code;
          }
          onFinish(data);
        }}
        initialValues={{
          deliveryAddress: '',
          phoneNumber: '',
          postalCode: ''
        }}
        labelAlign="left"
        className="account-form"
      >
        <div className={style['cart-form']}>
          <Row>
            {!valid && (
              <>
                <Col span={12}>
                  <Form.Item
                    label={(
                      <>
                        <EnvironmentOutlined />
                        &nbsp; Delivery address
                      </>
                    )}
                    name="deliveryAddress"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        message: 'Please provide your delivery address'
                      }
                    ]}
                  >
                    <Input placeholder="Enter delivery address here" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={(
                      <>
                        <TagOutlined />
                        &nbsp; Postal code
                      </>
                    )}
                    name="postalCode"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        message: 'Please provide your postal code'
                      }
                      // {
                      //   pattern: /^\d{2,10}$/g,
                      //   message: 'Please provide valid digit numbers'
                      // }
                    ]}
                  >
                    <Input placeholder="Enter postal code here" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={(
                      <>
                        <PhoneOutlined />
                        &nbsp; Phone number
                      </>
                    )}
                    name="phoneNumber"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        message: 'Please provide your phone number'
                      },
                      {
                        pattern: /^([+]\d{2,4})?\d{9,12}$/g,
                        message: 'Please provide valid digit numbers'
                      }
                    ]}
                  >
                    <Input placeholder="Enter valid phone number (+910123456789)" />
                  </Form.Item>
                </Col>

              </>
            )}
            <Col span={24}>
              <Form.Item
                name="couponCode"
                label={(
                  <>
                    <CodeOutlined />
                    &nbsp; Coupon
                  </>
                )}
              >
                <div className="coupon-form">
                  <Input
                    onChange={(e) => this.setState({ couponCode: e.target.value })}
                    placeholder="Enter coupon code here"
                    disabled={isApplyCoupon}
                    value={couponCode}
                  />
                  <Button
                    disabled={!couponCode || submiting}
                    className="default"
                    onClick={() => onApplyCoupon(couponCode)}
                  >
                    <strong>
                      {!isApplyCoupon ? 'Apply Coupon' : 'Cancel Coupon'}
                    </strong>
                  </Button>
                </div>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Space className="initial-price">
                <strong style={{ fontSize: '20px' }}>Total price:</strong>
                <span className={isApplyCoupon ? 'discount-price' : ''}>
                  $
                  {calTotal(products)}
                </span>
                {isApplyCoupon && coupon && (
                  <span>
                    $
                    {calTotal(products, coupon.value)}
                  </span>
                )}
              </Space>
            </Col>
            <Col span={24}>
              <div
                style={{ margin: '5px 0 10px' }}
                className="payment-radio__wrapper"
              >
                <div className="payment-gateway">
                  <h4>Payment Gateway</h4>
                  <Divider />
                  <Radio.Group
                    onChange={(e) => this.setState({ gateway: e.target.value })}
                    value={gateway}
                  >
                    {ccbillEnabled && (
                      <Radio value="ccbill">
                        <img src="/ccbill-ico.png" height="30px" alt="ccbill" />
                      </Radio>
                    )}
                    {verotelEnabled && (
                      <Radio value="verotel">
                        <img src="/verotel-ico.png" height="30px" alt="verotel" />
                      </Radio>
                    )}
                    {emerchantEnabled && (
                    <Radio value="emerchant">
                      <img
                        src="/emerchantpay-ico.png"
                        height="25px"
                        alt="emerchant"
                      />
                    </Radio>
                    )}
                  </Radio.Group>
                </div>
                <div className="payment-wallet">
                  <h4>Wallet</h4>
                  <Divider />
                  <Radio.Group
                    onChange={(e) => this.setState({ gateway: e.target.value })}
                    value={gateway}
                  >
                    <Radio value="wallet" className="radio-wallet">
                      <div className="radio-wallet__wrapper">
                        <img
                          src="/loading-wallet-icon.png"
                          height="25px"
                          alt="wallet"
                        />
                        <p className="text">
                          Wallet (
                          {user.balance.toFixed(2)}
                          )
                        </p>
                      </div>
                    </Radio>
                  </Radio.Group>
                </div>
                {!ccbillEnabled && !verotelEnabled && !emerchantEnabled && (
                  <p>
                    No payment gateway was configured, please try again later!
                  </p>
                )}
              </div>
              <Space>
                <Button
                  className="primary"
                  htmlType="submit"
                  disabled={submiting || (!ccbillEnabled && !verotelEnabled && !emerchantEnabled)}
                  loading={submiting}
                >
                  <strong>CHECKOUT</strong>
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Form>
    );
  }
}

const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    user: { ...state.user.current },
    ui: { ...state.ui },
    relatedVideos: { ...state.video.relatedVideos },
    commentMapping,
    comment
  };
};

export default connect(mapStates)(CheckOutForm);
