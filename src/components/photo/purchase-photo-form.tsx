import './photo.module.less';

import { getResponseError } from '@lib/utils';
import { paymentService } from '@services/index';
import {
  Button, message, Radio
} from 'antd';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { IPhotos, ISettings } from 'src/interfaces';

type IProps = {
  photo: IPhotos;
}

export function PurchasePhotoForm({ photo }: IProps) {
  const [gateway, setGateway] = useState('emerchant');
  const [loading, setLoading] = useState(false);
  const settings: ISettings = useSelector((state: any) => state.settings);
  const purchase = async () => {
    try {
      setLoading(true);
      const resp = await paymentService.purchaseSinglePhoto({ photoId: photo._id, paymentGateway: gateway });
      if (resp?.data?.paymentUrl) {
        message.info('Redirecting to payment gateway, do not reload page at this time', 15);
        if (['ccbill', 'verotel', 'emerchant'].includes(gateway)) window.location.href = resp.data.paymentUrl;
      }
    } catch (error) {
      const err = Promise.resolve(error);
      message.error(getResponseError(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="purchase-photo-form">
      <div className="title">
        <h4>
          {photo.title}
        </h4>
        <img src={photo.photo.blurImage} width={100} alt="" />
      </div>
      <div>
        <Radio.Group onChange={(e) => setGateway(e.target.value)} value={gateway}>
          {settings?.ccbillEnabled && (
          <Radio value="ccbill">
            <img src="/ccbill-ico.png" height="20px" alt="ccbill" />
          </Radio>
          )}
          {settings?.verotelEnabled && (
          <Radio value="verotel">
            <img src="/verotel-ico.png" height="20px" alt="verotel" />
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
        </Radio.Group>
        {(!settings?.ccbillEnabled && !settings?.verotelEnabled && !settings?.emerchantEnabled) && <p>No payment gateway was configured, please try again later!</p>}
      </div>
      <Button
        className="primary"
        type="primary"
        htmlType="submit"
        onClick={purchase}
        disabled={loading}
      >
        Confirm purchase photo for $
        {photo.price}
      </Button>
    </div>
  );
}
