import { connect, ConnectedProps } from 'react-redux';

import ConversationList from './ConversationList';
import MessageList from './MessageList';
import style from './Messenger.module.less';

type IProps = {
  toSource?: string;
  toId?: string;
}

const mapStates = (state: any) => {
  const { activeConversation } = state.conversation;
  return {
    activeConversation
  };
};

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function Messenger({
  toSource = null,
  toId = null,
  activeConversation
}: PropsFromRedux & IProps) {
  return (
    <div className={style.messenger}>
      <div className={!activeConversation._id ? `${style.sidebar}` : `${style.sidebar} ${style.active}`}>
        <ConversationList toSource={toSource} toId={toId} />
      </div>
      <div className={!activeConversation._id ? `${style['chat-content']}` : `${style['chat-content']} ${style.active}`}>
        <MessageList />
      </div>
    </div>
  );
}

export default connector(Messenger);
