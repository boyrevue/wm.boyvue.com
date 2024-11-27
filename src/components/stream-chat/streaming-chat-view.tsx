import * as React from 'react';
import { IUser } from 'src/interfaces';

import style from './streaming-chat-view.module.less';

interface Props<T> {
  members: T[];
}

function StreamingChatUsers({
  members
}: Props<IUser>) {
  return (

    <div className={style['conversation-users']}>
      <div className="users">
        {members.length > 0
          && members.map((member) => (
            <div className="user" key={member._id}>
              <span className="username">
                <img
                  alt="avatar"
                  src={member?.avatar || '/no-avatar.png'}
                  width="35px"
                  height="35px"
                  style={{ borderRadius: '50%', marginRight: '5px' }}
                />
                {member.name}

              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default StreamingChatUsers;
