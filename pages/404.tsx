import {
  ContactsOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Button, Result } from 'antd';
import Router from 'next/router';

export function Error404() {
  return (
    <Result
      status="404"
      title={null}
      subTitle="Alas! It hurts us to realize that we have let you down. We are not able to find the page you are hunting for :("
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

Error404.authenticate = false;

export default Error404;
