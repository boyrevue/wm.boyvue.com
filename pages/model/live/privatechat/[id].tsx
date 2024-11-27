import '../live.module.less';

import { CloseOutlined } from '@ant-design/icons';
import ChatBox from '@components/stream-chat/chat-box';
import StreamingChatUsers from '@components/stream-chat/streaming-chat-view';
import PrivateChatContainer from '@components/streaming/private-streaming-container';
import { getResponseError } from '@lib/utils';
import {
  getStreamConversationSuccess,
  resetStreamMessage
} from '@redux/stream-chat/actions';
import { updateBalance } from '@redux/user/actions';
import {
  Button,
  Col,
  message, Modal,
  Row
} from 'antd';
import dynamic from 'next/dynamic';
import Header from 'next/head';
import Router from 'next/router';
import { ContextType, PureComponent } from 'react';
import { connect } from 'react-redux';
import { RECEIVED_PAID_TOKEN_EVENT } from 'src/constants';
import {
  RefreshIcon, UsersIcon, VolumeIcon, VolumeMutedIcon, WalletIcon
} from 'src/icons';
import { IUser } from 'src/interfaces';
import { accessPrivateRequest } from 'src/redux/streaming/actions';
import { messageService, streamService } from 'src/services';
import { Event, SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

const CallTime = dynamic(() => import('@components/streaming/call-time'), {
  ssr: false
});

// eslint-disable-next-line no-shadow
enum STREAM_EVENT {
  JOINED_THE_ROOM = 'JOINED_THE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  LEAVE_ROOM = 'LEAVE_ROOM',
  STREAM_INFORMATION_CHANGED = 'private-stream/streamInformationChanged'
}

type IProps = {
  query: any;
  getStreamConversationSuccess: Function;
  activeConversation: any;
  resetStreamMessage: Function;
  accessPrivateRequest: Function;
  updateBalance: Function;
  currentUser: any;
}

interface IStates {
  roomJoined: boolean;
  total: number;
  members: IUser[];
  started: boolean;
  receivedToken: number;
  requestUser: IUser;
  openUserModal,
  mutedPlayer: boolean,
}

class ModelPrivateChat extends PureComponent<IProps, IStates> {
  static authenticate = true;

  static onlyPerformer = true;

  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  private interval: NodeJS.Timeout;

  private streamRef: any;

  private streamRef2: any;

  static async getInitialProps(ctx) {
    return {
      query: ctx.query
    };
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      roomJoined: false,
      started: false,
      receivedToken: 0,
      total: 0,
      members: [],
      requestUser: null,
      openUserModal: false,
      mutedPlayer: false
    };
  }

  componentDidMount() {
    const { query, accessPrivateRequest: access } = this.props;
    window.addEventListener('beforeunload', this.onbeforeunload);
    Router.events.on('routeChangeStart', this.onbeforeunload);
    access(query.id);
    this.getConversationDetail();
  }

  componentDidUpdate(prevProps: IProps) {
    const { query, accessPrivateRequest: access } = this.props;
    if (prevProps.query.id !== query.id) {
      access(query.id);
      this.getConversationDetail();
    }
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

  handler({ total, members }) {
    this.setState({ total, members });
  }

  handleReceivedPaidToken({ token, conversationId }) {
    const { activeConversation, updateBalance: dispatchUpdateBalance } = this.props;
    const { receivedToken } = this.state;
    if (
      activeConversation?.data?._id
      && conversationId === activeConversation.data._id
    ) {
      this.setState({ receivedToken: receivedToken + token });
      dispatchUpdateBalance(token);
    }
  }

  async getConversationDetail() {
    const { query } = this.props;
    const conversation = await messageService.getConversationDetail(query.id);
    this.setState({
      requestUser: conversation.data.recipientInfo
    });
  }

  onbeforeunload = () => {
    this.leaveSession();
  };

  setStreamRef = (dataFunc) => {
    this.streamRef2 = dataFunc;
  };

  roomJoinedHandler({ total, members, conversationId }) {
    const { activeConversation } = this.props;
    if (
      activeConversation?.data?._id
      && conversationId === activeConversation.data._id
    ) {
      this.setState({
        total,
        members,
        roomJoined: true,
        started: true
      });
      this.handleAudio();
    }
  }

  async acceptRequest() {
    const {
      query,
      getStreamConversationSuccess: dispatchGetStreamConversationSuccess
    } = this.props;
    if (!query.id) return;

    try {
      const resp = await streamService.acceptPrivateChat(query.id);
      if (resp && resp.data) {
        const { getSocket } = this.context as ISocketContext;
        const socket = getSocket();
        const { sessionId, conversation } = resp.data;
        socket?.emit(STREAM_EVENT.JOIN_ROOM, {
          conversationId: conversation._id
        });
        if (this.streamRef?.start) {
          this.streamRef.start(sessionId, conversation._id);
        } else {
          this.streamRef2.start(sessionId, conversation._id);
        }
        dispatchGetStreamConversationSuccess({
          data: conversation
        });
      }
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
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (socket && activeConversation?.data?._id) {
      socket.emit(STREAM_EVENT.LEAVE_ROOM, {
        conversationId: activeConversation.data._id
      });
      dispatchResetStreamMessage();
    }

    this.interval && clearInterval(this.interval);
    this.setState({
      roomJoined: false,
      started: false,
      receivedToken: 0,
      total: 0,
      members: []
    });
  }

  render() {
    const {
      total, members, receivedToken, started, roomJoined, requestUser, openUserModal, mutedPlayer
    } = this.state;
    const { currentUser } = this.props;
    return (
      <>
        <Header>
          <title>Private Chat</title>
        </Header>

        <Event
          event={STREAM_EVENT.STREAM_INFORMATION_CHANGED}
          handler={this.handler.bind(this)}
        />
        <Event
          event={STREAM_EVENT.JOINED_THE_ROOM}
          handler={this.roomJoinedHandler.bind(this)}
          handleRouterChange
        />
        <Event
          event={RECEIVED_PAID_TOKEN_EVENT}
          handler={this.handleReceivedPaidToken.bind(this)}
        />

        <div className="main-container  page-streaming page-private-streaming">
          <Row className="streaming-container">
            <Col md={14} xs={24}>
              <div className="show-streaming">
                <div className="left-top-streaming">
                  {roomJoined && (
                    <>
                      <div>
                        <CallTime start={started} />
                      </div>
                      <div>
                        <WalletIcon />
                        {(currentUser.balance || 0).toFixed(1)}
                        0
                      </div>
                      <div>
                        Received:
                        {' '}
                        {receivedToken}
                      </div>
                    </>
                  )}
                </div>
                <div className="right-top-streaming">
                  <Button onClick={() => Router.back()} className="close-streaming"><CloseOutlined /></Button>
                </div>
                <div className="show-streaming-box">
                  <div className="show-streaming-center" hidden={roomJoined}>
                    <div className="box-streaming-center">
                      <div className="streaming-title">Requested Private Chat</div>
                      <div className="streaming-content">
                        <img src={requestUser?.avatar || '/no-avatar.png'} alt="" />
                        <br />
                        <strong>{requestUser?.username}</strong>
                        {' '}
                        {!requestUser?.isOnline
                          && <span>is offline</span>}
                      </div>
                    </div>
                  </div>
                  <div className="buttons-stream-mobile">
                    <div><RefreshIcon /></div>
                    <div onClick={() => this.setState({ openUserModal: true })} aria-hidden>
                      <UsersIcon />
                      <span className="number-badge">{members.length}</span>
                    </div>
                    {started && (
                    <div aria-hidden onClick={this.handleAudio.bind(this)}>
                      {mutedPlayer ? <VolumeIcon /> : <VolumeMutedIcon />}
                    </div>
                    )}
                  </div>
                </div>
                <PrivateChatContainer
                // eslint-disable-next-line no-return-assign
                  ref={(ref) => (this.streamRef = ref)}
                  sessionId=""
                  configs={{
                    localVideoId: 'private-publisher'
                  }}
                  onClick={this.acceptRequest.bind(this)}
                  setStreamRef={this.setStreamRef}
                  {...this.props}
                />
              </div>
            </Col>
            <Col md={10} xs={24}>
              <ChatBox
                {...this.props}
                totalParticipant={total}
                members={members}
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

ModelPrivateChat.contextType = SocketContext;

const mapStateToProps = (state) => ({
  currentUser: state.user.current,
  activeConversation: state.streamMessage.activeConversation
});

const mapDispatchs = {
  accessPrivateRequest,
  getStreamConversationSuccess,
  resetStreamMessage,
  updateBalance
};

export default connect(mapStateToProps, mapDispatchs)(ModelPrivateChat);
