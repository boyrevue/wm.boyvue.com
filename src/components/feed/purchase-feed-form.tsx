import { paymentService } from '@services/index';
import {
  Button, Input,
  message, Radio
} from 'antd';
import Router from 'next/router';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { IFeed, ISettings, IUser } from 'src/interfaces';

import style from './index.module.less';

interface IProps {
  feed: IFeed;
}

export function PurchaseFeedForm({ feed }: IProps) {
  const [paymentGateway, setPaymentGateway] = useState('emerchant');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [applyCode, setApplyCode] = useState(false);
  const [price, setPrice] = useState(feed.price);
  const user: IUser = useSelector((state: any) => state.user.current);
  const settings: ISettings = useSelector((state: any) => state.settings);
  const purchaseFeed = async () => {
    if (!user || !user._id) {
      message.error('Please login or register to purchase feed!');
      Router.push('/auth/login');
      return;
    }
    try {
      setLoading(true);
      if (paymentGateway === 'wallet') {
        await paymentService.purchaseFeedWallet(feed._id);
        message.success('Purchased feed successfully!');
        Router.reload();
      } else {
        const resp = await (await paymentService.purchaseFeed({ feedId: feed._id, couponCode: coupon?.code || null, paymentGateway })).data;
        if (resp) {
          message.info(
            'Redirecting to payment gateway, do not reload page at this time',
            30
          );
          if (['ccbill', 'verotel', 'emerchant'].includes(paymentGateway)) { window.location.href = resp.paymentUrl; }
        }
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    try {
      const resp = await paymentService.applyCoupon(couponCode);
      setCoupon(resp.data);
      setApplyCode(true);
      resp.data.value && setPrice(feed.price - resp.data.value * feed.price);
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(
        e && e.message ? e.message : 'Error occured, please try again later'
      );
    }
  };

  const cancelApplyCoupon = () => {
    setPrice(feed.price);
    setCoupon(null);
    setApplyCode(false);
    setCouponCode('');
  };

  return (
    <div className={style['purchase-feed-form']}>
      <div className="title">
        <h3>
          Confirm purchase
          {' '}
          {feed.performer.username}
          &apos;s post
        </h3>
        <h4>
          {feed.text.length < 100 ? feed.text : `${feed.text.slice(0, 99)}...`}
        </h4>
      </div>
      <div>
        <Radio.Group onChange={(e) => setPaymentGateway(e.target.value)} value={paymentGateway}>
          {settings?.ccbillEnabled && (
            <Radio value="ccbill">
              <img src="/ccbill-ico.png" height="22px" alt="ccbill" />
            </Radio>
          )}
          {settings?.verotelEnabled && (
            <Radio value="verotel">
              <img src="/verotel-ico.png" height="22px" alt="verotel" />
            </Radio>
          )}
          {settings?.emerchantEnabled && (
          <Radio value="emerchant">
            <img
              src="/emerchantpay-ico.png"
              height="25px"
              alt="emerchant"
            />
          </Radio>
          )}
          <Radio value="wallet" className="radio-wallet">
            <div className="radio-wallet__wrapper">
              <img
                src="/loading-wallet-icon.png"
                height="20px"
                alt="wallet"
              />
              <span className="text">
                Wallet (
                {user?.balance.toFixed(2)}
                )
              </span>
            </div>
          </Radio>
        </Radio.Group>
      </div>
      <div className="coupon-form">
        <Input disabled={applyCode} placeholder="Enter coupon code here" onChange={(v) => setCouponCode(v.target.value)} />
        {!applyCode ? <Button className="default" onClick={() => applyCoupon()}>Apply Coupon</Button>
          : <Button className="default" onClick={() => cancelApplyCoupon()}>Cancel Coupon</Button>}
      </div>
      <Button
        className="primary"
        type="primary"
        style={{ marginTop: '15px' }}
        htmlType="submit"
        onClick={() => purchaseFeed()}
        disabled={loading}
      >
        Confirm purchase feed for $
        {price.toFixed(2)}
      </Button>
    </div>
  );
}
