import {
  SendOutlined, SmileOutlined
} from '@ant-design/icons';
import { Emotions } from '@components/messages/emotions';
import {
  Button, Form, Input, Popover
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import {
  useRef, useState
} from 'react';
import { IUser } from 'src/interfaces';

import { ICreateComment } from '../../interfaces/comment';
import style from './comment-form.module.less';

type IProps = {
  objectId: string;
  objectType?: string;
  onSubmit: Function;
  creator: IUser;
  requesting?: boolean;
  isReply?: boolean;
}

const { TextArea } = Input;

export function CommentForm({
  objectId,
  creator,
  objectType = '',
  onSubmit = () => {},
  requesting = false,
  isReply = false
}: IProps) {
  const formRef = useRef(null);
  const [text, setText] = useState('');

  const onFinish = (values: ICreateComment) => {
    if (!creator._id) return;
    const data = values;
    if (!data.content || !data.content.trim()) {
      return;
    }
    data.objectId = objectId;
    data.objectType = objectType || 'video';
    formRef.current?.resetFields();
    onSubmit(data);
  };

  const onEmojiClick = (emoji) => {
    if (!creator._id) return;
    const instance = formRef.current as FormInstance;
    instance.setFieldsValue({
      content: `${instance.getFieldValue('content')} ${emoji} `
    });
    setText(`${text} ${emoji} `);
  };

  return (
    <Form
      ref={formRef}
      name="comment-form"
      onFinish={onFinish}
      initialValues={{
        content: ''
      }}
    >
      <div className={style['comment-form']}>
        <div className="cmt-user">
          <img alt="creator-img" src={creator?.avatar || '/no-avatar.png'} />
        </div>
        <div className="cmt-area">
          <Form.Item
            name="content"
          >
            <TextArea disabled={!creator._id} maxLength={250} rows={!isReply ? 2 : 1} placeholder={!isReply ? 'Add a comment here' : 'Add a reply here'} />
          </Form.Item>
          <Popover content={<Emotions onEmojiClick={onEmojiClick} />} trigger="click">
            <div className="grp-emotions">
              <SmileOutlined />
            </div>
          </Popover>
        </div>
        <Button className="submit-btn" htmlType="submit" disabled={requesting}>
          <SendOutlined />
        </Button>
      </div>
    </Form>
  );
}

export default CommentForm;
