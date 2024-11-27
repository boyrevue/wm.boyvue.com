import {
  Button, Col, DatePicker,
  Row, Select
} from 'antd';
import { useState } from 'react';

const productTypes = [
  {
    key: '',
    text: 'Product Type'
  },
  {
    key: 'physical',
    text: 'Physical'
  },
  {
    key: 'digital',
    text: 'Digital'
  }
];
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
    key: 'cancelled',
    text: 'Cancelled'
  },
  {
    key: 'shipped',
    text: 'Shipped'
  },
  {
    key: 'delivered',
    text: 'Delivered'
  }
];

type IProps = {
  onSubmit?: Function;
}

const { RangePicker } = DatePicker;

export function OrderSearchFilter({
  onSubmit = () => {}
}: IProps) {
  const [filter, setFilter] = useState({
    productType: '',
    deliveryStatus: '',
    paymentStatus: '',
    fromDate: '',
    toDate: ''
  });

  return (
    <Row gutter={10}>
      <Col xl={4} md={6} xs={12}>
        <Select
          onChange={(val) => setFilter({ ...filter, productType: val })}
          style={{ width: '100%' }}
          placeholder="Select product type"
          defaultValue=""
        >
          {productTypes.map((s) => (
            <Select.Option key={s.key} value={s.key}>
              {s.text || s.key}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col xl={4} md={6} xs={12}>
        <Select
          onChange={(val) => setFilter({ ...filter, deliveryStatus: val })}
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
      <Col xl={6} md={8} xs={12}>
        <RangePicker
          style={{ width: '100%' }}
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
