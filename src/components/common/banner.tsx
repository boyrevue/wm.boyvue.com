/* eslint-disable jsx-a11y/control-has-associated-label */
import { IBanner } from '@interfaces/banner';
import { Carousel, Image } from 'antd';

type IProps = {
  banners: IBanner[];
  arrows?: boolean;
  dots?: boolean;
  autoplay?: boolean;
  effect?: any;
  className?: string;
}

export function Banner({
  banners,
  arrows = true,
  dots = false,
  autoplay = true,
  effect = 'scrollx',
  className = ''
}: IProps) {
  return (
    banners.length > 0
      && (
        <Carousel
          className={className || null}
          effect={effect}
          adaptiveHeight
          autoplay={autoplay}
          swipeToSlide
          arrows={arrows}
          dots={dots}
        >
          {banners.map((item) => (
            <a key={item?._id} href={item?.link || null} target="_blank" rel="noreferrer">
              <Image preview={false} src={item?.photo?.url} alt="" key={item._id} />
            </a>
          ))}
        </Carousel>
      )
  );
}

export default Banner;
