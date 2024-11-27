import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import { TableListGallery } from '@components/gallery/table-list';
import { galleryService } from '@services/gallery.service';
import {
  Button, Col, Layout, message, PageHeader,
  Row
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IStates {
  galleries: [];
  loading: boolean;
  submiting: boolean;
  filters: {};
  sortBy: string;
  sort: string;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

class GalleryListingPage extends PureComponent<null, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  constructor(props) {
    super(props);
    this.state = {
      galleries: [],
      loading: true,
      submiting: false,
      filters: {},
      sortBy: 'createdAt',
      sort: 'desc',
      pagination: { current: 1, pageSize: 12, total: 0 }
    };
  }

  async componentDidMount() {
    this.search();
  }

  async handleSorterChange(pagination, filters, sorter) {
    const { pagination: statePagination } = this.state;
    await this.setState({
      pagination: {
        ...statePagination,
        current: pagination.current
      },
      sortBy: sorter.field || 'createdAt',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'ascend' ? 'asc' : 'desc') : ''
    });
    this.search();
  }

  async handleDeleteGallery(id: string) {
    try {
      await this.setState({ submiting: true });
      await galleryService.delete(id);
      message.success('Deleted success!');
      this.search();
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    } finally {
      this.setState({ submiting: false });
    }
  }

  async handleFilter(param) {
    const { pagination } = this.state;
    await this.setState({
      filters: param,
      pagination: {
        ...pagination,
        current: 1
      }
    });
    this.search();
  }

  async search() {
    try {
      const {
        filters, pagination, sort, sortBy
      } = this.state;
      const resp = await galleryService.search({
        ...filters,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize,
        sort,
        sortBy
      });
      this.setState({
        loading: false,
        galleries: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (error) {
      message.error('Something went wrong. Please try again!');
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      galleries, pagination, loading, submiting
    } = this.state;
    const statuses = [{
      text: 'All status',
      key: ''
    }, {
      text: 'Active',
      key: 'active'
    },
    {
      text: 'Inactive',
      key: 'inactive'
    }];

    return (
      <Layout>
        <PageTitle title="My galleries" />
        <div className="main-container">
          <div className="header-page">
            <PageHeader
              onBack={() => Router.back()}
              backIcon={<ArrowLeftOutlined />}
              title="My Galleries"
            />
            <div className="header-page-right">
              <Button type="primary">
                <Link href="/model/my-gallery/create">
                  <a>
                    <PlusOutlined />
                    {' '}
                    Create New
                  </a>
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <Row>
              <Col xl={21} md={14} xs={24}>
                <SearchFilter statuses={statuses} onSubmit={this.handleFilter.bind(this)} />
              </Col>
            </Row>
          </div>
          <div className="table-responsive">
            <TableListGallery
              dataSource={galleries}
              rowKey="_id"
              loading={loading || submiting}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleSorterChange.bind(this)}
              deleteGallery={this.handleDeleteGallery.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default GalleryListingPage;
