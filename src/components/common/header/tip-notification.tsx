import { notificationService } from '@services/notification.service';
import { message } from 'antd';
import { useContext, useEffect } from 'react';
import { SocketContext } from 'src/socket';

const EVENT = {
  TIPPED: 'TIPPED'
};

function TipNotification() {
  const { getSocket, socketStatus, connected } = useContext(SocketContext);

  const handleTipped = ({ senderInfo, totalPrice, _id }) => {
    if (notificationService.hasHolderId(_id)) return;
    notificationService.addHolderId(_id);
    message.success(
      `You have received $${totalPrice} from ${senderInfo.name}`
    );
    // this.soundRef.current && this.soundRef.current.play();
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(EVENT.TIPPED, handleTipped);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(EVENT.TIPPED, handleTipped);
  };

  useEffect(() => {
    if (!connected()) return handleOffSocket();

    handleSocket();

    return handleOffSocket;
  }, [socketStatus]);

  return null;
}

export default TipNotification;
