import { settingService } from '@services/setting.service';
import {
  Button, Col,
  Form, InputNumber, message,
  Row
} from 'antd';
import { useState } from 'react';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a valid email!',
    number: 'Not a valid number!'
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    range: 'Must be between ${min} and ${max}'
  }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export function PerformerSubscriptionForm({
  onFinish,
  user,
  updating = false
}: IProps) {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: Record<string, any>) => {
    setLoading(true);
    const setting = await settingService.valueByKeys(['minSubscriptionPrice', 'maxSubscriptionPrice']);
    const {
      minSubscriptionPrice,
      maxSubscriptionPrice
    } = setting;
    const {
      monthlyPrice,
      yearlyPrice
    } = values;
    const minValue = Math.min(monthlyPrice, yearlyPrice);
    if (minSubscriptionPrice && minValue < minSubscriptionPrice) {
      message.error({ content: `Minimum subscription amount is $${minSubscriptionPrice}`, key: 'subscription-amount-limit' });
      setLoading(false);
      return;
    }

    const maxValue = Math.max(monthlyPrice, yearlyPrice);
    if (maxSubscriptionPrice && maxValue > maxSubscriptionPrice) {
      message.error({ content: `Maximum subscription amount is $${maxSubscriptionPrice}`, key: 'subscription-amount-limit' });
      setLoading(false);
      return;
    }

    setLoading(false);
    onFinish(values);
  };

  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onSubmit}
      validateMessages={validateMessages}
      initialValues={user}
      labelAlign="left"
      className="account-form"
    >
      <Row>
        <Col xl={12} md={12} xs={12}>
          <Form.Item
            name="monthlyPrice"
            label="Monthly Subscription Price in $"
            rules={[{ required: true, message: 'Please enter monthly subscription price' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xl={12} md={12} xs={12}>
          <Form.Item
            name="yearlyPrice"
            label="Yearly Subscription Price in $"
            rules={[{ required: true, message: 'Please enter yearly subscription price' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="text-center">
        <Button
          className="primary"
          type="primary"
          htmlType="submit"
          loading={loading || updating}
          disabled={loading || updating}
        >
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}

export default PerformerSubscriptionForm;
