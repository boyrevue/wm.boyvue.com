import { getResponseError } from '@lib/utils';
import { paymentWalletService } from '@services/payment-wallet.service';
import { settingService } from '@services/setting.service';
import {
  Button, Input, message, Modal,
  Radio, RadioChangeEvent,
  Tooltip
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { ISettings, IUser } from 'src/interfaces';

import style from './topup-wallet.module.less';

export interface ITopupWalletModal {
  settings?: ISettings;
  currentUser?: IUser;
  visible: boolean;
  onClose: Function;
}

function TopupWalletModal({
  currentUser = null,
  settings = null,
  visible,
  onClose
}: ITopupWalletModal) {
  const [open, setOpen] = useState(visible);
  const [inputVal, setInputVal] = useState(1);
  const [radioVal, setRadioVal] = useState(
    (settings?.ccbillEnabled && 'ccbill')
    || (settings?.verotelEnabled && 'verotel')
    || (settings?.emerchantEnabled && 'emerchant')
  );
  const [loading, setLoading] = useState(false);
  const exceptThisSymbols = ['e', 'E', '+', '-'];
  const incLists = [
    {
      key: '10',
      value: 10
    },
    {
      key: '50',
      value: 50
    },
    {
      key: '100',
      value: 100
    }
  ];
  const inputEl = useRef(null);

  useEffect(() => {
    if (!inputEl.current) return;

    inputEl.current.focus();
  }, [inputEl]);

  useEffect(() => {
    if (visible) setOpen(true);
  }, [visible]);

  const handleInputChange = (e) => {
    setInputVal(e);
  };

  const handleRadioGroupChange = (e: RadioChangeEvent) => {
    setRadioVal(e.target.value);
  };

  const handleIncrementClick = (value) => {
    setInputVal(Number(inputVal) + value);
  };

  const submit = async () => {
    try {
      setLoading(true);
      // get max / min wallet
      const setting = await settingService.valueByKeys(['minTopupWalletAmount', 'maxTopupWalletAmount']);
      const {
        minTopupWalletAmount,
        maxTopupWalletAmount
      } = setting;

      if (Number(inputVal) <= (minTopupWalletAmount || 2.95)) {
        message.error({ content: `Minimum top-up amount is $${minTopupWalletAmount}`, key: 'wallet-amount-limit' });
        setLoading(false);
        return;
      }
      if (Number(inputVal) > (maxTopupWalletAmount || 100)) {
        message.error({ content: `Maximum top-up amount is $${maxTopupWalletAmount || 100}`, key: 'error-wallet-amount-limit' });
        setLoading(false);
        return;
      }
      const resp = await
      paymentWalletService.purchaseWallet({
        amount: Number(inputVal),
        paymentGateway: radioVal
      });
      if (['ccbill', 'verotel', 'emerchant'].includes(radioVal)) { window.location.href = resp.data.paymentUrl; }
    } catch (e) {
      const err = await e;
      message.error(getResponseError(err));
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const onCancel = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Modal
      className={style['modal-wallet__popup']}
      visible={open}
      onCancel={onCancel}
      destroyOnClose
      footer={null}
    >
      <div className="modal-wallet">
        <div className="modal-wallet__header">
          <img src="/loading-wallet-icon.png" alt="" width="23" height="23" />
          <p>Top Up My Wallet</p>
        </div>
        <div className="modal-wallet__body">
          <div className="wallet-body__input">
            <Input
              min={1}
              prefix="$"
              type="number"
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => exceptThisSymbols.includes(e.key) && e.preventDefault()}
              ref={inputEl}
            />
            {' '}
            <span className="max-wallet-amount-topup">
              <Tooltip
                // open
                placement="bottomRight"
                title={`Max wallet topup amount: ${settings?.maxWalletTopupAmount?.toFixed(2)}`}
              >
                <img src="/warning-icon.png" alt="" width={23} height={23} />
              </Tooltip>
            </span>
          </div>

          <div className="wallet-body__increment">
            <p className="increment__plus">+</p>
            {incLists.map((incList) => (
              <Button
                className="increment__btn"
                value={incList.value}
                key={incList.key}
                onClick={() => handleIncrementClick(incList.value)}
              >
                +
                {incList.value}
              </Button>
            ))}
          </div>

          <div className="wallet-body__radio">
            <Radio.Group onChange={handleRadioGroupChange} value={radioVal}>
              {settings?.ccbillEnabled && (
                <Radio value="ccbill">
                  <img src="/ccbill-ico.png" height="25px" alt="ccbill" />
                </Radio>
              )}
              {settings?.verotelEnabled && (
                <Radio value="verotel">
                  <img src="/verotel-ico.png" height="25px" alt="verotel" />
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
          </div>

          <div className="wallet-body__submit">
            <Button onClick={submit} disabled={loading}>
              Proceed
            </Button>
          </div>
        </div>

        <div className="modal-wallet__footer">
          <div className="wallet-footer__current">
            <p className="title">Current Balance</p>
            <h1 className="balance">
              $
              {(currentUser.balance || 0).toFixed(2)}
            </h1>
          </div>
          <div className="wallet-footer__info">
            <Tooltip placement="bottomRight" title="Wallet credits can be used for buying videos, products, sending tips, requesting private shows, paid shows, and purchasing galleries. They cannot be used for subscriptions.">
              What can I use this for?
            </Tooltip>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const mapStates = (state: any) => ({
  settings: { ...state.settings },
  currentUser: state.user.current
});

export default connect(mapStates)(TopupWalletModal);
