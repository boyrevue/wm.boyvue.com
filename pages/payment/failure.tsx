import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { Button, Layout, Result } from 'antd';
import Router from 'next/router';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

type IProps = {
  user: IUser;
}

function PaymentFailure({
  user
}: IProps) {
  return (
    <Layout>
      <PageTitle title="Payment fail" />
      <div className="main-container">
        <Result
          status="error"
          title="Payment Fail"
          subTitle={`Hi ${user?.name || user?.username || 'there'}, your payment has been failure. Please contact us for more information.`}
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/')}>
              <HomeOutlined />
              BACK HOME
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
              <ShoppingCartOutlined />
              CONTACT US
            </Button>
          ]}
        />
      </div>
    </Layout>
  );
}

const mapStates = (state: any) => ({
  user: state.user.current
});

export default connect(mapStates)(PaymentFailure);
