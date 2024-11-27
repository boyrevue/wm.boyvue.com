import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import {
  Col, DatePicker,
  Input, Row, Select
} from 'antd';
import { useState } from 'react';

const { RangePicker } = DatePicker;
type IProps = {
  onSubmit: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  type?: {
    key: string;
    text?: string;
  }[];
  searchWithPerformer?: boolean;
  searchWithKeyword?: boolean;
  dateRange?: boolean;
  searchWithCategory?: boolean;
  searchPaymentGateway?: boolean;
  searchPayoutStatus?: boolean;
  categoryId?: string;
  categoryGroup?: string;
}

export function SearchFilter({
  onSubmit,
  statuses = [],
  type = [],
  searchWithPerformer = false,
  searchWithKeyword = false,
  dateRange = false,
  searchWithCategory = false,
  searchPaymentGateway = false,
  searchPayoutStatus = false,
  categoryId = '',
  categoryGroup = ''
}: IProps) {
  const [filter, setFilter] = useState({});

  const onChange = (field, value) => {
    const data = {
      ...filter,
      [field]: value
    };
    setFilter(data);
    onSubmit(data);
  };

  return (
    <Row gutter={10} style={{ marginBottom: '10px' }}>
      {searchWithKeyword && (
        <Col lg={8} xs={12}>
          <Input.Search
            className="primary"
            placeholder="Enter keyword"
            onChange={(evt) => setFilter({ ...filter, q: evt.target.value })}
            // onPressEnter={() => onSubmit(filter)}
            enterButton
            onSearch={() => onSubmit(filter)}
          />
        </Col>
      )}
      {statuses && statuses.length ? (
        <Col lg={8} xs={12}>
          <Select
            onChange={(val) => onChange('status', val)}
            style={{ width: '100%' }}
            placeholder="Select status"
            defaultValue=""
          >
            {statuses.map((s) => (
              <Select.Option key={s.text} value={s.key}>
                {s.text || s.key}
              </Select.Option>
            ))}
          </Select>
        </Col>
      ) : null}
      {type && type.length ? (
        <Col lg={8} xs={12}>
          <Select
            onChange={(val) => onChange('type', val)}
            style={{ width: '100%' }}
            placeholder="Select type"
            defaultValue=""
          >
            {type.map((s) => (
              <Select.Option key={s.text} value={s.key}>
                {s.text || s.key}
              </Select.Option>
            ))}
          </Select>
        </Col>
      ) : null}

      {searchPaymentGateway && (
        <Col lg={8} xs={12}>
          <Select
            onChange={(val) => onChange('paymentGateway', val)}
            style={{ width: '100%' }}
            placeholder="Payment Method"
            defaultValue=""
          >
            <Select.Option key="method" value="">
              Payment Method
            </Select.Option>
            <Select.Option key="wallet" value="wallet">
              Wallet
            </Select.Option>
            <Select.Option key="ccbill" value="ccbill">
              CCBill
            </Select.Option>
            <Select.Option key="verotel" value="verotel">
              Verotel
            </Select.Option>
            <Select.Option key="emerchant" value="emerchant">
              Emerchant
            </Select.Option>
          </Select>
        </Col>
      )}
      {searchPayoutStatus && (
        <Col lg={8} xs={12}>
          <Select
            onChange={(val) => onChange('payoutStatus', val)}
            style={{ width: '100%' }}
            placeholder="Payout Status"
            defaultValue=""
          >
            <Select.Option key="method" value="">
              Payout Status
            </Select.Option>
            <Select.Option key="done" value="done">
              Paid
            </Select.Option>
            <Select.Option key="pending" value="pending">
              Unpaid
            </Select.Option>
            <Select.Option key="rejected" value="rejected">
              Rejected
            </Select.Option>
          </Select>
        </Col>
      )}
      {searchWithPerformer && (
        <Col lg={8} xs={12}>
          <SelectPerformerDropdown
            style={{ width: '100%' }}
            onSelect={(val) => onChange('performerId', val)}
          />
        </Col>
      )}
      {searchWithCategory && (
        <Col lg={8} md={8} xs={12}>
          <SelectCategoryDropdown
            group={categoryGroup || ''}
            isMultiple={false}
            defaultValue={categoryId || ''}
            onSelect={(val) => onChange('categoryId', val)}
          />
        </Col>
      )}
      {dateRange && (
        <Col lg={8} xs={24}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates: [any, any], dateStrings: [string, string]) => {
              const data = {
                ...filter,
                fromDate: dateStrings[0],
                toDate: dateStrings[1]
              };
              setFilter(data);
              onSubmit(data);
            }}
          />
        </Col>
      )}
    </Row>
  );
}

export default SearchFilter;
