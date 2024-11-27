import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { getImageBase64 } from '@lib/utils';
import { message, Upload } from 'antd';
import getConfig from 'next/config';
import { useState } from 'react';

type IProps = {
  imageUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  onFileRead?: Function;
  options?: any;
  accept?: string;
}

export function ImageUpload({
  imageUrl = '',
  uploadUrl = '',
  headers = {},
  onUploaded = () => {},
  onFileRead = () => {},
  options = {},
  accept = null
}: IProps) {
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState(imageUrl);

  const beforeUpload = (file) => {
    const { publicRuntimeConfig: config } = getConfig();
    const isLt5M = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 15);
    if (!isLt5M) {
      message.error(`Image must be smaller than ${config.MAX_SIZE_IMAGE || 15}MB!`);
      return false;
    }
    const uploadNow = !!uploadUrl;

    if (!uploadNow && onFileRead) {
      onFileRead && onFileRead(file);
      getImageBase64(file, (base64) => {
        setImgUrl(base64);
        setLoading(false);
      });
    }

    return uploadNow;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      onFileRead && onFileRead(info.file.originFileObj);
      // Get this url from response in real world.
      getImageBase64(info.file.originFileObj, (base64) => {
        setImgUrl(base64);
        setLoading(false);

        onUploaded
          && onUploaded({
            response: info.file.response,
            base64: imageUrl
          });
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <CameraOutlined />}
    </div>
  );
  return (
    <Upload
      accept={accept || 'image/*'}
      name={options.fieldName || 'file'}
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action={uploadUrl}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      headers={headers}
    >
      {imgUrl && <img src={imgUrl} alt="file" style={{ width: '100%' }} />}
      {uploadButton}
    </Upload>
  );
}
