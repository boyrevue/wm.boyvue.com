import { createReducers } from '@lib/redux';
import { logout } from '@redux/auth/actions';
import { merge } from 'lodash';
import { IReduxAction, IUser } from 'src/interfaces';

import {
  setUpdating,
  updateBalance,
  updateCurrentUser,
  updateCurrentUserAvatar,
  updateCurrentUserCover,
  updateUserFail,
  updateUserSuccess
} from './actions';

const initialState = {
  current: {
    _id: null,
    avatar: '/no-avatar.png',
    cover: null,
    name: '',
    email: ''
  },
  error: null,
  updateSuccess: false,
  updating: false
};

const userReducers = [
  {
    on: updateCurrentUser,
    reducer(state: any, data: any) {
      return {
        ...state,
        current: data.payload,
        updating: false
      };
    }
  },
  {
    on: updateCurrentUserAvatar,
    reducer(state: any, data: any) {
      return {
        ...state,
        current: {
          ...state.current,
          avatar: data.payload
        }
      };
    }
  },
  {
    on: updateCurrentUserCover,
    reducer(state: any, data: any) {
      return {
        ...state,
        current: {
          ...state.current,
          cover: data.payload
        }
      };
    }
  },
  {
    on: updateUserSuccess,
    reducer(state: any, data: IReduxAction<IUser>) {
      return {
        ...state,
        current: data.payload,
        updateSuccess: true,
        updating: false,
        error: null
      };
    }
  },
  {
    on: updateUserFail,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        updateUser: null,
        updateSuccess: false,
        error: data.payload
      };
    }
  },
  {
    on: setUpdating,
    reducer(state: any, data: IReduxAction<boolean>) {
      return {
        ...state,
        updating: data.payload,
        updateSuccess: false
      };
    }
  },
  {
    on: logout,
    reducer() {
      return {
        ...initialState
      };
    }
  },
  {
    on: updateBalance,
    reducer(state, action: IReduxAction<number>) {
      const { current } = state;
      current.balance += action.payload;
      return {
        ...state,
        current: { ...current }
      };
    }
  }
];

export default merge({}, createReducers('user', [userReducers], initialState));
