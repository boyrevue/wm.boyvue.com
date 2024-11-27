import { messageService } from '@services/message.service';
import { Badge, Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { MessageIcon } from 'src/icons';
import { SocketContext } from 'src/socket';

const EVENT = {
  NOTIFY_READ_MESSAGE: 'nofify_read_messages_in_conversation'
};

function UnreadMessageBadge() {
  const { getSocket, socketStatus, connected } = useContext(SocketContext);
  const [count, setCount] = useState(0);
  const countUnread = async () => {
    const resp = await messageService.countTotalNotRead();

    if (resp) {
      setCount(resp.data.total);
    }
  };

  const handleCountFromSocket = (data) => {
    setCount(data.total);
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(EVENT.NOTIFY_READ_MESSAGE, handleCountFromSocket);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(EVENT.NOTIFY_READ_MESSAGE, handleCountFromSocket);
  };

  useEffect(() => {
    if (!connected()) return handleOffSocket();
    countUnread();
    handleSocket();

    return handleOffSocket;
  }, [socketStatus]);

  return (
    <Tooltip title="Messenger">
      <MessageIcon />
      <Badge
        overflowCount={9}
        className="cart-total"
        count={count}
      />
    </Tooltip>
  );
}

export default UnreadMessageBadge;
