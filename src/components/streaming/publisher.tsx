/* eslint-disable camelcase */
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import withAntmedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import {
  WebRTCAdaptorConfigs,
  WebRTCAdaptorProps
} from 'src/antmedia/interfaces';
import { LocalStream } from 'src/antmedia/LocalStream';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import MicControlsPlugin from 'src/videojs/mic-controls/plugin';
import videojs from 'video.js';

const SwitchVideoDevice = dynamic(() => import('./switch-video-device'), { ssr: false });

interface IProps extends WebRTCAdaptorProps {
  settings: StreamSettings;
  configs: Partial<WebRTCAdaptorConfigs>;
  setStreamRef?: Function;
}

class Publisher extends PureComponent<IProps> {
  private publisher: videojs.Player;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    setStreamRef: () => { }
  };

  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    const { setStreamRef = null } = this.props;
    if (setStreamRef) {
      setStreamRef({
        start: this.start.bind(this),
        publish: this.publish.bind(this)
      });
    }

    (videojs as any).registerPlugin('webRTCMicControlsPlugin', MicControlsPlugin);
    Router.events.on('routeChangeStart', this.onbeforeunload);
    // window.addEventListener('beforeunload', this.onbeforeunload);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.onbeforeunload);
    // window.removeEventListener('beforeunload', this.onbeforeunload);
  }

  onbeforeunload = () => {
    if (this.publisher) {
      this.publisher.dispose();
      this.publisher = undefined;
    }
  };

  async startPublishing(idOfStream: string) {
    const { webRTCAdaptor, leaveSession, settings } = this.props;
    try {
      const token = await streamService.getPublishToken({
        streamId: idOfStream,
        settings
      });
      webRTCAdaptor.publish(idOfStream, token);
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
      leaveSession();
    }
  }

  publish(streamId: string) {
    // const { initialized } = this.props;
    // initialized && this.startPublishing(streamId);
    this.startPublishing(streamId);
  }

  start() {
    const { initWebRTCAdaptor, initialized, publish_started } = this.props;
    const { onTrack } = this.props;
    if (initialized && !publish_started && onTrack) {
      this.startPublishing(onTrack);
    }

    initWebRTCAdaptor(this.handelWebRTCAdaptorCallback.bind(this));
  }

  handelWebRTCAdaptorCallback(info: WEBRTC_ADAPTOR_INFORMATIONS, obj: any) {
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      // if (!isMobile) {
      //   const { configs, muteLocalMic, unmuteLocalMic } = this.props;
      //   const player = videojs(configs.localVideoId, {
      //     liveui: true,
      //     controls: true,
      //     muted: true,
      //     bigPlayButton: false,
      //     controlBar: {
      //       playToggle: false,
      //       currentTimeDisplay: false,
      //       volumePanel: false,
      //       pictureInPictureToggle: false
      //     }
      //   });
      //   // Remove hidden attribbute
      //   player.el().removeAttribute('hidden');
      //   player.on('error', () => {
      //     player.error(null);
      //   });
      //   player.one('play', () => {
      //     // eslint-disable-next-line dot-notation
      //     player['webRTCMicControlsPlugin']({
      //       muteLocalMic,
      //       unmuteLocalMic,
      //       isMicMuted: false
      //     });
      //     this.publisher = player;
      //   });
      // }
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_STARTED || info === WEBRTC_ADAPTOR_INFORMATIONS.SESSION_RESTORED_DESCRIPTION) {
      const { switchCanvasStream } = this.props;
      if (isMobile) {
        switchCanvasStream(obj.streamId);
      }
    }
  }

  render() {
    const {
      initialized,
      // publish_started,
      classNames,
      configs: { localVideoId }
    } = this.props;

    return (
      <>
        <div>
          <LocalStream
            id={localVideoId}
            hidden={!initialized}
            className={classNames}
          />
          <SwitchVideoDevice />
        </div>
        {/* {publish_started && (
          <div className="text-center">
            <span className={style.publishing}>Publishing</span>
          </div>
        )} */}
      </>
    );
  }
}

export default withAntmedia<{}>(Publisher);
