import { PushpinOutlined } from '@ant-design/icons';
import { messageService } from '@services/message.service';
import { Badge, Button, message } from 'antd';
import { useState } from 'react';
import { CheckIcon } from 'src/icons';
import { Event } from 'src/socket';

import style from './ConversationListItem.module.less';

type IProps = {
  data: any;
  setActive: Function;
  selected: boolean;
  onPinSuccess?: Function;
  onUnPinSuccess?: Function;
}

export default function ConversationListItem({
  data, setActive, selected, onPinSuccess = null, onUnPinSuccess = null
}: IProps) {
  const {
    recipientInfo, lastMessage, _id, totalNotSeenMessages = 0
  } = data;
  const className = selected
    ? `${style['conversation-list-item']} ${style.active}`
    : `${style['conversation-list-item']}`;

  const [online, setOnline] = useState(recipientInfo?.isOnline || false);

  const handleOnlineOffline = (resp) => {
    if (resp.id !== recipientInfo?._id) return;
    setOnline(resp.online);
  };

  const pinToTop = async () => {
    try {
      await messageService.pinToTop(_id);
      message.success('Pinned');
      onPinSuccess && onPinSuccess(_id);
    } catch (error) {
      message.error('An error occorreddssdfdsff, please try again!');
    }
  };

  const unPinToTop = async () => {
    try {
      await messageService.unPinToTop(_id);
      message.success('Unpinned');
      onUnPinSuccess && onUnPinSuccess(_id);
    } catch (error) {
      message.error('An error occorred, please try again!');
    }
  };

  return (
    <div className={style['group-conversation']}>
      <div
        aria-hidden
        className={className}
        onClick={() => setActive(_id)}
      >
        <Event event="online" handler={handleOnlineOffline} />
        <div className={style['conversation-left-corner']}>
          <img className={style['conversation-photo']} src={recipientInfo?.avatar || '/no-avatar.png'} alt="conversation" />
          <span className={online ? 'online' : ''}>
            <span className="active" />
          </span>
        </div>
        <div className="conversation-info">
          <h1 className={style['conversation-title']}>
            {recipientInfo?.name || recipientInfo?.username || 'N/A'}
            {' '}
            {recipientInfo?.verifiedAccount && <CheckIcon className="color-primary" />}
          </h1>
          <p className="conversation-snippet">{lastMessage}</p>
        </div>
        {totalNotSeenMessages > 0
        && (
        <Badge
          className="notification-badge"
          count={totalNotSeenMessages}
          overflowCount={9}
        />
        )}
      </div>
      {data._id && !data.isPinned ? (
        <Button
          className={style['conversation-top-right']}
          onClick={() => pinToTop()}
        >
          <PushpinOutlined />
        </Button>
      ) : (
        <Button
          className={style['conversation-top-right-unpin']}
          onClick={() => unPinToTop()}
        >
          <img src="/unpin.png" alt="UnPin" width="18px" />
        </Button>
      )}
    </div>
  );
}
