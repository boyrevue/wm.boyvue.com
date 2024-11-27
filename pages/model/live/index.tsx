import './live.module.less';

import { CloseOutlined } from '@ant-design/icons';
import ChatBox from '@components/stream-chat/chat-box';
import StreamingChatUsers from '@components/stream-chat/streaming-chat-view';
import LivePublisher from '@components/streaming/publisher';
import { getResponseError } from '@lib/utils';
import {
  getStreamConversation,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import {
  Button, Col, message,
  Modal,
  Row
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { ContextType, PureComponent } from 'react';
import { connect } from 'react-redux';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import {
  RefreshIcon, UsersIcon, WalletIcon
} from 'src/icons';
import { IUser } from 'src/interfaces';
import { streamService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

// eslint-disable-next-line no-shadow
enum EVENT_NAME {
  ROOM_INFORMATIOM_CHANGED = 'public-room-changed'
}

type IProps = {
  resetStreamMessage: Function;
  getStreamConversation: Function;
  activeConversation: any;
  currentUser: any;
}

interface IStates {
  loading: boolean;
  sessionId: string;
  initialized: boolean;
  total: number;
  members: IUser[];
  openUserModal,
  // mutedPlayer: boolean,
}

class PerformerLivePage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  private publisherRef: any;

  private publisherRef2: any;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,
      initialized: false,
      sessionId: '',
      total: 0,
      members: [],
      openUserModal: false
      // mutedPlayer: false
    };
  }

  componentDidMount() {
    this.joinPublicRoom();
    window.addEventListener('beforeunload', this.onbeforeunload);
    Router.events.on('routeChangeStart', this.onbeforeunload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  // handleAudio() {
  //   const { mutedPlayer } = this.state;
  //   this.setState({ mutedPlayer: !mutedPlayer });
  //   if (this.publisherRef.current) {
  //     this.publisherRef.player.muted(mutedPlayer);
  //   }
  //   if (this.publisherRef2.current) {
  //     this.publisherRef2.player.muted(mutedPlayer);
  //   }
  // }

  handler({ total, members }) {
    this.setState({ total, members });
  }

  onbeforeunload = () => {
    this.leavePublicRoom();
  };

  setStreamRef = (dataFunc) => {
    this.publisherRef2 = dataFunc;
  };

  leavePublicRoom() {
    const { activeConversation, resetStreamMessage: reset } = this.props;
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (socket && activeConversation && activeConversation.data) {
      const conversation = { ...activeConversation.data };
      socket.emit('public-stream/leave', { conversationId: conversation._id });
      reset();
    }
  }

  async start() {
    this.setState({ loading: true });

    try {
      const resp = await streamService.goLive();
      const { sessionId } = resp.data;
      await this.setState({ sessionId });
      if (this.publisherRef.start) this.publisherRef.start();
      else this.publisherRef2.start();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error_broadcast', await e);
    } finally {
      this.setState({ loading: false });
    }
  }

  stop() {
    const { initialized } = this.state;
    if (!initialized) {
      this.leavePublicRoom();
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      return;
    }

    if (window.confirm('Are you sure want to stop this live streaming!')) {
      // notify left room first
      this.leavePublicRoom();
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  async callback(info: WEBRTC_ADAPTOR_INFORMATIONS) {
    const { activeConversation } = this.props;
    const { sessionId } = this.state;
    if (activeConversation && activeConversation.data) {
      if (info === WEBRTC_ADAPTOR_INFORMATIONS.INITIALIZED) {
        await this.setState({ initialized: true });
        // window['webRTCAdaptor'].publish(sessionId);
        if (this.publisherRef.publish) this.publisherRef.publish(sessionId);
        else this.publisherRef2.publish(sessionId);
      } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_STARTED || info === WEBRTC_ADAPTOR_INFORMATIONS.SESSION_RESTORED_DESCRIPTION) {
        const conversation = { ...activeConversation.data };
        const { getSocket } = this.context as ISocketContext;
        const socket = getSocket();
        socket.emit('public-stream/live', { conversationId: conversation._id });
        this.setState({ loading: false });
      } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_FINISHED) {
        this.setState({ loading: false });
      } else if (info === WEBRTC_ADAPTOR_INFORMATIONS.CLOSED) {
        this.setState({ loading: false, initialized: false });
      }
    }
  }

  async joinPublicRoom() {
    try {
      this.setState({ loading: true });
      const resp = await streamService.goLive();
      const { conversation } = resp.data;

      const { getStreamConversation: dispatchGetStreamConversation } = this.props;
      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      if (conversation && conversation._id) {
        dispatchGetStreamConversation({
          conversation
        });
        socket?.emit('public-stream/join', {
          conversationId: conversation._id
        });
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      loading, initialized, members, total, openUserModal
    } = this.state;
    const { currentUser } = this.props;
    const canLive = currentUser.verifiedDocument && currentUser.status === 'active';

    return (
      <>
        <Head>
          <title>Go Live</title>
        </Head>
        <Event
          event={EVENT_NAME.ROOM_INFORMATIOM_CHANGED}
          handler={this.handler.bind(this)}
        />
        <div className="main-container page-streaming page-streaming-model">
          <Row className="streaming-container">
            <Col xs={24} sm={24} md={12}>
              <div className="show-streaming">
                <div className="left-top-streaming">
                  {initialized && (
                  <>
                    <div>
                      {/* <CallTime start={started} /> */}
                      00:00:00
                    </div>
                    <div>
                      <WalletIcon />
                      {(currentUser.balance || 0).toFixed(1)}
                      0
                    </div>
                    <div>
                      Received:
                      {' '}
                      {/* {receivedToken} */}
                      0
                    </div>
                  </>
                  )}
                </div>
                <div className="right-top-streaming">
                  <Button onClick={() => Router.back()} className="close-streaming"><CloseOutlined /></Button>
                </div>
                <div className="show-streaming-box" hidden={initialized}>
                  <div className="show-streaming-center">
                    <div className="box-streaming-center">
                      <div className="streaming-content">
                        <span className="icon-streaming">
                          <svg height="1em" viewBox="-16 0 512 512.00113" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <g fill="currentColor">
                              <path d="m262.84375 140.558594c-12.699219 12.671875-33.28125 12.671875-45.980469 0-12.695312-12.671875-12.695312-33.21875 0-45.890625 12.699219-12.671875 33.28125-12.671875 45.980469 0 12.695312 12.671875 12.695312 33.21875 0 45.890625zm0 0" />
                              <path d="m307.257812 189.726562c-3.960937 0-7.921874-1.511718-10.9375-4.539062-6.03125-6.039062-6.019531-15.824219.019532-21.851562 12.238281-12.214844 18.976562-28.453126 18.976562-45.722657s-6.738281-33.507812-18.976562-45.722656c-6.039063-6.03125-6.050782-15.8125-.019532-21.855469 6.027344-6.039062 15.8125-6.050781 21.851563-.019531 18.089844 18.054687 28.050781 42.058594 28.050781 67.597656 0 25.535157-9.960937 49.542969-28.050781 67.597657-3.015625 3.011718-6.964844 4.515624-10.914063 4.515624zm0 0" />
                              <path d="m342.210938 235.222656c-3.960938 0-7.921876-1.511718-10.9375-4.535156-6.03125-6.042969-6.019532-15.824219.019531-21.855469 24.414062-24.367187 37.863281-56.761719 37.863281-91.21875s-13.449219-66.851562-37.863281-91.21875c-6.039063-6.03125-6.050781-15.8125-.019531-21.855469 6.03125-6.039062 15.8125-6.050781 21.851562-.019531 30.265625 30.207031 46.9375 70.371094 46.933594 113.09375 0 42.722657-16.667969 82.890625-46.933594 113.097657-3.015625 3.007812-6.964844 4.511718-10.914062 4.511718zm0 0" />
                              <path d="m172.371094 189.726562c-3.949219 0-7.898438-1.503906-10.917969-4.515624-18.089844-18.054688-28.050781-42.0625-28.050781-67.597657 0-25.539062 9.960937-49.542969 28.050781-67.597656 6.039063-6.03125 15.824219-6.023437 21.851563.019531 6.03125 6.039063 6.019531 15.824219-.019532 21.855469-12.238281 12.214844-18.976562 28.453125-18.976562 45.722656s6.738281 33.507813 18.976562 45.722657c6.039063 6.027343 6.050782 15.8125.019532 21.851562-3.015626 3.023438-6.976563 4.539062-10.933594 4.539062zm0 0" />
                              <path d="m137.417969 235.222656c-3.953125 0-7.902344-1.503906-10.917969-4.515625-30.265625-30.207031-46.933594-70.371093-46.933594-113.09375 0-42.726562 16.667969-82.890625 46.933594-113.097656 6.039062-6.027344 15.824219-6.019531 21.851562.023437 6.03125 6.039063 6.019532 15.820313-.019531 21.851563-24.414062 24.367187-37.863281 56.761719-37.863281 91.21875s13.449219 66.855469 37.863281 91.222656c6.039063 6.03125 6.050781 15.8125.019531 21.855469-3.015624 3.023438-6.976562 4.535156-10.933593 4.535156zm0 0" />
                              <path d="m443.480469 261.9375h-407.332031c-19.964844 0-36.148438 16.183594-36.148438 36.144531v177.769531c0 19.964844 16.183594 36.148438 36.148438 36.148438h407.328124c19.964844 0 36.148438-16.183594 36.148438-36.148438v-177.769531c0-19.960937-16.183594-36.144531-36.144531-36.144531zm-324.609375 203.683594h-56.933594c-8.53125 0-15.449219-6.917969-15.449219-15.453125v-126.398438c0-8.53125 6.917969-15.453125 15.449219-15.453125 8.535156 0 15.453125 6.917969 15.453125 15.453125v110.945313h41.480469c8.535156 0 15.453125 6.917968 15.453125 15.453125 0 8.535156-6.917969 15.453125-15.453125 15.453125zm63.328125-15.453125c0 8.535156-6.917969 15.453125-15.453125 15.453125s-15.453125-6.917969-15.453125-15.453125v-126.398438c0-8.53125 6.917969-15.453125 15.453125-15.453125s15.453125 6.917969 15.453125 15.453125zm130.015625-121.929688-38.160156 126.394531c-.003907.011719-.007813.023438-.011719.035157-4.144531 14.144531-25.273438 13.796875-29.5625 0-.003907-.011719-.007813-.023438-.011719-.035157l-38.160156-126.394531c-2.464844-8.171875 2.15625-16.792969 10.328125-19.261719 8.164062-2.464843 16.792969 2.15625 19.257812 10.328126l23.367188 77.394531 23.367187-77.394531c2.46875-8.171876 11.089844-12.796876 19.261719-10.328126 8.167969 2.46875 12.792969 11.089844 10.324219 19.261719zm95.066406 35.320313c8.535156 0 15.453125 6.917968 15.453125 15.453125 0 8.53125-6.917969 15.453125-15.453125 15.453125h-43.851562v40.25h52.175781c8.535156 0 15.453125 6.917968 15.453125 15.453125 0 8.535156-6.917969 15.453125-15.453125 15.453125h-67.628907c-8.535156 0-15.453124-6.917969-15.453124-15.453125v-126.398438c0-8.53125 6.917968-15.453125 15.453124-15.453125h69.710938c8.53125 0 15.453125 6.917969 15.453125 15.453125 0 8.535157-6.921875 15.453125-15.453125 15.453125h-54.261719v24.335938zm0 0" />
                            </g>
                          </svg>
                        </span>
                        <h4><strong>Live stream</strong></h4>
                      </div>
                    </div>
                  </div>
                </div>
                {canLive && (
                <LivePublisher
                  ref={(ref) => {
                    this.publisherRef = ref;
                  }}
                  onChange={this.callback.bind(this)}
                  configs={{
                    debug: true,
                    bandwidth: 900,
                    localVideoId: 'publisher'
                  }}
                  setStreamRef={this.setStreamRef}
                />
                )}
                <div className={!initialized ? 'show-streaming-button' : 'show-streaming-button stop-streaming'}>
                  {canLive ? (
                    <div>
                      {!initialized ? (
                        <Button
                          type="primary"
                          onClick={this.start.bind(this)}
                          loading={loading}
                          block
                        >
                          Start Streaming
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={this.stop.bind(this)}
                          loading={loading}
                          block
                        >
                          Stop Streaming
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <p>You can Go Live only when your account is approved by admin.</p>
                      <Button
                        disabled
                        type="primary"
                        block
                      >
                        Start Streaming
                      </Button>
                    </>
                  )}
                </div>
                <div className="buttons-stream-mobile">
                  <div><RefreshIcon /></div>
                  <div onClick={() => this.setState({ openUserModal: true })} aria-hidden>
                    <UsersIcon />
                    <span className="number-badge">{members.length}</span>
                  </div>
                  {/* {initialized && (
                  <div aria-hidden onClick={this.handleAudio.bind(this)}>
                    {mutedPlayer ? <VolumeIcon /> : <VolumeMutedIcon />}
                  </div>
                  )} */}
                </div>
              </div>

            </Col>
            <Col xs={24} sm={24} md={12}>
              <ChatBox
                {...this.props}
                members={members}
                totalParticipant={total}
                showPrivateRequests
              />
            </Col>
          </Row>
          <Modal
            title="Users"
            visible={openUserModal}
            className="modal-bottom"
            footer={null}
            destroyOnClose
            centered
            onCancel={() => this.setState({ openUserModal: false })}
          >
            <div className="content-body-model">
              {members.length === 0 && <div style={{ padding: '15px', textAlign: 'center' }}>There are no users join</div>}
              <StreamingChatUsers members={members} />
            </div>
          </Modal>
        </div>
      </>
    );
  }
}

PerformerLivePage.contextType = SocketContext;

const mapStateToProps = (state) => ({
  currentUser: state.user.current,
  activeConversation: state.streamMessage.activeConversation
});
const mapDispatchs = {
  getStreamConversation,
  resetStreamMessage
};
export default connect(mapStateToProps, mapDispatchs)(PerformerLivePage);
