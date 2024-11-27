import { performerService } from '@services/performer.service';
import {
  Button, Col, Modal, Row
} from 'antd';
import { useRef, useState } from 'react';

import style from './commission-check-button.module.less';

export function CommissionCheckButton() {
  const loading = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [commission, setCommission] = useState(null);

  const loadCommission = async () => {
    if (loading.current) return;

    loading.current = true;
    const resp = await performerService.getCommissions();
    const data = {
      monthlySubscriptionCommission: resp.data.monthlySubscriptionCommission * 100,
      productSaleCommission: resp.data.productSaleCommission * 100,
      feedSaleCommission: resp.data.feedSaleCommission * 100,
      videoSaleCommission: resp.data.videoSaleCommission * 100,
      yearlySubscriptionCommission: resp.data.yearlySubscriptionCommission * 100,
      tokenTipCommission: resp.data.tokenTipCommission * 100,
      privateChatCommission: resp.data.privateChatCommission * 100
    };
    setCommission(data);
    setShowModal(true);
    loading.current = false;
  };

  return (
    <div>
      <Button onClick={loadCommission}>
        Check Admin commission
      </Button>
      <Modal
        title="Admin commission"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        className={style['modal-earning']}
      >
        <Row>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>Monthly Commission</h4>
              {' '}
              <p>
                {commission?.monthlySubscriptionCommission}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>Yearly Commission</h4>
              {' '}
              <p>
                {commission?.yearlySubscriptionCommission}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>Product Commission</h4>
              {' '}
              <p>
                {commission?.productSaleCommission}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>Video Commission</h4>
              {' '}
              <p>
                {commission?.videoSaleCommission}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>C2C commission</h4>
              {' '}
              <p>
                {commission?.privateChatCommission}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>Tip Commission</h4>
              {' '}
              <p>
                {commission?.tokenTipCommission}
                %
              </p>
            </div>
          </Col>
          <Col span={12} className="modal-earning-item">
            <div className="modal-earning-item__header">
              <h4>Feed Sale Commission</h4>
              {' '}
              <p>
                {commission?.feedSaleCommission}
                %
              </p>
            </div>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default CommissionCheckButton;
