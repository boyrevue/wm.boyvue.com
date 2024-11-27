import { createSagas } from '@lib/redux';
import { notificationService } from '@services/index';
import { flatten } from 'lodash';
import { put, select } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import {
  addNotificaion,
  addNotificaionFail,
  addNotificaionSuccess,
  fetchNotificaion,
  fetchNotificaionFail,
  fetchNotificaionSuccess,
  setNotificationLoading,
  setUnreadCount
} from './actions';

const bannerSagas = [
  {
    on: fetchNotificaion,
    * worker(data: IReduxAction<any>) {
      try {
        yield setNotificationLoading(true);
        const resp = yield notificationService.search({
          limit: 12, sort: 'desc', sortBy: 'updatedAt', ...data.payload
        });
        const unread = yield notificationService.countUnread();
        yield put(fetchNotificaionSuccess(resp.data));
        yield put(setUnreadCount(unread.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(fetchNotificaionFail(error));
      } finally {
        yield setNotificationLoading(false);
      }
    }
  },
  {
    on: addNotificaion,
    * worker(data: IReduxAction<any>) {
      try {
        yield setNotificationLoading(true);
        const page = yield select((state) => state.notification.page);
        const resp = yield notificationService.search({
          limit: 12, offset: (page - 1) * 1, sort: 'desc', sortBy: 'updatedAt', ...data.payload
        });
        yield put(addNotificaionSuccess(resp.data));
        const unread = yield notificationService.countUnread();
        yield put(setUnreadCount(unread.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(addNotificaionFail(error));
      } finally {
        yield setNotificationLoading(false);
      }
    }
  }
];

export default flatten([createSagas(bannerSagas)]);
