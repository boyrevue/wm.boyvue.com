import { IFeed } from '@interfaces/feed';
import {
  Carousel, Image,
  Spin
} from 'antd';
import dynamic from 'next/dynamic';

import style from './index.module.less';

const VideoPlayer = dynamic(() => import('@components/video/video-player'), {
  ssr: false
});

interface IProps {
  feed: IFeed;
}

export function FeedSlider({
  feed
}: IProps) {
  const images = feed.files && feed.files.filter((f) => f.type === 'feed-photo');
  const videos = feed.files && feed.files.filter((f) => f.type === 'feed-video');
  let processing = false;
  videos && videos.forEach((f) => {
    if (f.status !== 'finished') {
      processing = true;
    }
  });

  return (
    <div className={style['feed-slider']}>
      {!processing && feed?.files?.length > 0 && (
        <>
          {images.length > 0 && (
            <Carousel swipeToSlide arrows dots={false} effect="fade">
              {images.map((img) => (
                <Image
                  key={img._id}
                  src={img.url}
                  placeholder={(
                    <Image
                      preview={false}
                      src={img.preview || (img.thumbnails?.length ? img.thumbnails[0] : undefined) || img.url}
                      loading="lazy"
                      width="100%"
                    />
                  )}
                  fallback="/no-image.jpg"
                  loading="lazy"
                  width="100%"
                  alt="img"
                />
              ))}
            </Carousel>
          )}
          {videos?.length > 0 && videos.map((vid) => (
            <VideoPlayer
              key={vid._id}
              id={vid._id}
              pauseHiddenVideo
              {...{
                autoplay: false,
                controls: true,
                playsinline: true,
                sources: [
                  {
                    src: vid.url,
                    type: 'video/mp4'
                  }
                ],
                poster: vid.thumbnails?.length ? vid.thumbnails[0] : undefined
              }}
            />
          ))}
        </>
      )}
      {processing && (
        <div className="proccessing">
          <Spin />
          <p>Your media is currently proccessing</p>
        </div>
      )}
    </div>
  );
}

export default FeedSlider;
