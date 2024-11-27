import { InfoCircleOutlined } from '@ant-design/icons';
import { payoutRequestService } from '@services/payout-request.service';
import {
  Alert, Button, DatePicker, Divider, Form, Input, InputNumber, message, Select, Space, Statistic, Tag, Tooltip
} from 'antd';
import moment from 'moment';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import {
  IPerformer,
  PayoutRequestInterface
} from 'src/interfaces';

interface Props {
  submit: Function;
  submiting: boolean;
  payout?: Partial<PayoutRequestInterface>;
  statsPayout: {
    totalPrice: number;
    paidPrice: number;
    unpaidPrice: number;
  };
  performer: IPerformer
}

function PayoutRequestForm({
  payout = {
    requestNote: '',
    paymentAccountType: 'banking'
  },
  submit, submiting, statsPayout, performer
}: Props) {
  const {
    requestNote, fromDate, toDate, requestedPrice, status, paymentAccountType
  } = payout;
  const [form] = Form.useForm();
  const [price, setPrice] = useState(requestedPrice || 0);
  const [dateRange, setDateRange] = useState({ fromDate: fromDate ? moment(fromDate) : '', toDate: toDate ? moment(toDate) : '' } as any);
  const getUnpaidPriceByDate = async (range) => {
    const resp = await payoutRequestService.calculate(range);
    setPrice(resp?.data?.unpaidPrice || 0);
  };
  useEffect(() => {
    getUnpaidPriceByDate(dateRange);
  }, [dateRange]);

  const renderRequestPriceText = () => (
    <span>
      Request Amount &nbsp;
      <Tooltip placement="top" title="The final amount paid out may vary slightly, as any transaction fees from the payment processor will be adjusted from it.">
        <InfoCircleOutlined style={{ color: 'red' }} />
      </Tooltip>
    </span>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      className="payout-request-form"
      name="payoutRequestForm"
      onFinish={(data) => {
        if (!dateRange.fromDate || !dateRange.toDate) {
          message.error('Please select date range');
          return;
        }
        if (!price) {
          message.error('You have been paid out!');
          return;
        }
        submit({ ...data, ...dateRange });
      }}
      initialValues={{
        requestNote,
        paymentAccountType
      }}
    >
      <div>
        <Space size="large">
          <Statistic
            title="Model Earnings"
            value={statsPayout?.totalPrice || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title="Unpaid Balance"
            value={statsPayout?.unpaidPrice || 0}
            precision={2}
            prefix="$"
          />
          <Statistic
            title="Total Paid"
            value={statsPayout?.paidPrice || 0}
            precision={2}
            prefix="$"
          />
        </Space>
      </div>
      <Divider />
      <Form.Item label="Select date range">
        <DatePicker.RangePicker
          defaultValue={[dateRange.fromDate, dateRange.toDate]}
          onChange={(dates: [any, any], dateStrings: [string, string]) => setDateRange({
            fromDate: dateStrings[0],
            toDate: dateStrings[1]
          })}
          disabledDate={(current) => {
            const customDate = moment().format('YYYY-MM-DD');
            return current && current >= moment(customDate, 'YYYY-MM-DD');
          }}
        />
      </Form.Item>
      <Form.Item label={renderRequestPriceText()}>
        <InputNumber disabled value={price} min={0} />
      </Form.Item>
      <Form.Item label="Note to Admin" name="requestNote">
        <Input.TextArea disabled={payout && payout.status === 'done'} placeholder="Text something to Admin, if any" rows={3} />
      </Form.Item>
      {payout?.adminNote && (
        <Form.Item label="Admin notes">
          <Alert type="info" message={payout?.adminNote} />
        </Form.Item>
      )}
      {payout._id && (
        <Form.Item label="Status">
          <Tag color="orange" style={{ textTransform: 'capitalize' }}>{status}</Tag>
        </Form.Item>
      )}
      <Form.Item
        label="Select payout method"
        name="paymentAccountType"
        rules={[
          { required: true, message: 'Please select payout method!' }
        ]}
      >
        <Select>
          <Select.Option value="banking" key="banking" disabled={!performer.bankingInformation}>
            <img src="/banking-ico.png" height="20px" alt="banking" />
            {' '}
            Banking
          </Select.Option>
          <Select.Option value="paypal" key="paypal" disabled={!performer.paypalSetting}>
            <img src="/paypal-ico.png" height="20px" alt="paypal" />
            {' '}
            Paypal
          </Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button
          className="primary"
          loading={submiting}
          htmlType="submit"
          disabled={['done', 'approved'].includes(status) || submiting}
          style={{ margin: '0 5px' }}
        >
          Submit
        </Button>
        <Button
          className="secondary"
          loading={submiting}
          htmlType="button"
          disabled={submiting}
          style={{ margin: '0 5px' }}
          onClick={() => Router.back()}
        >
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
}

export default PayoutRequestForm;
