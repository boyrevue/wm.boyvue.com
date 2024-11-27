import {
  ContactsOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Button, Result } from 'antd';
import Router from 'next/router';
import { PureComponent } from 'react';

type IProps = {
  statusCode: number;
  message: string;
}

export default class Error extends PureComponent<IProps> {
  static authenticate = true;

  static async getInitialProps({ res, err }) {
    const statusCode = res?.statusCode || err?.statusCode || 404;
    return {
      statusCode: res?.statusCode || err?.statusCode || 404,
      message: res?.message || err?.message || `An error ${statusCode} occurred on server`
    };
  }

  render() {
    const { statusCode, message } = this.props;
    return (
      <Result
        status={statusCode === 404 ? '404' : 'error'}
        title={statusCode === 404 ? null : statusCode}
        subTitle={message}
        extra={[
          <Button className="secondary" key="console" onClick={() => Router.push('/')}>
            <HomeOutlined />
            BACK HOME
          </Button>,
          <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
            <ContactsOutlined />
            CONTACT US
          </Button>
        ]}
      />
    );
  }
}
