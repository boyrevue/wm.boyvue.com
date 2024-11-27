import { createReducers } from '@lib/redux';
import { merge } from 'lodash';

import { updateSettings } from './actions';

const initialState = {
  ccbillEnabled: false,
  verotelEnabled: false,
  emerchantEnabled: false
};

const settingReducers = [
  {
    on: updateSettings,
    reducer(state: any, data: any) {
      return {
        ...state,
        ...data.payload
      };
    }
  }
];

export default merge({}, createReducers('settings', [settingReducers], initialState));
