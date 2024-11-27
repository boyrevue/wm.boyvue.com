import {
  UserAddOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from 'src/icons';
import { IPerformer } from 'src/interfaces';
import { SocketContext } from 'src/socket';

import style from './performer-card.module.less';

type IProps = {
  performer: IPerformer;
  linkToLiveStream?: boolean;
};

export function PerformerCard({ performer, linkToLiveStream = false }: IProps) {
  const loggedIn = useSelector((state: any) => state.auth.loggedIn);
  const { getSocket, socketStatus, connected } = useContext(SocketContext);
  const [online, setOnline] = useState(performer.isOnline);

  const handleOnlineOffline = (data) => {
    if (data.id !== performer._id) return;
    setOnline(data.online);
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on('online', handleOnlineOffline);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off('online', handleOnlineOffline);
  };

  const handleRedirect = (e: any) => {
    if (linkToLiveStream && !loggedIn) {
      e.preventDefault();
      Router.push('/auth/login');
      return;
    }
    if (linkToLiveStream && performer.streamingStatus === 'private') {
      e.preventDefault();
      message.error({ content: 'Model is streaming privately and will be available soon', key: 'error-pvt-chat' });
    }
  };

  useEffect(() => {
    if (!connected()) return handleOffSocket();
    handleSocket();
    return handleOffSocket;
  }, [socketStatus]);

  const href = linkToLiveStream
    ? {
      pathname: '/stream/[username]',
      query: { username: performer?.username || performer?._id }
    }
    : {
      pathname: '/model/[username]',
      query: { username: performer?.username || performer?._id }
    };
  const as = linkToLiveStream
    ? `/stream/${performer?.username || performer?._id}`
    : `/${performer?.username || performer?._id}`;

  return (
    <div className={style['model-card']}>
      <div className="card-top">
        <div className="card-top-lable">
          <UserAddOutlined />
          <span>
            $
            {' '}
            {performer?.monthlyPrice}
          </span>
        </div>
        <div className="card-top-status">
          {performer.streamingStatus === 'public' && (<div className="live-status"><span>live</span></div>)}
          {performer.streamingStatus === 'private' && (<div className="private-status"><span>Private</span></div>)}
        </div>
        <Link href={href} as={as}>
          <a onClick={handleRedirect} aria-hidden className="img-cover" style={{ backgroundImage: `url(${performer?.avatar || '/no-avatar.png'})` }}>
            <img className="card-top-avatar" src={performer?.avatar || '/no-avatar.png'} alt="" />
          </a>
        </Link>
      </div>
      <div className="card-bottom">

        <Link href={href} as={as}>
          <a aria-hidden onClick={handleRedirect}>
            <div className="status-model">
              {performer.streamingStatus !== 'private' && performer.streamingStatus !== 'public' && online && (<span className="online-status active" />)}
              {performer.streamingStatus === 'offline' && !online && (<span className="online-status" />)}
            </div>
            <h3>{performer?.name || performer?.username || 'N/A'}</h3>
            {' '}
            <span>{performer?.verifiedAccount && <CheckIcon />}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

export default PerformerCard;
