import {
  UsergroupAddOutlined
} from '@ant-design/icons';
import { IUser } from '@interfaces/user';
import { formatDate } from '@lib/date';
import { addPrivateRequest } from '@redux/streaming/actions';
import {
  Avatar, Badge, Card, Dropdown, Menu, message
} from 'antd';
import Router from 'next/router';
import { useContext, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SocketContext } from 'src/socket';

const EVENT = {
  RECEIVED_PRIVATE_CHAT_REQUEST: 'private-chat-request'
};

const mapState = (state: any) => ({
  streamSettings: state.streaming.settings,
  privateRequests: state.streaming.privateRequests
});
const mapDispatch = {
  addPrivateRequestHandler: addPrivateRequest
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function getPrivateChatRequestMenuItems({
  streamSettings,
  privateRequests
}: any) {
  if (!privateRequests?.length) return null;

  const clickMenuItem = (request) => {
    Router.push(
      {
        pathname: `/model/live/${streamSettings.optionForPrivate
          === 'webrtc'
          ? 'webrtc/'
          : ''
        }privatechat/[id]`,
        query: { id: request.conversationId }
      },
      `/model/live/${streamSettings.optionForPrivate === 'webrtc'
        ? 'webrtc/'
        : ''
      }privatechat/${request.conversationId}`
    );
    message.destroy();
  };

  const renderCardTitle = (user) => {
    const { username, balance = 0 } = user;

    return (
      <span>
        {username}
        {' '}
        <span className="wallet-content">
          <img
            src="/wallett.png"
            alt=""
            width="10"
            height="10"
          />
          {' '}
          {balance.toFixed(2)}
        </span>
      </span>
    );
  };

  return privateRequests.map((request) => ({
    key: request.conversationId,
    label: (
      <Card
        bordered={false}
        hoverable={false}
        onClick={() => clickMenuItem(request)}
      >
        <Card.Meta
          avatar={(
            <Avatar
              src={request.user.avatar || '/no-avatar.png'}
            />
      )}
          title={renderCardTitle(request.user)}
          description={formatDate(
            request.createdAt
          )}
        />
      </Card>
    )
  }));
}

function PrivateRequestDropdown({
  privateRequests = [],
  streamSettings = {},
  addPrivateRequestHandler = () => {}
}: PropsFromRedux) {
  const { getSocket, socketStatus, connected } = useContext(SocketContext);

  const handlePrivateChat = (data: { conversationId: string; user: IUser }) => {
    message.success(`${data.user.username} sent you a private chat request!`);
    // this.soundRef.current && this.soundRef.current.play();
    addPrivateRequestHandler({ ...data, createdAt: new Date() });
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(
      EVENT.RECEIVED_PRIVATE_CHAT_REQUEST,
      handlePrivateChat
    );
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(EVENT.RECEIVED_PRIVATE_CHAT_REQUEST, handlePrivateChat);
  };

  useEffect(() => {
    if (!connected()) return handleOffSocket();

    handleSocket();

    return handleOffSocket;
  }, [socketStatus]);

  const getMenuItems = () => {
    if (!privateRequests.length) {
      return [{
        key: 'no-request',
        label: 'There is no private requests'
      }];
    }

    return getPrivateChatRequestMenuItems({
      privateRequests,
      streamSettings
    });
  };

  return (
    <Dropdown
      overlay={(
        <Menu items={getMenuItems()} />
      )}
    >
      <div
        style={{
          cursor: 'pointer'
        }}
      >
        <style>
          {`
            .cart-total {
              position: absolute;
              top: 2px;
              right: 5px;
            }
          `}
        </style>
        <UsergroupAddOutlined />
        <Badge
          className="cart-total"
          count={privateRequests.length}
        />
      </div>
    </Dropdown>
  );
}

export default connector(PrivateRequestDropdown);
