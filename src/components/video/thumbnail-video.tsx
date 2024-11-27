import { IVideo } from 'src/interfaces';

type IProps = {
  video: IVideo;
  style?: any;
}

export function ThumbnailVideo({
  video,
  style = null
}: IProps) {
  const { thumbnail, video: videoProp, teaser } = video;
  const url = (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || thumbnail?.url || (teaser?.thumbnails && teaser?.thumbnails[0]) || (videoProp?.thumbnails && videoProp?.thumbnails[0]) || '/placeholder-image.jpg';
  return (
    <img alt="thumbnail" src={url} style={style || { width: '50px' }} />
  );
}

export default ThumbnailVideo;
