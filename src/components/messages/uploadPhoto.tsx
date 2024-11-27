import { LoadingOutlined, PaperClipOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import getConfig from 'next/config';
import { useState } from 'react';

function beforeUpload(file) {
  const { publicRuntimeConfig: config } = getConfig();
  const isLt5M = file.size / 1024 / 1024 < (config._MAX_SIZE_IMAGE || 5);
  if (!isLt5M) {
    message.error(`Image is too large please provide an image ${config.MAX_SIZE_IMAGE || 5}MB or below`);
  }
  return isLt5M;
}

type IProps = {
  uploadUrl?: string;
  headers?: any;
  onUploaded: Function;
  options?: any;
  messageData?: any;
  disabled?: boolean;
}

export function ImageMessageUpload({
  onUploaded,
  uploadUrl = '',
  headers = {},
  options = {},
  messageData = null,
  disabled = false
}: IProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      onUploaded && onUploaded({
        response: info.file.response
      });
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PaperClipOutlined />}
    </div>
  );
  return (
    <Upload
      disabled={disabled || loading}
      accept={'image/*'}
      name={options.fieldName || 'file'}
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action={uploadUrl}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      headers={headers}
      data={messageData}
    >
      {uploadButton}
    </Upload>
  );
}

export default ImageMessageUpload;
