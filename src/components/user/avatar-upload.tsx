import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { getImageBase64 } from '@lib/utils';
import { message, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import getConfig from 'next/config';
import { useState } from 'react';

function beforeUpload(file) {
  const { publicRuntimeConfig: config } = getConfig();
  const isLt2M = file.size / 1024 / 1024 < (config.MAX_SIZE_IMAGE || 5);
  if (!isLt2M) {
    message.error(`Image must be smaller than ${config.MAX_SIZE_IMAGE || 5}MB!`);
  }
  return isLt2M;
}

type IProps = {
  image?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
}

export function AvatarUpload({
  image = undefined,
  uploadUrl = undefined,
  headers = undefined,
  onUploaded = () => {}
}: IProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(image || '');

  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getImageBase64(info.file.originFileObj, (imgUrl) => {
        setImageUrl(imgUrl);
        setLoading(false);
        onUploaded && onUploaded({
          response: info.file.response,
          base64: imgUrl
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
    const img = new Image();
    img.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(img.outerHTML);
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <CameraOutlined />}
    </div>
  );
  return (
    <ImgCrop rotationSlider cropShape="round" quality={1} modalTitle="Edit Avatar" modalWidth={768}>
      <Upload
        accept="image/*"
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={onPreview}
        headers={headers}
      >
        {imageUrl && (
          <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
        )}
        {uploadButton}
      </Upload>
    </ImgCrop>
  );
}

export default AvatarUpload;
