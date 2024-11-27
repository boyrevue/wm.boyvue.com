import {
  ShoppingCartOutlined
} from '@ant-design/icons';
import { addCart } from '@redux/cart/actions';
import { cartService } from '@services/cart.service';
import { Badge, Tooltip } from 'antd';
import { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const mapState = (state: any) => ({
  loggedIn: state.auth.loggedIn,
  cart: state.cart
});

const mapDispatch = {
  addCartHandler: addCart
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function CartBadge({
  cart,
  loggedIn = false,
  addCartHandler = () => {}
}: PropsFromRedux) {
  const handleCart = () => {
    if (!cart || (cart && cart.items.length <= 0)) {
      const existCart = cartService.getCartItems();
      if (existCart && existCart.length > 0) {
        addCartHandler(existCart);
      }
    }
  };

  useEffect(() => {
    handleCart();
  }, [loggedIn]);

  return (
    <Tooltip title="Shopping">
      <style>
        {`
        .cart-total {
          position: absolute;
          top: 2px;
          right: 5px;
        }
      `}
      </style>
      <ShoppingCartOutlined />
      <Badge className="cart-total" count={cart?.total} />
    </Tooltip>
  );
}

export default connector(CartBadge);
