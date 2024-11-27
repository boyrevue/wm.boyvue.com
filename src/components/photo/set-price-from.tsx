import './photo.module.less';

import {
  Button,
  Col, Form, InputNumber, Row, Switch
} from 'antd';

type IProps = {
  photo: any;
  submit: Function;
  loading: boolean;
}

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 }
};

export function SetPhotoPrice({ photo, submit, loading }: IProps) {
  return (
    <Row className="update-photo-form">
      <Col span={24} className="title">
        <h3>{photo.title}</h3>
        <img src={photo.photo.url} alt={photo.title} width={300} />
      </Col>
      <Form
        onFinish={(value) => submit(value)}
        {...formItemLayout}
        initialValues={{
          price: photo?.price,
          isSale: photo?.isSale
        }}
      >
        <Col span={24}>
          <Form.Item
            name="isSale"
            label="For sale?"
            valuePropName="checked"
          >
            <Switch
            // defaultChecked={photo.isSale}
              checkedChildren="Pay per view"
              unCheckedChildren="Subscribe to view"
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="price" label="Price">
            <InputNumber style={{ width: '100%' }} min={0.1} step={0.1} placeholder="Price" />
          </Form.Item>
        </Col>
        <Col span={24} className="submit">
          <Button className="primary" htmlType="submit" disabled={loading}>
            Update
          </Button>
        </Col>
      </Form>
    </Row>
  );
}
