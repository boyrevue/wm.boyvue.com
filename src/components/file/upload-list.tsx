/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import {
  DeleteOutlined, FileDoneOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { SetPhotoPrice } from '@components/photo/set-price-from';
import { getResponseError } from '@lib/utils';
import { photoService } from '@services/photo.service';
import { message, Modal, Progress } from 'antd';
import { PureComponent } from 'react';

import style from './upload-list.module.less';

type IProps = {
  remove: Function;
  setCover: Function;
  files: any[];
}

interface IStates {
  currentPhoto: any;
  openModal: boolean;
  loading: boolean;
}
export default class PhotoUploadList extends PureComponent<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      currentPhoto: {},
      openModal: false,
      loading: false
    };
  }

  setPhotoPrice = async (data) => {
    const { currentPhoto } = this.state;
    try {
      this.setState({ loading: true });
      await photoService.update(currentPhoto._id, data);
      message.success('Update photo\'s price successfully');
      this.setState({ currentPhoto: {}, openModal: false });
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(getResponseError(err));
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { files, remove, setCover } = this.props;
    const { currentPhoto, openModal, loading } = this.state;
    return (
      <>
        <div className="ant-upload-list ant-upload-list-picture">
          {files.length > 0 && files.map((file) => (
            <div
              className="ant-upload-list-item ant-upload-list-item-uploading ant-upload-list-item-list-type-picture"
              key={file._id || file.uid}
              style={{ height: 'auto' }}
            >
              <div className={style['photo-upload-list']}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="photo-thumb">
                    {(file?._id && <img src={file?.photo?.thumbnails && file?.photo?.thumbnails[0]} alt="thumb-id" />) || (file.uid && file.thumbUrl && <img alt="thumb" src={file.thumbUrl} />) || <PictureOutlined />}
                  </div>
                  <div>
                    <p>
                      {`${file?.name || file?.title} | ${((file?.size || file?.photo?.size) / (1024 * 1024)).toFixed(2)} MB`}
                      {' '}
                      {file._id && <FileDoneOutlined style={{ color: 'green' }} />}
                    </p>
                    <div>
                      {file.isGalleryCover && (
                        <a aria-hidden>
                          Cover IMG
                        </a>
                      )}
                      {!file.isGalleryCover && file._id && (
                        <a aria-hidden onClick={setCover.bind(this, file)}>
                          Set as Cover IMG
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {file.percent !== 100 && (
                  <>
                    <a aria-hidden className="remove-photo" onClick={remove.bind(this, file)}>
                      <DeleteOutlined />
                    </a>
                    {/* {file?.photo?.url && (
                    <a aria-hidden className="set-price" onClick={() => this.setState({ currentPhoto: file, openModal: true })}>
                      <DollarCircleOutlined />
                    </a>
                    )} */}
                  </>
                )}
                {file.percent ? (
                  <Progress percent={Math.round(file.percent)} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <Modal
          centered
          width={350}
          title={null}
          footer={null}
          visible={openModal}
          onCancel={() => this.setState({ openModal: false, currentPhoto: {} })}
          destroyOnClose
        >
          <SetPhotoPrice
            photo={currentPhoto}
            submit={this.setPhotoPrice}
            loading={loading}
          />
        </Modal>
      </>
    );
  }
}
