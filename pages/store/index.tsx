import { ShoppingOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import ProductCard from '@components/product/product-card';
import { listProducts } from '@redux/product/actions';
import {
  Col, Layout, Pagination, Row, Spin
} from 'antd';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IProduct } from 'src/interfaces/';

type IProps = {
  productState: {
    requesting: boolean;
    error: any;
    success: boolean;
    items: IProduct[];
    total: number;
  };
  listProducts: Function;
}

interface IStates {
  offset: number;
  limit: number;
  filter: number;
}

class Products extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static noredirect = true;

  state = {
    offset: 0,
    limit: 12,
    filter: {
      sortBy: 'updatedAt',
      sort: -1
    } as any
  };

  componentDidMount() {
    const { listProducts: getListHandler } = this.props;
    const { limit, offset, filter } = this.state;
    getListHandler({
      ...filter,
      limit,
      offset
    });
  }

  async handleFilter(values: any) {
    const { listProducts: getListHandler } = this.props;
    const { limit, filter } = this.state;
    await this.setState({ offset: 0, filter: { ...filter, ...values } });
    getListHandler({
      ...filter,
      ...values,
      limit,
      offset: 0
    });
  }

  async pageChanged(page: number) {
    const { listProducts: getListHandler } = this.props;
    const { limit, filter } = this.state;
    await this.setState({ offset: page - 1 });
    getListHandler({
      limit,
      offset: (page - 1) * limit,
      ...filter
    });
  }

  render() {
    const {
      productState
    } = this.props;
    const {
      requesting = true, total = 0, items = []
    } = productState;
    const {
      limit, offset
    } = this.state;
    const type = [
      {
        key: '',
        text: 'All type'
      },
      {
        key: 'physical',
        text: 'Physical'
      },
      {
        key: 'digital',
        text: 'Digital'
      }
    ];

    return (
      <Layout>
        <PageTitle title="Products" />
        <div className="main-container">
          <div className="page-heading">
            <span className="box">
              <ShoppingOutlined />
              {' '}
              Products
            </span>
          </div>
          <SearchFilter
            type={type}
            searchWithKeyword
            searchWithCategory
            categoryGroup="product"
            onSubmit={this.handleFilter.bind(this)}
          />
          <div className="main-background">
            <Row>
              {items && items.length > 0
                  && !requesting
                  && items.map((p) => (
                    <Col xs={12} md={6} lg={6} key={p._id}>
                      <ProductCard
                        product={p}
                      />
                    </Col>
                  ))}
            </Row>
            {!total && !requesting && <p className="text-center">No product was found</p>}
            {requesting && <div className="text-center"><Spin /></div>}
            {total && total > limit ? (
              <div className="paging">
                <Pagination
                  current={offset + 1}
                  total={total}
                  pageSize={limit}
                  onChange={this.pageChanged.bind(this)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  productState: { ...state.product.products }
});

const mapDispatch = { listProducts };
export default connect(mapStates, mapDispatch)(Products);
