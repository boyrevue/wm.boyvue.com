import { DollarOutlined } from '@ant-design/icons';
import { getResponseError } from '@lib/utils';
import { Button, message } from 'antd';
import React, { useState } from 'react';
import { paymentWalletService } from 'src/services';

import Modal from './modal';

interface TippingProps {
  performerId: string;
  conversationId?: string;
  balanceUser: any;
}

export function Tipping({
  performerId,
  conversationId = null,
  balanceUser

}: TippingProps) {
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onCancel = () => {
    setVisible(false);
  };

  const submit = () => {
    setVisible(true);
  };

  const sendTip = async (amount) => {
    try {
      setSubmitting(true);
      await paymentWalletService.sendTip(performerId, { conversationId, amount });
      setVisible(false);
      setError(false);
      message.success('Thank you for sending me tips !!!');
    } catch (e) {
      const err = await Promise.resolve(e);
      setError(true);
      setErrorMessage(getResponseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        className="show-desktop"
        onClick={submit}
        disabled={!performerId}
        block
      >
        Send Tip
      </Button>
      <Button
        className="show-mobile"
        onClick={submit}
        disabled={!performerId}
      >
        <DollarOutlined />
      </Button>
      <Modal
        visible={visible}
        error={error}
        errorMessage={errorMessage}
        submitting={submitting}
        sendTip={sendTip}
        onCancel={onCancel}
        balanceUser={balanceUser}
      />
    </>
  );
}

export default Tipping;
