import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import { SearchFilter } from '@components/common/search-filter';
import { TableListVideo } from '@components/video/table-list';
import { videoService } from '@services/video.service';
import {
  Button, Col, Layout, message, PageHeader,
  Row
} from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';

class ModelVideos extends PureComponent {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const { pagination: paginationVal } = this.state;
    const pager = { ...paginationVal };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    try {
      const {
        filter, limit, sort, sortBy, pagination
      } = this.state;
      await this.setState({ searching: true });
      const resp = await videoService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      this.setState({
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

  async deleteVideo(id: string) {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    try {
      const { pagination } = this.state;
      await videoService.delete(id);
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
        text: 'All Status'
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
        <PageTitle title="My videos" />
        <div className="main-container">
          <div className="header-page">
            <PageHeader
              onBack={() => Router.back()}
              backIcon={<ArrowLeftOutlined />}
              title="My Videos"
            />
            <div className="header-page-right">
              <Button type="primary">
                <Link href="/model/my-video/upload">
                  <a>
                    {' '}
                    <PlusOutlined />
                    {' '}
                    Upload new
                  </a>
                </Link>
              </Button>
              &nbsp;
              <Button>
                <Link href="/model/my-video/bulk-upload">
                  <a>
                    <PlusOutlined />
                    {' '}
                    Bulk upload
                  </a>
                </Link>
              </Button>
            </div>
          </div>
          <Row>
            <Col md={16} xs={24}>
              <SearchFilter
                searchWithKeyword
                statuses={statuses}
                onSubmit={this.handleFilter.bind(this)}
              />
            </Col>
          </Row>
          <div className="table-responsive">
            <TableListVideo
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleTableChange.bind(this)}
              onDelete={this.deleteVideo.bind(this)}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

export default ModelVideos;
