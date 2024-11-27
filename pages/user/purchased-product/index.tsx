import { ArrowLeftOutlined } from '@ant-design/icons';
import { OrderSearchFilter } from '@components/purchased-product';
import ProductHistoryTableList from '@components/purchased-product/table-list';
import { orderService } from '@services/index';
import { Layout, message, PageHeader } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

type IProps = {
  user: IUser;
}

class ProductPurchaseHistoryPage extends PureComponent<IProps> {
  static authenticate = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 12,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: paginationState } = this.state;
    const pager = { ...paginationState };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async search(page = 1) {
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await orderService.userSearchProduct({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const { user } = this.props;
    return (
      <Layout>
        <Head>
          <title>Product Purchases</title>
        </Head>
        <div className="main-container">
          <PageHeader
            onBack={() => Router.back()}
            backIcon={<ArrowLeftOutlined />}
            title="Product Purchases"
          />
          <OrderSearchFilter onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <ProductHistoryTableList
            user={user}
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
          />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  user: { ...state.user.current }
});
export default connect(mapStates)(ProductPurchaseHistoryPage);
