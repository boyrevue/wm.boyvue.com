import { createReducers } from '@lib/redux';
import { merge } from 'lodash';
import { IReduxAction } from 'src/interfaces';

import { accessPrivateRequest, addPrivateRequest, updateLiveStreamSettings } from './actions';

const initialState = {
  settings: {
    viewerURL: '',
    publisherURL: '',
    optionForBroadcast: 'hls',
    optionForPrivate: 'hls',
    secureOption: false
  },
  privateRequests: [],
  total: 0
};

const reducers = [
  {
    on: addPrivateRequest,
    reducer(state: any, action: IReduxAction<any>) {
      return {
        ...state,
        privateRequests: [...state.privateRequests, action.payload],
        total: state.total + 1
      };
    }
  },
  {
    on: accessPrivateRequest,
    reducer(state: any, action: IReduxAction<string>) {
      return {
        ...state,
        privateRequests: state.privateRequests.filter((p) => p.conversationId !== action.payload),
        total: state.total - 1
      };
    }
  },
  {
    on: updateLiveStreamSettings,
    reducer(state: any, action: IReduxAction<any>) {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    }
  }
];
export default merge({}, createReducers('streaming', [reducers], initialState));
