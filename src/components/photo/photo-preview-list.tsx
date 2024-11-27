import { LockOutlined } from '@ant-design/icons';
import { PurchasePhotoForm } from '@components/photo/purchase-photo-form';
import { Image, Modal } from 'antd';
import { useMemo, useState } from 'react';
import { IPhotos } from 'src/interfaces';

type IProps = {
  photos: IPhotos[];
  isBlur: boolean;
}

function PhotoPreviewList({
  photos,
  isBlur
}: IProps) {
  const [openModal, setOpenModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const parsePhotos = useMemo(() => photos?.map((item) => {
    let preview = item.photo?.blurImage || '/no-image.jpg';
    let src = preview;
    if (isBlur) {
      if (!preview && item.photo?.thumbnails?.length) {
        preview = item.photo?.thumbnails[0];
      }
    } else {
      src = item.photo?.url;
      if (!src && item.photo?.thumbnails?.length) src = item.photo?.thumbnails[0];
    }
    return ({
      ...item,
      preview,
      src
    });
  }), [photos]);

  return (
    <Image.PreviewGroup>
      {parsePhotos.map((item) => (
        <div key={item._id} className={`photo-card ${!isBlur ? '' : 'blur'}`}>
          <Image
            src={item.src}
            preview={{
              src: item.preview
            }}
          />
          {item.isSale && !item.isBought && (
          <div className="purchase-block">
            <p>
              Unlock photo for $
              {item.price}
            </p>
            <p><LockOutlined onClick={() => { setOpenModal(true); setCurrentPhoto(item); }} /></p>
          </div>
          )}

          <Modal
            centered
            width={500}
            title="Purchase Photo"
            footer={null}
            visible={openModal}
            onCancel={() => { setOpenModal(false); setCurrentPhoto(null); }}
            destroyOnClose
          >
            <PurchasePhotoForm photo={currentPhoto} />
          </Modal>
        </div>
      ))}
    </Image.PreviewGroup>
  );
}
export default PhotoPreviewList;
