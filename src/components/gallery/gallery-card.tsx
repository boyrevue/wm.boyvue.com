import {
  CameraOutlined, CommentOutlined,
  EyeOutlined, LikeOutlined, PictureOutlined
} from '@ant-design/icons';
import { shortenLargeNumber } from '@lib/number';
import { message } from 'antd';
import Router from 'next/router';
import { connect } from 'react-redux';
import { IGallery, IUser } from 'src/interfaces';

import style from './gallery-card.module.less';

interface GalleryCardIProps {
  gallery: IGallery;
  user: IUser;
}

function GalleryCard({ gallery, user }: GalleryCardIProps) {
  const thumbUrl = gallery?.coverPhoto?.thumbnails[0] || gallery?.coverPhoto?.url || '/placeholder-image.jpg';
  return (
    <div
      aria-hidden
      onClick={() => {
        if (!user?._id) {
          message.error('Please login or register to check out galleries!');
          Router.push('/auth/login');
          return;
        }
        if (user?.isPerformer && gallery?.performerId !== user?._id) return;
        if (user && !gallery?.isSubscribed) {
          message.error({
            content: `Please subscribe to ${gallery?.performer?.name || gallery?.performer?.username || 'the model'} to view content`,
            key: 'err-view-content'
          });
          return;
        }
        window.scrollTo(0, 0);
        Router.push({ pathname: '/gallery/[id]', query: { id: gallery?.slug || gallery?._id } }, `/${gallery?.performer?.username}/gallery/${gallery?.slug || gallery?._id}`);
      }}
      className={style['photo-card']}
      style={{
        backgroundImage: `url(${thumbUrl})`,
        // cursor: (!user?._id || (user?.isPerformer && gallery?.performerId !== user?._id) || !gallery?.isSubscribed) ? 'not-allowed' : 'pointer'
        cursor: !user?._id ? 'not-allowed' : 'pointer'
      }}
    >
      {gallery?.isSale && gallery?.price > 0 && (
        <span className="photo-price">
          <div className="label-price">
            $
            {(gallery?.price || 0).toFixed(2)}
          </div>
        </span>
      )}
      <span className="play-ico"><CameraOutlined /></span>
      <div className="photo-stats">
        <div className="like">
          <span>
            <EyeOutlined />
            {' '}
            {shortenLargeNumber(gallery?.stats?.views || 0)}
          </span>
          <span>
            <LikeOutlined />
            {' '}
            {shortenLargeNumber(gallery?.stats?.likes || 0)}
          </span>
          <span>
            <CommentOutlined />
            {' '}
            {shortenLargeNumber(gallery?.stats?.comments || 0)}
          </span>
        </div>
        <div className="duration">
          <PictureOutlined />
          {' '}
          {gallery?.numOfItems || 0}
        </div>
      </div>
      <div className="photo-info">
        {gallery?.name}
      </div>
    </div>
  );
}

const mapProps = (state) => ({
  user: state.user.current
});

export default connect(mapProps, {})(GalleryCard);
