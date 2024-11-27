import { Router } from 'next/router';
import { useContext, useEffect } from 'react';

import { SocketContext } from './SocketContext';

type IEventProps = {
  event: string;
  handler: Function;
  handleRouterChange?: boolean;
}

export function Event({
  event,
  handler,
  handleRouterChange = false
}: IEventProps) {
  if (typeof window === 'undefined') return null;

  const { getSocket, socketStatus, connected } = useContext(SocketContext);

  const _handleRouteChangeComplete = () => {
    const socket = getSocket();
    handleRouterChange && socket?.on(event, handler);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(event, handler);
    Router.events.off('routeChangeComplete', _handleRouteChangeComplete);
  };

  useEffect(() => {
    if (!connected()) return handleOffSocket();

    const socket = getSocket();
    Router.events.on('routeChangeComplete', _handleRouteChangeComplete);
    socket?.on(event, handler);

    return handleOffSocket;
  }, [socketStatus]);

  return null;
}

export default Event;
