import { settingService } from '@services/setting.service';
import {
  Button,
  InputNumber,
  message
} from 'antd';
import { useState } from 'react';
import { CheckIcon } from 'src/icons';
import { IPerformer } from 'src/interfaces/index';

import style from './performer.module.less';

interface IProps {
  performer: IPerformer;
  onFinish(price: any): Function;
  submiting: boolean;
}

export function TipPerformerForm({ performer, onFinish, submiting }: IProps) {
  const [price, setPrice] = useState(10);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (amount: number) => {
    setLoading(true);
    const setting = await settingService.valueByKeys(['minTippingAmount', 'maxTippingAmount']);
    const {
      minTippingAmount,
      maxTippingAmount
    } = setting;
    if (minTippingAmount && amount < (minTippingAmount || 1)) {
      message.error({ content: `Minimum tip amount is $${minTippingAmount}`, key: 'wallet-amount-limit' });
      setLoading(false);
      return;
    }

    if (maxTippingAmount && amount > maxTippingAmount) {
      message.error({ content: `Maximum tip amount is $${maxTippingAmount}`, key: 'wallet-amount-limit' });
      setLoading(false);
      return;
    }

    onFinish(amount);
    setLoading(false);
  };

  return (
    <div className={style['confirm-subscription-form']}>
      <div className="profile-cover" style={{ backgroundImage: 'url(\'/banner-image.jpg\')' }} />
      <div className="profile-info">
        <img
          alt="main-avt"
          src={performer?.avatar || '/no-avatar.png'}
        />
        <div className="m-user-name">
          <h4>
            {performer?.name || 'N/A'}
                  &nbsp;
            {performer?.verifiedAccount && (
              <CheckIcon />
            )}
          </h4>
          <h5 style={{ textTransform: 'none' }}>
            @
            {performer?.username || 'n/a'}
          </h5>
        </div>
      </div>
      <div className="info-body">
        <div style={{ margin: '0 0 20px', textAlign: 'center' }}>
          <p>Enter your amount </p>
          <InputNumber min={1} onChange={(value) => setPrice(value)} value={price} />
        </div>
      </div>
      <Button type="primary" disabled={loading || submiting} loading={loading || submiting} onClick={() => onSubmit(price)}>SEND TIP</Button>
    </div>
  );
}
