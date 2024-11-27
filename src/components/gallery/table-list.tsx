import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { CoverGallery } from '@components/gallery/cover-gallery';
import { formatDate } from '@lib/date';
import { Button, Table, Tag } from 'antd';
import Link from 'next/link';

type IProps = {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteGallery?: Function;
}

export function TableListGallery({
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange,
  deleteGallery = () => {}
}: IProps) {
  const columns = [
    {
      title: '#',
      render(data) {
        return <CoverGallery gallery={data} />;
      }
    },
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Total Photos',
      dataIndex: 'numOfItems'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'inactive':
            return <Tag color="default">Inactive</Tag>;
          default:
            break;
        }
        return <Tag color="default">{status}</Tag>;
      }
    },
    {
      title: 'Last update',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      render: (data, record) => (
        <div>
          <Button className="info">
            <Link
              href={{
                pathname: '/model/my-gallery/update',
                query: { id: record._id }
              }}
            >
              <a>
                <EditOutlined />
              </a>
            </Link>
          </Button>
          <Button
            onClick={() => deleteGallery && deleteGallery(record._id)}
            className="danger"
          >
            <DeleteOutlined />
          </Button>
        </div>
      )
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        onChange={onChange.bind(this)}
        scroll={{ x: true }}
      />
    </div>
  );
}

export default TableListGallery;
