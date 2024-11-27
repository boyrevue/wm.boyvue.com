import {
  DownOutlined, UpOutlined
} from '@ant-design/icons';
import { TabPane, Tabs } from '@components/common/base/tabs';
import StreamMessenger from '@components/stream-chat/Messenger';
import PrivateRequestList from '@components/streaming/private-request-list';
import { getResponseError } from '@lib/utils';
import { Button, message } from 'antd';
import React from 'react';
// import { useSelector } from 'react-redux';
import { IUser } from 'src/interfaces';
import { messageService } from 'src/services';

import style from './chat-box.module.less';
import StreamingChatUsers from './streaming-chat-view';

type IProps = {
  resetAllStreamMessage?: Function;
  user?: any;
  activeConversation?: any;
  totalParticipant?: number;
  members?: IUser[];
  showPrivateRequests?: boolean;
}

const checkPermission = (performer, conversation) => {
  if (performer && conversation && conversation.data && performer._id === conversation.data.performerId) {
    return true;
  }

  return false;
};

function ChatBox({
  totalParticipant = 0,
  members = [],
  user = null,
  activeConversation = null,
  resetAllStreamMessage = null,
  showPrivateRequests = false
}: IProps) {
  const [removing, setRemoving] = React.useState(false);
  const [canReset, setCanReset] = React.useState(false);
  const [showChat, setShowChat] = React.useState(true);
  // const privateRequests = useSelector((state: any) => state.streaming.privateRequests);

  React.useEffect(() => {
    setCanReset(checkPermission(user, activeConversation));
  }, [user, activeConversation]);

  const removeAllMessage = async () => {
    if (!canReset) {
      return;
    }

    try {
      setRemoving(true);
      if (!window.confirm('Are you sure you want to remove chat history?')) {
        return;
      }
      await messageService.deleteAllMessageInConversation(
        activeConversation.data._id
      );
      resetAllStreamMessage && resetAllStreamMessage({ conversationId: activeConversation.data._id });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className={`${style['conversation-stream']} ${!showChat ? 'hide-conversation' : ' '}`}>
        {activeConversation?.data?.streamId && (
          <Button className="hide-chat show-mobile" onClick={() => setShowChat(!showChat)} hidden={activeConversation?.data?.streamId}>
            {showChat && (
              <span>
                <DownOutlined />
                {' '}
                Hide chat
              </span>
            )}
            {!showChat && (
              <span>
                <UpOutlined />
                {' '}
                Show chat
              </span>
            )}
          </Button>
        )}
        <Tabs
          animated={{
            inkBar: false,
            tabPane: false
          }}
          defaultActiveKey="chat_content"
        >
          <TabPane tab="CHAT" key="chat_content">
            {activeConversation?.data?.streamId && (
              <StreamMessenger />
            )}
          </TabPane>
          <TabPane tab={`USER (${totalParticipant || 0})`} key="chat_user">
            <StreamingChatUsers members={members} />
          </TabPane>
          {showPrivateRequests && (
            <TabPane
              forceRender
              tab={(
                <>
                  Private requests
                  {' '}
                  (
                  <span className="privateRequestTotal" />
                  )
                </>
              )}
              key="private_requests"
            >
              <PrivateRequestList />
            </TabPane>
          )}
        </Tabs>
      </div>
      {canReset && (
        <div style={{ margin: '10px' }}>
          <Button
            type="primary"
            loading={removing}
            onClick={() => removeAllMessage()}
          >
            Clear message history
          </Button>
        </div>
      )}
    </>
  );
}

export default ChatBox;
