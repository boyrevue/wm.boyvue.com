import {
  Button, Col, DatePicker,
  Row, Select
} from 'antd';
import { useState } from 'react';

const { RangePicker } = DatePicker;

const deliveryStatuses = [
  {
    key: '',
    text: 'Delivery Status'
  },
  {
    key: 'created',
    text: 'Created'
  },
  {
    key: 'processing',
    text: 'Processing'
  },
  {
    key: 'shipping',
    text: 'Shipping'
  },
  {
    key: 'delivered',
    text: 'Delivered'
  },
  {
    key: 'refunded',
    text: 'Refunded'
  }
];

const statuses = [
  {
    key: '',
    text: 'Payment Status'
  },
  {
    key: 'pending',
    text: 'Created'
  },
  {
    key: 'success',
    text: 'Success'
  },
  {
    key: 'cancelled',
    text: 'Cancelled'
  },
  {
    key: 'chargeback',
    text: 'Chargeback'
  }
];

type IProps = {
  onSubmit?: Function;
}

export function OrderSearchFilter({
  onSubmit = () => {}
}: IProps) {
  const [filter, setFilter] = useState({
    deliveryStatus: '',
    status: '',
    fromDate: '',
    toDate: ''
  });

  return (
    <Row gutter={24}>

      <Col xl={4} md={6} xs={12}>
        <Select
          onChange={(status) => setFilter({ ...filter, status })}
          style={{ width: '100%' }}
          placeholder="Select payment status"
          defaultValue=""
        >
          {statuses.map((s) => (
            <Select.Option key={s.key} value={s.key}>
              {s.text || s.key}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xl={4} md={6} xs={12}>
        <Select
          onChange={(deliveryStatus) => setFilter({ ...filter, deliveryStatus })}
          style={{ width: '100%' }}
          placeholder="Select delivery status"
          defaultValue=""
        >
          {deliveryStatuses.map((s) => (
            <Select.Option key={s.key} value={s.key}>
              {s.text || s.key}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xl={6} md={6} xs={18}>
        <RangePicker
          onChange={(dates: [any, any], dateStrings: [string, string]) => setFilter({
            ...filter,
            fromDate: dateStrings[0],
            toDate: dateStrings[1]
          })}
        />
      </Col>
      <Col xl={4} md={6} xs={6}>
        <Button type="primary" onClick={() => onSubmit(filter)}>
          Search
        </Button>
      </Col>
    </Row>
  );
}

export default OrderSearchFilter;
