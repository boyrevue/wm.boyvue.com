import { Col, Row } from 'antd';
import { IVideo } from 'src/interfaces/video';

import VideoCard from './video-card';

type IProps = {
  videos: IVideo[];
}

export function PerformerListVideo({ videos }: IProps) {
  return (
    <Row>
      {videos.length > 0
        && videos.map((video: IVideo) => {
          if (!video) return null;
          return (
            <Col xs={12} sm={12} md={12} lg={8} key={video?._id}>
              <VideoCard video={video} />
            </Col>
          );
        })}
    </Row>
  );
}

export default PerformerListVideo;
