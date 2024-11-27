import { LoadingOutlined } from '@ant-design/icons';
import { getImageBase64 } from '@lib/utils';
import { message, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import getConfig from 'next/config';
import { useState } from 'react';

function beforeUpload(file) {
  const { publicRuntimeConfig: config } = getConfig();
  const isLt2M = file.size / 1024 / 1024 < (config.MAX_SIZE_FILE || 100);
  if (!isLt2M) {
    message.error(`Image must be smaller than ${config.MAX_SIZE_FILE || 100}MB!`);
  }
  return isLt2M;
}

type IProps = {
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  options?: any;
}

export function CoverUpload({
  uploadUrl = null,
  headers = null,
  options = null,
  onUploaded = () => {}
}: IProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getImageBase64(info.file.originFileObj, (imageUrl) => {
        setLoading(false);
        onUploaded && onUploaded({
          response: info.file.response,
          base64: imageUrl
        });
      });
    }
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(image.outerHTML);
  };

  return (
    <ImgCrop aspect={10 / 3} cropShape="rect" quality={1} modalTitle="Edit cover image" modalWidth={768}>
      <Upload
        accept="image/*"
        name={options.fieldName || 'file'}
        listType="picture-card"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={onPreview}
        headers={headers}
      >
        {loading ? <LoadingOutlined /> : (
          <span>
            Edit cover
          </span>
        )}
      </Upload>
    </ImgCrop>
  );
}

export default CoverUpload;
