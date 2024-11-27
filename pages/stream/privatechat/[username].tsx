import '../stream.module.less';

import { CloseOutlined } from '@ant-design/icons';
import {
  PerformerInfo
} from '@components/performer';
import ChatBox from '@components/stream-chat/chat-box';
import StreamingChatUsers from '@components/stream-chat/streaming-chat-view';
import PrivateChatContainer from '@components/streaming/private-streaming-container';
import Tipping from '@components/streaming/tipping';
import { getResponseError } from '@lib/utils';
import {
  getStreamConversationSuccess,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import { updateBalance } from '@redux/user/actions';
import {
  Avatar,
  Button,
  Col, message, Modal,
  Row
} from 'antd';
import dynamic from 'next/dynamic';
import Header from 'next/head';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import React, {
  ContextType,
  PureComponent
} from 'react';
import { connect } from 'react-redux';
import {
  InfoIcon, UsersIcon, VolumeIcon, VolumeMutedIcon, WalletIcon
} from 'src/icons';
import { IPerformer, IUser } from 'src/interfaces';
import {
  paymentWalletService, performerService, streamService, utilsService
} from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

const CallTime = dynamic(() => import('@components/streaming/call-time'), {
  ssr: false
});

// eslint-disable-next-line no-shadow
enum EVENT {
  JOINED_THE_ROOM = 'JOINED_THE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  STREAM_INFORMATION_CHANGED = 'private-stream/streamInformationChanged',
  MODEL_JOIN_ROOM = 'MODEL_JOIN_ROOM',
  SEND_PAID_TOKEN = 'SEND_PAID_TOKEN'
}

type IProps = {
  username: string;
  performer: IPerformer;
  user: IUser;
  getStreamConversationSuccess: Function;
  activeConversation: any;
  resetStreamMessage: Function;
  updateBalance: Function;
  bodyInfo: any;
  currentUser: IUser;
}

interface IStates {
  roomJoined: boolean;
  modelJoined: boolean;
  total: number;
  members: IUser[];
  paidToken: number;
  started: boolean;
  openUserModal, openInfoModal, mutedPlayer: boolean;
}

class UserPrivateChat extends PureComponent<IProps, IStates> {
  static authenticate = true;

  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  private streamRef: any;

  private streamRef2: any;

  private interval: NodeJS.Timeout;

  static async getInitialProps(ctx) {
    try {
      const { query } = ctx;
      if (typeof window !== 'undefined' && query.performer) {
        return {
          performer: JSON.parse(query.performer)
        };
      }

      const { token } = nextCookie(ctx);
      const headers = { Authorization: token };
      const resp = await performerService.findOne(query.username, headers);
      const performer: IPerformer = resp.data;
      if (!performer.isSubscribed) {
        throw new Error();
      }
      const bodyInfo = await utilsService.bodyInfo();
      return {
        performer,
        bodyInfo: bodyInfo?.data
      };
    } catch (e) {
      if (typeof window !== 'undefined') {
        return Router.push('/');
      }

      ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/' });
      ctx.res.end && ctx.res.end();
      return {};
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      roomJoined: false,
      modelJoined: false,
      total: 0,
      paidToken: 0,
      members: [],
      started: false,
      openUserModal: false,
      openInfoModal: false,
      mutedPlayer: false
    };
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.onbeforeunload);
    Router.events.on('routeChangeStart', this.onbeforeunload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onbeforeunload);
    Router.events.off('routeChangeStart', this.onbeforeunload);
  }

  handleAudio() {
    const { mutedPlayer } = this.state;
    this.setState({ mutedPlayer: !mutedPlayer });
    if (this.streamRef.player) {
      this.streamRef.player.muted(mutedPlayer);
    }
    if (this.streamRef2.player) {
      this.streamRef2.player.muted(mutedPlayer);
    }
  }

  handler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id && activeConversation.data._id === conversationId) {
      this.setState({ total, members });
    }
  }

  handleCharge = (conversationId) => {
    this.sendPrivateChat(conversationId);
  };

  async handleModelJoinRoom({ conversationId }) {
    message.success('Model joined the room!');
    const {
      activeConversation
    } = this.props;
    if (activeConversation?.data?._id && activeConversation.data._id === conversationId) {
      if (this.interval) clearInterval(this.interval);
      // start stream
      this.handleCharge(conversationId);
      // const socket = this.context;
      this.interval = setInterval(this.handleCharge, 60 * 1000, conversationId);
      this.setState({ started: true, modelJoined: true });
    }
    this.handleAudio();
  }

  onbeforeunload = () => {
    this.leaveSession();
  };

  setStreamRef = (dataFunc) => {
    this.streamRef2 = dataFunc;
  };

  async sendPrivateChat(conversationId: string) {
    try {
      const { performer, updateBalance: dispatchUpdateBalance } = this.props;
      const { paidToken } = this.state;
      await paymentWalletService.sendPrivateChat(conversationId);
      const newState = { paidToken: paidToken + performer.privateChatPrice };
      this.setState(newState);
      dispatchUpdateBalance((performer.privateChatPrice * (-1)));
    } catch (err) {
      message.error('You ran out of tokens, please top-up your wallet');
      this.stopBroadcast();
      clearInterval(this.interval);
      setTimeout(() => {
        // window.location.href = '/wallet-package';
        window.location.href = '/';
      }, 1000);
    }
  }

  stopBroadcast() {
    if (this.streamRef?.stop) this.streamRef.stop();
    else this.streamRef2.stop();

    setTimeout(() => {
      window.location.href = '/';
    }, 10 * 1000);
  }

  roomJoinedHandler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (activeConversation?.data?._id && conversationId === activeConversation.data._id) {
      this.setState({
        total,
        members
      });
      setTimeout(() => {
        this.setState({
          roomJoined: true
        });
      }, 2500);
    }
  }

  async sendRequest() {
    const {
      performer,
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess
    } = this.props;
    try {
      const resp = await streamService.requestPrivateChat(performer._id);
      const { sessionId, conversation } = resp.data;
      const { getSocket } = this.context as ISocketContext;
      const socket = getSocket();
      message.success('Private request has been sent!');
      if (this.streamRef?.start) this.streamRef.start(sessionId, conversation._id);
      else this.streamRef2.start(sessionId, conversation._id);
      socket.emit(EVENT.JOIN_ROOM, {
        conversationId: conversation._id
      });
      dispatchGetStreamConversationSuccess({
        data: conversation
      });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    }
  }

  leaveSession() {
    const {
      activeConversation,
      resetStreamMessage: dispatchResetStreamMessage
    } = this.props;
    dispatchResetStreamMessage();
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (socket && activeConversation && activeConversation.data) {
      socket.emit(EVENT.LEAVE_ROOM, {
        conversationId: activeConversation.data._id
      });
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.setState({
      roomJoined: false,
      paidToken: 0,
      total: 0,
      members: [],
      started: false
    });
  }

  render() {
    const {
      performer, bodyInfo, user, activeConversation, currentUser
    } = this.props;
    const {
      total, members, roomJoined, started, paidToken, openUserModal, openInfoModal, mutedPlayer, modelJoined
    } = this.state;
    return (
      <>
        <Header>
          <title>Private Chat</title>
        </Header>
        <Event
          event={EVENT.STREAM_INFORMATION_CHANGED}
          handler={this.handler.bind(this)}
        />
        <Event
          event={EVENT.JOINED_THE_ROOM}
          handler={this.roomJoinedHandler.bind(this)}
        />
        <Event
          event={EVENT.MODEL_JOIN_ROOM}
          handler={this.handleModelJoinRoom.bind(this)}
        />
        <div className="main-container page-streaming page-private-streaming">
          <Row className="streaming-container">
            <Col md={14} xs={24}>
              <div className="show-streaming">
                <div className="left-top-streaming">
                  <div className="page-heading">
                    <Avatar src={performer?.avatar || '/no-avatar.png'} />
                    {' '}
                    <span style={{ textTransform: 'capitalize' }}>{performer?.username}</span>
                  </div>
                  {roomJoined && modelJoined && (
                  <>
                    <div>
                      <CallTime start={started} />
                    </div>
                    <div>
                      <WalletIcon />
                      {(user.balance || 0).toFixed(2)}
                    </div>
                    <div>
                      Paid:
                      {' '}
                      {paidToken}
                    </div>
                  </>
                  )}
                </div>
                <div className="right-top-streaming">
                  <Button onClick={() => Router.back()} className="close-streaming"><CloseOutlined /></Button>
                </div>
                <div className="show-streaming-box">
                  <div className="show-streaming-bg" hidden={roomJoined} style={{ backgroundImage: `url('${performer.avatar || '/no-avatar.png'}')` }} />
                  <div className="show-streaming-center" hidden={roomJoined}>
                    <div className="box-streaming-center">
                      <div className="streaming-title">Private live stream</div>
                      <div className="streaming-content">
                        <img src={performer.avatar || '/no-avatar.png'} alt="" />
                        <br />
                        <strong>{performer?.username}</strong>
                        {' '}
                        {!performer?.isOnline
                          && <span>is offline</span>}
                      </div>
                    </div>
                  </div>

                </div>
                {roomJoined && !modelJoined && (
                  <div className="requesting-private">
                    <div className="requesting-private-load">
                      <img src={performer.avatar || '/no-avatar.png'} alt="" />
                    </div>
                    Request private streaming
                    {' '}
                    <div className="loader">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <div className="buttons-stream-mobile">
                  <div onClick={() => this.setState({ openInfoModal: true })} aria-hidden><InfoIcon /></div>
                  <div onClick={() => this.setState({ openUserModal: true })} aria-hidden>
                    <UsersIcon />
                    <span className="number-badge">{members.length}</span>
                  </div>

                  {modelJoined && (
                  <div aria-hidden onClick={this.handleAudio.bind(this)}>
                    {mutedPlayer ? <VolumeIcon /> : <VolumeMutedIcon />}
                  </div>
                  )}

                  <Tipping
                    performerId={performer._id}
                    conversationId={activeConversation?.data?._id}
                    balanceUser={currentUser}
                  />
                </div>
                {<PrivateChatContainer
                // eslint-disable-next-line no-return-assign
                  ref={(ref) => (this.streamRef = ref)}
                  configs={{
                    localVideoId: 'private-publisher'
                  }}
                  onClick={this.sendRequest.bind(this)}
                  setStreamRef={this.setStreamRef}
                  {...this.props}
                />}
              </div>
            </Col>
            <Col md={10} xs={24}>
              <ChatBox
                {...this.props}
                totalParticipant={total}
                members={members}
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
          <Modal
            title="Bio"
            visible={openInfoModal}
            className="modal-bottom"
            footer={null}
            destroyOnClose
            centered
            onCancel={() => this.setState({ openInfoModal: false })}
          >
            <div className="content-body-model"><PerformerInfo performer={performer} bodyInfo={bodyInfo} /></div>
          </Modal>
        </div>
      </>
    );
  }
}

UserPrivateChat.contextType = SocketContext;

const mapStateToProps = (state) => ({
  user: state.user.current,
  activeConversation: state.streamMessage.activeConversation,
  currentUser: state.user.current
});
const mapDispatchs = {
  getStreamConversationSuccess,
  resetStreamMessage,
  updateBalance
};
export default connect(
  mapStateToProps,
  mapDispatchs
)(UserPrivateChat);
