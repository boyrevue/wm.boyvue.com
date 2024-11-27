/* eslint-disable camelcase */
import Router from 'next/router';
import React, { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import withAntmedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import { WebRTCAdaptorConfigs, WebRTCAdaptorProps } from 'src/antmedia/interfaces';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import { SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';
import videojs from 'video.js';

interface IProps extends WebRTCAdaptorProps {
  settings: StreamSettings;
  configs: Partial<WebRTCAdaptorConfigs>;
  setStreamRef?: Function;
}

interface States {
  conversationId: string;
  streamId: string;
}

class Publisher extends PureComponent<IProps, States> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    setStreamRef: () => { }
  };

  private publisher: videojs.Player;

  constructor(props: IProps) {
    super(props);
    this.state = {
      conversationId: null,
      streamId: null
    };
  }

  componentDidMount() {
    const { setStreamRef = null } = this.props;
    if (setStreamRef) {
      setStreamRef({
        start: this.start.bind(this),
        stop: this.stop.bind(this),
        publish: this.publish.bind(this)
      });
    }

    Router.events.on('routeChangeStart', this.onbeforeunload);
    window.addEventListener('beforeunload', this.onbeforeunload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  onbeforeunload = () => {
    const { publish_started, webRTCAdaptor } = this.props;
    const { conversationId, streamId } = this.state;
    if (streamId && publish_started) {
      webRTCAdaptor && webRTCAdaptor.leaveFromRoom(conversationId);
      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      socket.emit('private-stream/leave', {
        conversationId,
        streamId
      });
    }

    if (this.publisher) {
      this.publisher.dispose();
      this.publisher = undefined;
    }

    this.setState({
      conversationId: null,
      streamId: null
    });
  };

  async handelWebRTCAdaptorCallback(info: WEBRTC_ADAPTOR_INFORMATIONS, obj: any) {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      webRTCAdaptor, settings, configs
    } = this.props;
    const { conversationId, streamId } = this.state;
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
      webRTCAdaptor.joinRoom(conversationId, streamId);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.JOINED_THE_ROOM) {
      const token = await streamService.getPublishToken({ streamId, settings });
      webRTCAdaptor.publish(streamId, token);
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_STARTED || info === WEBRTC_ADAPTOR_INFORMATIONS.SESSION_RESTORED_DESCRIPTION) {
      // if (!isMobile) {
      //   const player = videojs(configs.localVideoId, {
      //     liveui: true,
      //     controls: true,
      //     muted: true,
      //     bigPlayButton: false,
      //     controlBar: {
      //       playToggle: false,
      //       currentTimeDisplay: false,
      //       fullscreenToggle: false,
      //       pictureInPictureToggle: false,
      //       volumePanel: false
      //     }
      //   });
      //   player.on('error', () => {
      //     player.error(null);
      //   });
      //   player.one('play', () => {
      //     this.publisher = player;
      //   });
      // }

      const { switchCanvasStream } = this.props;
      if (isMobile) {
        switchCanvasStream(obj.streamId);
      }

      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      socket.emit('private-stream/join', {
        conversationId,
        streamId: obj.streamId
      });
    } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_FINISHED) {
      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      socket.emit('private-stream/leave', {
        conversationId,
        streamId: obj.streamId
      });
    }
  }

  start(conversationId: string) {
    this.setState({ conversationId });
  }

  publish(streamId: string) {
    const { initWebRTCAdaptor } = this.props;
    this.setState({ streamId });
    initWebRTCAdaptor(this.handelWebRTCAdaptorCallback.bind(this));
  }

  stop() {
    const { leaveSession } = this.props;
    leaveSession && leaveSession();
  }

  render() {
    const { publish_started, configs } = this.props;

    return (
      <video
        disablePictureInPicture
        id={configs.localVideoId}
        className="video-js broadcaster"
        hidden={!publish_started}
        autoPlay
        playsInline
        muted
      />
    );
  }
}

Publisher.contextType = SocketContext;
export default withAntmedia(Publisher);
