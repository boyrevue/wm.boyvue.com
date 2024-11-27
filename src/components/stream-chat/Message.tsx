import { CrownTwoTone, MoreOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import classnames from 'classnames';
import moment from 'moment';
import React from 'react';

// import { chatBoxMessageClassName } from '@lib/utils';
import style from './Message.module.less';

type IProps = {
  data: any;
  isMine: boolean;
  startsSequence: boolean;
  endsSequence: boolean;
  showTimestamp: boolean;
  isOwner: boolean;
  canDelete: boolean;
  onDelete: Function;
}

export default function Message(props: IProps) {
  const {
    data,
    isMine,
    startsSequence,
    endsSequence,
    showTimestamp,
    isOwner,
    canDelete,
    onDelete
  } = props;
  const friendlyTimestamp = moment(data.timestamp).format('LLLL');
  // const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const menu = (
    <Menu items={[{
      key: 'delete',
      label: <span role="none" onClick={() => onDelete()}>Delete</span>
    }]}
    />
  );

  const classNames = classnames(
    `${style.message} `,
    { [`${style.mine}`]: isMine },
    { [`${style.tip}`]: data.type === 'tip' },
    { start: !!startsSequence },
    { end: !!endsSequence }
  );

  return (
    <div className={classNames}>
      {data.text && !data.isSystem && (
        <div className={style['bubble-container']}>
          {data.senderInfo && !(data.type === 'tip') && (<img src={data.senderInfo.avatar || '/no-avatar.png'} alt={data.senderInfo.username} className="avatar-sender" />)}
          <div className={style.bubble} title={friendlyTimestamp}>
            {data.senderInfo && (
              <span className="u-name">
                {isOwner && <CrownTwoTone twoToneColor="#eb2f96" />}
                {data.senderInfo.username}
                {data.type !== 'tip' ? ': ' : ' '}
              </span>
            )}
            {!data.imageUrl && data.text}
            {' '}
            {data.imageUrl && (
              <a
                title="Click to view full content"
                href={
                  data.imageUrl.indexOf('http') === -1 ? '#' : data.imageUrl
                }
                target="_blank"
                rel="noreferrer"
                aria-hidden
              >
                <img src={data.imageUrl} width="180px" alt="" />
              </a>
            )}
          </div>
          {canDelete && (
          <Dropdown overlay={menu} placement="topRight">
            <span>
              <MoreOutlined />
              {' '}
            </span>
          </Dropdown>
          )}
        </div>
      )}
      {data.text && data.isSystem && (
        <p style={{ textAlign: 'center', fontSize: '13px' }}>{data.text}</p>
      )}
      {showTimestamp && !data.isSystem && (
        <div className={style.timestamp}>{friendlyTimestamp}</div>
      )}
    </div>
  );
}
