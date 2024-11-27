import { connect, ConnectedProps } from 'react-redux';

import MessageList from './MessageList';
import style from './Messenger.module.less';

const mapStates = (state: any) => ({
  activeConversation: state.streamMessage.activeConversation
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function StreamMessenger({
  activeConversation
}: PropsFromRedux) {
  return (
    <div className={style['message-stream']}>
      {activeConversation && activeConversation.data && activeConversation.data.streamId ? <MessageList /> : <p>No conversation found.</p>}
    </div>
  );
}

export default connector(StreamMessenger);
