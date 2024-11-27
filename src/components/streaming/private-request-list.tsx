import { getResponseError } from '@lib/utils';
import { streamService } from '@services/stream.service';
import { Button, message } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';

import style from './streaming.module.less';

function PrivateRequestList() {
  const _timeout = useRef(null);
  const [list, setList] = useState([]);
  const loadList = async () => {
    if (_timeout.current) clearTimeout(_timeout.current);
    const res = await streamService.getPrivateList();
    setList(res.data);
    const els = document.querySelectorAll('.privateRequestTotal');
    [].forEach.call(els, (el) => {
      // eslint-disable-next-line no-param-reassign
      if (els) el.innerHTML = `${res?.data?.length || 0}`;
    });
    _timeout.current = setTimeout(() => {
      loadList();
    }, 5000);
  };

  const acceptRequest = (request) => {
    // router.push(
    //   {
    //     // TODO - check webrtc mode
    //     pathname: '/model/live/privatechat/[id]',
    //     query: { id: request.conversationId }
    //   },
    //   `/model/live/privatechat/${request.conversationId}`
    // );

    // message.destroy();
    window.location.href = `/model/live/privatechat/${request.conversationId}`;
  };

  const rejectRequest = async (id) => {
    try {
      // const newlist = list.filter((item) => item.id !== id);
      await streamService.rejectPrivateList(id);
      setList((prevList) => prevList.filter((item) => item.streamId !== id));
      message.success('You rejected successfully');
    } catch (error) {
      const e = await Promise.resolve(error);
      message.error(getResponseError(e));
    }
  };

  useEffect(() => {
    loadList();

    return () => {
      if (_timeout.current) clearTimeout(_timeout.current);
    };
  }, []);

  if (!list.length) return <div style={{ padding: '15px', textAlign: 'center' }}>No private request available!</div>;

  return (
    <ul className={style['list-request']}>
      {list.map((item) => (
        <li style={{ padding: '15px', textAlign: 'center' }} key={item.conversationId}>
          <div className="list-request-left">
            <img src={item.requester.avatar} alt={item.requester.username} />
            <div>
              <h4>{item.requester.username}</h4>
              {moment(item.createdAt).fromNow()}
            </div>
          </div>
          <div className="list-request-right">
            <Button onClick={() => rejectRequest(item.streamId)}>
              Reject
            </Button>
            <Button type="primary" onClick={() => acceptRequest(item)}>
              Accept
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default PrivateRequestList;
