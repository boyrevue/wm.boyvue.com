import {
  deleteMessage,
  deleteMessageSuccess,
  loadMoreStreamMessages,
  receiveStreamMessageSuccess
} from '@redux/stream-chat/actions';
import classNames from 'classnames';
import moment from 'moment';
import React, { ContextType, createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { IPerformer, IUser } from 'src/interfaces';
import { SocketContext } from 'src/socket';
import { ISocketContext } from 'src/socket/SocketContext';

import Compose from './Compose';
import Message from './Message';
import style from './MessageList.module.less';

type IProps = {
  loadMoreStreamMessages: Function;
  receiveStreamMessageSuccess: Function;
  message: any;
  conversation: any;
  user: IUser & IPerformer;
  deleteMessage: Function;
  deleteMessageSuccess: Function;
}

const canDelete = ({ isDeleted, senderId, performerId }, user): boolean => {
  if (isDeleted) return false;
  let check = false;
  if (user && user._id) {
    if (user.roles && user.roles.includes('admin')) {
      check = true;
    } else if (user.roles && user.roles.includes('user') && senderId === user._id) {
      check = true;
    } else if (performerId === user._id) {
      check = true;
    }
  }
  return check;
};

class MessageList extends PureComponent<IProps> {
  // eslint-disable-next-line react/static-property-placement
  context!: ContextType<typeof SocketContext>;

  messagesRef: any;

  state = {
    offset: 1,
    onloadmore: false
  };

  componentDidMount() {
    if (!this.messagesRef) this.messagesRef = createRef();
    const { conversation } = this.props;
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    if (conversation && conversation._id) {
      socket?.on(`message_created_conversation_${conversation._id}`, this.onReceiveCreateMessage);
      socket?.on(`message_deleted_conversation_${conversation._id}`, this.onReceiveDeleteMessage);
    }
  }

  componentWillUnmount() {
    const { conversation } = this.props;
    const { getSocket } = this.context as ISocketContext;
    const socket = getSocket();
    socket?.off(`message_created_conversation_${conversation._id}`, this.onReceiveCreateMessage);
    socket?.off(`message_deleted_conversation_${conversation._id}`, this.onReceiveDeleteMessage);
  }

  async handleScroll(conversation, event) {
    const {
      message: { fetching, items, total },
      loadMoreStreamMessages: loadMore
    } = this.props;
    const { offset } = this.state;
    const canloadmore = total > items.length;

    const ele = event.target;
    if (!canloadmore) return;
    if (ele.scrollTop === 0 && conversation._id && !fetching && canloadmore) {
      await this.setState({ offset: offset + 1, onloadmore: true });
      loadMore({
        conversationId: conversation._id,
        limit: 25,
        offset: (offset - 1) * 25,
        type: conversation.type
      });
    }
  }

  onReceiveCreateMessage = (data) => {
    this.onMessage(data, 'created');
  };

  onReceiveDeleteMessage = (data) => {
    this.onMessage(data, 'deleted');
  };

  onMessage = (message, type) => {
    if (!message) {
      return;
    }

    const { receiveStreamMessageSuccess: create, deleteMessageSuccess: remove } = this.props;
    type === 'created' && create(message);
    type === 'deleted' && remove(message);
  };

  onDelete(messageId) {
    const { deleteMessage: _deleteMessage } = this.props;
    if (!messageId) return;
    _deleteMessage({ messageId });
  }

  renderMessages = () => {
    const { message, conversation, user } = this.props;
    const messages = message.items;
    let i = 0;
    const messageCount = messages && messages.length;
    const tempMessages = [];
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = user && current.senderId === user._id;
      const currentMoment = moment(current.createdAt);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;
      const isOwner = conversation && conversation.performerId === current.senderId;
      if (previous) {
        const previousMoment = moment(previous.createdAt);
        const previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous.senderId === current.senderId;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdAt);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.senderId === current.senderId;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }
      if (current._id) {
        tempMessages.push(
          <Message
            onDelete={this.onDelete.bind(this, current._id)}
            canDelete={canDelete(current, user)}
            isOwner={isOwner}
            key={i}
            isMine={isMine}
            startsSequence={startsSequence}
            endsSequence={endsSequence}
            showTimestamp={showTimestamp}
            data={current}
          />
        );
      }
      // Proceed to the next message.
      i += 1;
    }
    this.scrollToBottom();
    return tempMessages;
  };

  scrollToBottom() {
    const { onloadmore } = this.state;
    if (onloadmore) {
      return;
    }
    if (this.messagesRef && this.messagesRef.current) {
      const ele = this.messagesRef.current;
      window.setTimeout(() => {
        ele.scrollTop = ele.scrollHeight;
      }, 200);
    }
  }

  render() {
    const { conversation, message } = this.props;
    const {
      message: { fetching }
    } = this.props;
    if (!this.messagesRef) this.messagesRef = createRef();

    return (
      <div
        className={style['message-list']}
      >
        {conversation && conversation._id && (
          <>
            <div
              className={classNames(style['message-list-container'], { 'show-blur': message.items.length > 4 })}
              ref={this.messagesRef}
              onScroll={this.handleScroll.bind(this, conversation)}
            >
              <div className={style['message-list-scroll']}>
                {fetching && <p className="text-center">fetching...</p>}
                {this.renderMessages()}
              </div>
            </div>
            <Compose conversation={conversation} performer={undefined} />
          </>
        )}
      </div>
    );
  }
}

MessageList.contextType = SocketContext;

const mapStates = (state: any) => {
  const { conversationMap, activeConversation } = state.streamMessage;
  const messages = activeConversation.data && conversationMap[activeConversation.data._id]
    ? conversationMap[activeConversation.data._id].items || []
    : [];
  const totalMessages = activeConversation.data && conversationMap[activeConversation.data._id]
    ? conversationMap[activeConversation.data._id].total || 0
    : 0;
  const fetching = activeConversation.data && conversationMap[activeConversation.data._id]
    ? conversationMap[activeConversation.data._id].fetching || false
    : false;
  return {
    message: {
      items: messages,
      total: totalMessages,
      fetching
    },
    conversation: activeConversation.data,
    user: state.user.current
  };
};

const mapDispatch = {
  loadMoreStreamMessages,
  receiveStreamMessageSuccess,
  deleteMessage,
  deleteMessageSuccess
};
export default connect(mapStates, mapDispatch)(MessageList);
