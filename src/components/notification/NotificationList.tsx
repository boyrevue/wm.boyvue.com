import { INotification } from '@interfaces/notification';
import { fetchNotificaion } from '@redux/notification/actions';
import { notificationService } from '@services/notification.service';
import { Button } from 'antd';
import List, { ListProps } from 'antd/lib/list';
import { CSSProperties, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import styleList from './NotificationList.module.less';
import NotificationListItem from './NotificationListItem';

interface NotificationListProps extends ListProps<INotification> {
  notificationIds: string[];
  style: CSSProperties
}

function NotificationList({ ...props }: NotificationListProps) {
  const dispatch = useDispatch();

  const fetchData = () => {
    dispatch(fetchNotificaion());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const readAll = async () => {
    await notificationService.readAll();
    fetchData();
  };

  return (
    <div className={styleList['notification-page']}>
      <List {...props}>
        <div className={styleList['notification-page-header']}>
          <h3>All Notifications</h3>
          <Button className={styleList['btn-dismiss-all']} onClick={readAll}>Mark as read</Button>
        </div>
        <NotificationListItem />
      </List>
    </div>
  );
}

export default NotificationList;
