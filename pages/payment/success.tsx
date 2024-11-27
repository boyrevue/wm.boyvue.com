import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { clearCart } from '@redux/cart/actions';
import { Button, Layout, Result } from 'antd';
import Router from 'next/router';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

type IProps = {
  user: IUser;
  clearCartHandler: Function;
}

function PaymentSuccess({
  user,
  clearCartHandler
}: IProps) {
  useEffect(() => {
    setTimeout(() => { clearCartHandler(); }, 1000);
    localStorage.setItem('cart', JSON.stringify([]));
  }, []);

  return (
    <Layout>
      <PageTitle title="Payment success" />
      <div className="main-container">
        <Result
          status="success"
          title="Payment Success"
          subTitle={`Hi ${user?.name || user?.username || 'there'}, your payment has been successfully processed`}
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/')}>
              <HomeOutlined />
              BACK HOME
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/store')}>
              <ShoppingCartOutlined />
              GO SHOPPING
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

const mapDispatch = { clearCartHandler: clearCart };
export default connect(mapStates, mapDispatch)(PaymentSuccess);
