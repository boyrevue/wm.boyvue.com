import {
  Button, Form, Input
} from 'antd';
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
  }
};

type IProps = {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
}

export function PerformerPaypalForm({
  onFinish, user, updating = false
}: IProps) {
  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish.bind(this)}
      validateMessages={validateMessages}
      initialValues={user?.paypalSetting?.value || {
        email: '',
        phoneNumber: ''
      }}
      labelAlign="left"
      className="account-form"
    >
      <h4 className="text-center">The Paypal account saved here will be used when requesting manual payouts. You can also save your Banking account under the Banking tab</h4>
      <Form.Item
        name="email"
        label="Paypal account email"
        validateTrigger={['onChange', 'onBlur']}
        rules={[{ required: true }, { type: 'email' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item className="text-center">
        <Button className="primary" type="primary" htmlType="submit" disabled={updating} loading={updating}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}

export default PerformerPaypalForm;
