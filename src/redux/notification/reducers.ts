import { IReduxAction } from '@interfaces/redux';
import { createReducers } from '@lib/redux';
import { merge } from 'lodash';

import {
  addNotificaionFail,
  addNotificaionSuccess,
  fetchNotificaionFail,
  fetchNotificaionSuccess,
  setNotificationLoading,
  setReadItem,
  setUnreadCount
} from './actions';

const initialState = {
  loading: false,
  error: null,
  success: false,
  notificationIds: [],
  notificationMapping: {},
  dataSource: [],
  page: 1,
  total: 0
};

const reducer = [
  {
    on: setNotificationLoading,
    reducer: (state, action: IReduxAction<boolean>) => ({
      ...state,
      loading: action.payload
    })
  },
  {
    on: fetchNotificaionSuccess,
    reducer(state: any, action: IReduxAction<any>) {
      const notificationIds = action.payload.data.map((data) => data._id);
      const notificationMapping = action.payload.data.reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          [currentValue._id]: currentValue
        }),
        {}
      );
      return {
        ...state,
        loading: false,
        notificationIds,
        notificationMapping,
        dataSource: action.payload.data,
        page: state.page + 1,
        error: null,
        success: true
      };
    }
  },
  {
    on: fetchNotificaionFail,
    reducer(state: any, action: IReduxAction<any>) {
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false
      };
    }
  },
  {
    on: addNotificaionSuccess,
    reducer(state: any, action: IReduxAction<any>) {
      const notificationIds = action.payload.data.map((data) => data._id);
      const notificationMapping = action.payload.data.reduce(
        (previousValue, currentValue) => ({
          ...previousValue,
          [currentValue._id]: currentValue
        }),
        {}
      );
      return {
        ...state,
        loading: false,
        notificationIds: [...state.notificationIds, ...notificationIds],
        notificationMapping: Object.assign(state.notificationMapping, notificationMapping),
        dataSource: [...state.dataSource, ...action.payload.data],
        page: state.page + 1,
        error: null,
        success: true
      };
    }
  },
  {
    on: addNotificaionFail,
    reducer(state: any, action: IReduxAction<any>) {
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    }
  },
  {
    on: setUnreadCount,
    reducer(state: any, action: IReduxAction<any>) {
      return {
        ...state,
        total: action.payload
      };
    }
  },
  {
    on: setReadItem,
    reducer(state: any) {
      return {
        ...state,
        total: state.total ? state.total - 1 : 0
      };
    }
  }
];

export default merge(
  {},
  createReducers('notification', [reducer], initialState)
);
