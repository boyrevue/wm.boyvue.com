import {
  Button, Col,
  Form, Input, Row
} from 'antd';
import React from 'react';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

type IProps = {
  onFinish: Function;
  updating: boolean;
}

export function UpdatePaswordForm({ onFinish, updating = false }: IProps) {
  return (
    <Form
      name="nest-messages"
      className="account-form"
      onFinish={onFinish.bind(this)}
      {...layout}
    >
      <Row>
        <Col md={12} xs={24}>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                message: 'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
              }, {
                required: true,
                message: 'Please enter your new password!'
              }
            ]}
          >
            <Input
              type="password"
              placeholder="Enter new password"
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            validateTrigger={['onChange', 'onBlur']}
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Please confirm your password!'
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject('Passwords do not match!');
                }
              })
            ]}
          >
            <Input type="password" placeholder="Re-enter password" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="text-center">
        <Button className="primary" htmlType="submit" disabled={updating} loading={updating}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}
