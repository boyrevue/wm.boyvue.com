import { Alert, Modal } from 'antd';
import React from 'react';

import Form from './form';

interface TippingModalProps {
  visible: boolean;
  submitting: boolean;
  error: boolean;
  errorMessage: string;
  sendTip: Function;
  onCancel: any;
  balanceUser: any;
}

function TippingModal({
  visible, sendTip, onCancel, error, errorMessage, submitting, balanceUser
}: TippingModalProps) {
  const [amount, setAmount] = React.useState(0);
  const onOK = () => {
    sendTip(amount);
  };

  const onChange = (data: any) => {
    setAmount(data.amount);
  };

  return (
    <Modal
      visible={visible}
      title={<span style={{ textAlign: 'center' }}>Tip</span>}
      onOk={onOK}
      onCancel={onCancel}
      confirmLoading={submitting}
      destroyOnClose
      className="modal-bottom"
      centered
    >
      <div className="content-body-model">
        {error && <Alert type="error" message={errorMessage} showIcon />}
        <div>
          Current Balance:
          {' '}
          <strong>{(balanceUser?.balance || 0).toFixed(2)}</strong>
        </div>
        <Form onChange={onChange} />
      </div>
    </Modal>
  );
}

export default TippingModal;
