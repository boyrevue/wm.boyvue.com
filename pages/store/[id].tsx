import {
  ArrowLeftOutlined,
  DollarOutlined, EyeOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import SeoMetaHead from '@components/common/seo-meta-head';
import { PerformerListProduct } from '@components/product/performer-list-product';
import { shortenLargeNumber } from '@lib/number';
import { redirect404 } from '@lib/utils';
import { addCart, clearCart } from '@redux/cart/actions';
import { productService } from '@services/index';
import {
  Avatar, Button, Carousel, Image as AntImage, Layout, message, PageHeader,
  Spin
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { CheckIcon } from 'src/icons';
import {
  IProduct,
  IUser
} from 'src/interfaces';

import style from './store.module.less';

type IProps = {
  addCartHandler: Function;
  clearCartHandler: Function;
  cart: any;
  user: IUser;
  product: IProduct;
}

function ProductViewPage({
  product,
  user,
  cart,
  addCartHandler,
  clearCartHandler
}: IProps) {
  const [fetching, setFetching] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const getRelatedProducts = async () => {
    // preload images
    product.images && product.images.forEach((img) => {
      setTimeout(() => { new Image().src = img?.url; }, 1000);
      return img;
    });
    try {
      setFetching(true);
      const resp = await productService.userSearch({
        limit: 24,
        excludedId: product._id
      });
      setRelatedProducts(resp.data.data);
      setFetching(false);
    } catch (e) {
      message.error('Error occured, could not get product details');
      setFetching(false);
    }
  };

  const updateCartLocalStorage = (item) => {
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    let newCart = [...oldCart];
    const addedProduct = oldCart.find((c) => c._id === item._id);
    if (addedProduct) {
      const { quantity } = addedProduct;
      newCart = oldCart.map((_item) => {
        if (_item._id === addedProduct._id) {
          return {
            ..._item,
            quantity: (quantity || 0) + 1
          };
        }
        return _item;
      });
    } else {
      newCart.push(item);
    }
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const onAddCart = () => {
    if (!user._id) {
      message.error('Please login or register to buy merchandise from your favorite models.');
      Router.push('/auth/login');
      return;
    }
    if (cart.items.length === 10) {
      message.error('You reached 10 items, please process payment first.');
      return;
    }
    const { stock, type, performerId } = product;
    if ((type === 'physical' && !stock) || (type === 'physical' && stock < 1)) {
      message.error('Out of stock');
      return;
    }
    if (type === 'digital' && !!cart.items.find((item) => item._id === product._id)) {
      return;
    }
    const difPerformerProducts = cart.items.filter((item) => item.performerId !== performerId);
    if (difPerformerProducts && difPerformerProducts.length) {
      if (!window.confirm('There is one or more items from another model in your cart. Would you like to clear that and add this instead?')) return;
      // clear cart before add new item from another performer
      clearCartHandler();
      localStorage.setItem('cart', '[]');
    }
    message.success('Item has been added to cart');
    addCartHandler([{ _id: product._id, quantity: 1, performerId }]);
    updateCartLocalStorage({ _id: product._id, quantity: 1, performerId });
  };

  const onBuyNow = () => {
    if (!user._id) {
      message.error('Please login or register to buy merchandise from your favorite models.');
      Router.push('/auth/login');
      return;
    }
    onAddCart();
    setTimeout(() => { Router.push('/cart'); }, 1000);
  };

  useEffect(() => {
    getRelatedProducts();
  }, [product]);

  return (
    <Layout>
      <SeoMetaHead item={product} />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title={product?.name}
        />
        <div className={style['product-card']}>
          <div className="prod-img">
            <AntImage.PreviewGroup>
              <Carousel autoplay={false} adaptiveHeight effect="fade" swipeToSlide arrows dots={false}>
                {product.images && product.images.length > 0 ? product.images.map((image) => (
                  <AntImage
                    key={image._id}
                    src={image?.url || image?.thumbnails[0]}
                    fallback="/no-image.jpg"
                    preview
                    title={image.name}
                  />
                ))
                  : <img alt="prod-thumb" src="/empty_product.svg" />}
              </Carousel>
            </AntImage.PreviewGroup>
            {product.type === 'physical' && product.stock && (
              <span className="prod-stock">
                {product.stock}
                {' '}
                in stock
              </span>
            )}
            {product.type === 'physical' && !product.stock && (
              <span className="prod-stock">Out of stock!</span>
            )}
            {product.type === 'digital' && <span className="prod-stock">{product.type}</span>}
          </div>
          <div className="prod-info">
            <p className={style['prod-price']}>
              $
              {product.price.toFixed(2)}
              <span className="dc-price">
                $
                {(product.price * 1.2).toFixed(2)}
              </span>
            </p>
            <div className="add-cart">
              <Button
                className="primary"
                disabled={user.isPerformer || (product.type === 'physical' && !product.stock)}
                onClick={onAddCart}
              >
                <ShoppingCartOutlined />
                {' '}
                Add to Cart
              </Button>
              &nbsp;
              <Button
                type="link"
                disabled={user.isPerformer || (product.type === 'physical' && !product.stock)}
                className="secondary"
                onClick={onBuyNow}
              >
                <DollarOutlined />
                {' '}
                Buy Now
              </Button>
            </div>
            <div className="prod-desc">{product.description || 'No description'}</div>
          </div>
        </div>
      </div>
      <div className="middle-split">
        <div className="main-container">
          <div className="middle-actions">
            <Link
              href={{
                pathname: '/model/[username]',
                query: { username: product?.performer?.username || product?.performer?._id }
              }}
              as={`/${product?.performer?.username || product?.performer?._id}`}
            >
              <a>
                <div className="o-w-ner">
                  <Avatar
                    alt="performer avatar"
                    src={product?.performer?.avatar || '/no-avatar.png'}
                  />
                  <span className="owner-name">
                    <span>
                      {product?.performer?.name || 'N/A'}
                      {' '}
                      {product?.performer?.verifiedAccount && <CheckIcon className="color-primary" />}
                    </span>
                    <span style={{ fontSize: '10px' }}>
                      @
                      {product?.performer?.username || 'n/a'}
                    </span>
                  </span>
                </div>
              </a>
            </Link>

            <div className="act-btns">
              <Button
                className="react-btn"
              >
                {shortenLargeNumber(product?.stats?.views || 0)}
                {' '}
                <EyeOutlined />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="main-container">
        <div className="related-items">
          <h4 className="ttl-1">You may also like</h4>
          {!fetching && relatedProducts.length > 0 && (
            <PerformerListProduct products={relatedProducts} />
          )}
          {!fetching && !relatedProducts?.length && <p>No product was found</p>}
          {fetching && <div><Spin /></div>}
        </div>
      </div>
    </Layout>
  );
}

ProductViewPage.getInitialProps = async (ctx) => {
  try {
    const resp = await productService.userView(ctx.query.id);
    return { product: resp.data };
  } catch (e) {
    return redirect404(ctx);
  }
};

const mapStates = (state: any) => ({
  cart: { ...state.cart },
  user: { ...state.user.current }
});

const mapDispatch = {
  addCartHandler: addCart,
  clearCartHandler: clearCart
};
export default connect(mapStates, mapDispatch)(ProductViewPage);
