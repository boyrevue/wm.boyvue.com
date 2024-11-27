import { capitalizeFirstLetter } from '@lib/string';
import { fetchNotificaion, setReadItem } from '@redux/notification/actions';
import { notificationService } from '@services/notification.service';
import {
  Avatar, Col, Menu, message,
  Row
} from 'antd';
import moment from 'moment';
import Router from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { INotification } from 'src/interfaces';
import { SocketContext } from 'src/socket';

import style from './NotificationListItem.module.less';

const SEND_NOTIFICATION = 'send_notification';

function NotificationListItem() {
  const { getSocket, socketStatus, connected } = useContext(SocketContext);

  const notifications = useSelector(
    createSelector(
      (state: any) => state.notification.success,
      (state: any) => state.notification.error,
      (state: any) => state.notification.dataSource,
      (success, error, data) => {
        if (success && !error) return data;
        return [];
      }
    )
  ) as INotification[];

  const dispatch = useDispatch();

  const fetchData = async () => {
    dispatch(fetchNotificaion());
  };

  const onReceiveNotification = (data) => {
    fetchData();
    message.success(data?.title || data?.message || 'You received a new notification');
  };

  const handleSocket = () => {
    const socket = getSocket();
    socket?.on(SEND_NOTIFICATION, onReceiveNotification);
  };

  const handleOffSocket = () => {
    const socket = getSocket();
    socket?.off(SEND_NOTIFICATION, onReceiveNotification);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!connected()) return handleOffSocket();
    handleSocket();
    return handleOffSocket;
  }, [socketStatus]);

  const redirect = (notification) => {
    switch (notification.type) {
      case 'video':
        return Router.push(`/video/${notification.refId}`);
      case 'public-stream':
        return Router.push({
          pathname: '/stream',
          query: {
            username: notification.refId
          }
        }, `/stream/${notification.refId}`);
      default: return null;
    }
  };

  const onClickItem = (notification) => {
    if (!notification.read) {
      // goi api PUT read
      notificationService.read(notification._id);
      dispatch(setReadItem(notification._id));
    }
    redirect(notification);
  };

  const getMenuChildren = () => {
    if (!notifications.length) {
      return [{
        key: 'no-notification',
        label: 'There are no notifications.'
      }];
    }

    return notifications.map((notification) => ({
      key: notification._id,
      label: (
        <Row
          className={`notification-item ${!notification.read ? 'notification-unread' : 'notification-read'}`}
          onClick={() => onClickItem(notification)}
        >
          <Col md={3}>
            <Avatar src={notification.thumbnail || '/no-image.jpg'} />
          </Col>
          <Col md={18}>
            <div className="notification-item-list">
              <div className="message">{capitalizeFirstLetter(notification.title)}</div>
              <span className="time"><small>{moment(notification.updatedAt).fromNow()}</small></span>
            </div>
            {!notification.read && (
              <span className={style['icon-dismiss']} />
            )}
          </Col>

        </Row>
      )
    }));
  };

  return (
    <Menu
      title="Notifications"
      className={style['notification-page']}
      items={getMenuChildren()}
    />
  );
}

NotificationListItem.displayName = 'NotificationListItem';

export default NotificationListItem;
