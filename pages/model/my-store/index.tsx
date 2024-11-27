import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import { TableListProduct } from '@components/product/table-list-product';
import { productService } from '@services/product.service';
import {
  Button, Layout, message, PageHeader
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';

class Products extends PureComponent {
  static authenticate = true;

  static onlyPerformer = true;

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

  async componentDidMount() {
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    await this.setState({
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
      const resp = await productService.search({
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
      this.setState({ searching: false });
    }
  }

  async deleteProduct(id: string) {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const { pagination } = this.state;
      await productService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: 'All status'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <Layout>
        <PageTitle title="My Store" />
        <div className="main-container">
          <div className="header-page">
            <PageHeader
              onBack={() => Router.back()}
              backIcon={<ArrowLeftOutlined />}
              title="My Store"
            />
            <div className="header-page-right">
              <Button type="primary">
                <Link href="/model/my-store/create">
                  <a>
                    <PlusOutlined />
                    {' '}
                    Upload new
                  </a>
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <SearchFilter
              statuses={statuses}
              onSubmit={this.handleFilter.bind(this)}
              searchWithKeyword
              searchWithCategory
            />
          </div>
          <div style={{ marginBottom: '20px' }} />
          <div className="table-responsive">
            <TableListProduct
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleTableChange.bind(this)}
              deleteProduct={this.deleteProduct.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default Products;
