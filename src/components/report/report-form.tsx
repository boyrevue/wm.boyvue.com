import {
  Button, Form,
  Input, Select
} from 'antd';

import style from './report.module.less';

type IProps = {
  onFinish: Function;
  submiting: boolean;
}

function ReportForm({ onFinish, submiting }: IProps) {
  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      name="report-form"
      className={style['report-form']}
      onFinish={(values) => onFinish(values)}
      initialValues={{ title: '', description: '' }}
    >
      <div className="modal-body-custom">
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Please select title' }
          ]}
          validateTrigger={['onChange', 'onBlur']}
        >
          <Select>
            <Select.Option value="Violent or repulsive content" key="Violent or repulsive content">Violent or repulsive content</Select.Option>
            <Select.Option value="Hateful or abusive content" key="Hateful or abusive content">Hateful or abusive content</Select.Option>
            <Select.Option value="Harassment or bullying" key="Harassment or bullying">Harassment or bullying</Select.Option>
            <Select.Option value="Harmful or dangerous acts" key="Harmful or dangerous acts">Harmful or dangerous acts</Select.Option>
            <Select.Option value="Child abuse" key="Child abuse">Child abuse</Select.Option>
            <Select.Option value="Promotes terrorism" key="Promotes terrorism">Promotes terrorism</Select.Option>
            <Select.Option value="Spam or misleading" key="Spam or misleading">Spam or misleading</Select.Option>
            <Select.Option value="Infringes my rights" key="Infringes my rights">Infringes my rights</Select.Option>
            <Select.Option value="Others" key="Others">Others</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Tell us reason why you report" minLength={5} showCount maxLength={100} rows={3} />
        </Form.Item>
      </div>
      <div className="modal-button-custom ">
        <Button type="primary" disabled={submiting} loading={submiting} htmlType="submit">Send Report</Button>
      </div>
    </Form>
  );
}

export default ReportForm;
