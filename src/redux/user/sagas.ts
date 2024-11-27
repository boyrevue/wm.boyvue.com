import { createSagas } from '@lib/redux';
import { performerService, userService } from '@services/index';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import {
  setUpdating,
  updatePerformer,
  updateUser,
  updateUserFail,
  updateUserSuccess
} from './actions';

const userSagas = [
  // TODO - defind update current user or get from auth user info to reload current user data if needed
  {
    on: updateUser,
    * worker(data: IReduxAction<any>) {
      try {
        yield put(setUpdating(true));
        const updated = yield userService.updateMe(data.payload);
        yield put(updateUserSuccess(updated.data));
      } catch (e) {
        // TODO - alert error
        const error = yield Promise.resolve(e);
        yield put(updateUserFail(error));
      }
    }
  },
  {
    on: updatePerformer,
    * worker(data: IReduxAction<any>) {
      try {
        yield put(setUpdating(true));
        const updated = yield performerService.updateMe(data.payload._id, data.payload);
        yield put(updateUserSuccess(updated.data));
      } catch (e) {
        // TODO - alert error
        const error = yield Promise.resolve(e);
        yield put(updateUserFail(error));
      } finally {
        yield put(setUpdating(false));
      }
    }
  }
];

export default flatten([createSagas(userSagas)]);
