import { createAction, createAsyncAction } from '@lib/redux';

export const { fetchNotificaion, fetchNotificaionSuccess, fetchNotificaionFail } = createAsyncAction('fetchNotificaion', 'FETCH_NOTIFICATION');
export const { addNotificaion, addNotificaionSuccess, addNotificaionFail } = createAsyncAction('addNotificaion', 'ADD_NOTIFICATION');
export const setNotificationLoading = createAction('SET_NOTIFICATION_LOADING');
export const setUnreadCount = createAction('SET_NOTIFICATION_UNREAD');
export const setReadItem = createAction('SET_NOTIFICATION_READ');
