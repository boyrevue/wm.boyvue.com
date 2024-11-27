import { createReducers } from '@lib/redux';
import { merge } from 'lodash';

import { openTopupModal } from './actions';

const initialState = {
  openTopup: false
};

const walletReducer = [
  {
    on: openTopupModal,
    reducer(state: any, data: any) {
      return {
        ...state,
        openTopup: data.payload.open
      };
    }
  }
];

export default merge({}, createReducers('wallet', [walletReducer], initialState));
