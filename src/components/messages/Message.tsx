import { IUser } from '@interfaces/index';
import { Image } from 'antd';
import moment from 'moment';
import React from 'react';

import style from './Message.module.less';

type IProps = {
  data: any;
  isMine: boolean;
  startsSequence: boolean;
  endsSequence: boolean;
  showTimestamp: boolean;
  currentUser: IUser,
  recipient: IUser,
}

export default function Message(props: IProps) {
  const {
    data, isMine, startsSequence, endsSequence, showTimestamp, currentUser, recipient
  } = props;

  const friendlyTimestamp = moment(data.createdAt).format('LLLL');
  return (
    <div
      className={[
        `${style.message}`,
        `${isMine ? style.mine : ''} `,
        `${startsSequence ? 'start' : ''} `,
        `${endsSequence ? 'end' : ''} `
      ].join(' ')}
    >

      {data.text && (
        <div className={style['bubble-container']}>
          {!isMine && <img alt="" className={style.avatar} src={recipient?.avatar || '/no-avatar.png'} />}
          <div className={style.bubble} title={friendlyTimestamp}>
            {!data.imageUrl && data.text}
            {' '}
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            {data.imageUrl && <Image alt="" src={data.imageUrl} width="180px" />}
          </div>
          {isMine && <img alt="" src={currentUser?.avatar || '/no-avatar.png'} className={style.avatar} />}
        </div>
      )}
      {showTimestamp && <div className={style.timestamp}>{friendlyTimestamp}</div>}
    </div>
  );
}
