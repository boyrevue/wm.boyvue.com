import IconLive from '@components/streaming/animated-live-icon';
import { Tooltip } from 'antd';
import {
  useContext, useEffect, useRef, useState
} from 'react';
import { SocketContext } from 'src/socket';

export interface ILiveStreamIconProps {
  performerId?: string
}

export function StreamIcon() {
  return (
    <span className="anticon anticon-eye">
      {/* <IconLive type={data.status} /> */}
    </span>
  );
}

export function LiveStreamIcon({
  performerId = null
}: ILiveStreamIconProps) {
  const [status, setStatus] = useState('offline');
  const { getSocket, socketStatus, connected } = useContext(SocketContext);
  const timeout = useRef(null);

  const checkStreaming = () => {
    const socket = getSocket();
    socket?.emit('check-streaming', { performerId }, (data) => {
      if (!data.status) {
        setStatus('offline');
      } else {
        setStatus(data.status);
      }
    });
    timeout.current = setTimeout(checkStreaming, 10000);
  };

  useEffect(() => {
    if (!performerId || !connected()) return;

    timeout.current = setTimeout(checkStreaming, 1000);
    // eslint-disable-next-line consistent-return
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [performerId, socketStatus]);

  return (
    <Tooltip title="Live Stream">
      <IconLive status={status} />
    </Tooltip>
  );
}
