/* eslint-disable no-template-curly-in-string */
import {
  Button, Form, InputNumber
} from 'antd';
import React from 'react';
import { IPerformer } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { xs: { span: 24 }, sm: { span: 12 } }
};
const { Item } = Form;

type IProps = {
  user: IPerformer;
  onFinish: (v: any) => void;
  updating: boolean;
}

function ChatPriceForm({ user, updating, onFinish }: IProps) {
  return (
    <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish}
      initialValues={{
        privateChatPrice: (user && user.privateChatPrice) || 0,
        groupChatPrice: (user && user.groupChatPrice) || 0
      }}
      labelAlign="left"
      className="account-form"
    >
      <Item
        name="privateChatPrice"
        label="Private show charges - Wallet credits per minute"
        rules={[{
          validator: (_, value) => {
            if (typeof value === 'number' && value >= 0) {
              return Promise.resolve();
            }

            return Promise.reject(new Error('Please input an integer number!'));
          }
        }]}
      >
        <InputNumber type="number" min={0} placeholder="Input Private wallet per minute" style={{ width: '100%' }} />
      </Item>
      {/* <Item
      name="groupChatPrice"
      label="Group Chat Price"
      rules={[{
        validator: (_, value) => {
          if (typeof value === 'number' && value >= 0) {
            return Promise.resolve();
          }

          return Promise.reject(new Error('Please input an integer number!'));
        }
      }]}
    >
      <InputNumber type="number" min={0} placeholder="Input Group Chat Price" style={{ width: '100%' }} />
    </Item> */}
      <Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={updating}
        >
          Submit
        </Button>
      </Item>
    </Form>
  );
}

export default ChatPriceForm;
