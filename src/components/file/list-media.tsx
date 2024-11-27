import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button, Progress, Upload
} from 'antd';
import { PureComponent } from 'react';

import style from './list-media.module.less';

type IProps = {
  remove: Function;
  files: any[];
  beforeUpload: Function;
  uploading: boolean;
}
export default class UploadFileList extends PureComponent<IProps> {
  render() {
    const {
      files, remove, uploading, beforeUpload
    } = this.props;
    return (
      <div className={style['f-upload-list']}>
        <div className="list-img-upoad">
          {files && files.length > 0 && files.map((file) => (
            <div className="f-upload-item" key={file._id || file.uid}>
              <div className="f-upload-thumb">
                <a href={file.url} target="_blank" rel="noreferrer"><img alt="img" src={file?.thumbnail || (file.thumbnails && file.thumbnails[0]) || file.url} width="100%" /></a>
              </div>
              {file.status !== 'uploading'
              && (
                <span className="f-remove">
                  <Button type="primary" onClick={() => remove(file)}>
                    <DeleteOutlined />
                  </Button>
                </span>
              )}
              {file.percent && <Progress percent={Math.round(file.percent)} />}
            </div>
          ))}
        </div>
        <div className="add-more">
          <Upload
            customRequest={() => true}
            accept={'image/*'}
            beforeUpload={beforeUpload.bind(this)}
            multiple
            showUploadList={false}
            disabled={uploading}
            listType="picture"
          >
            <PlusOutlined />
            {' '}
            Upload File
          </Upload>
        </div>
      </div>
    );
  }
}
