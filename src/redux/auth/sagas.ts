import { createSagas } from '@lib/redux';
import { message } from 'antd';
import { flatten } from 'lodash';
import * as _ from 'lodash';
import Router from 'next/router';
import { put } from 'redux-saga/effects';
import { authService, settingService, userService } from 'src/services';

import { updateCurrentUser } from '../user/actions';
import {
  forgot,
  forgotFail,
  forgotSuccess,
  login,
  loginFail,
  loginSuccess,
  logout,
  registerFan,
  registerFanFail,
  registerFanSuccess,
  registerPerformer,
  registerPerformerFail,
  registerPerformerSuccess
} from './actions';

const authSagas = [
  {
    on: login,
    * worker(data: any) {
      try {
        const { payload } = data;
        const resp = (yield authService.login(payload)).data;
        // store token, update store and redirect to dashboard page
        yield authService.setToken(resp.token, payload.remember);
        const userResp = (yield userService.me()).data;
        yield put(updateCurrentUser(userResp));
        yield put(loginSuccess());
        if (userResp.isPerformer) Router.push(`/${userResp.username}`);
        if (!userResp.isPerformer) Router.push('/');
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Incorrect credentials!');
        yield put(loginFail(error));
      }
    }
  },
  {
    on: registerFan,
    * worker(data: any) {
      try {
        const { payload } = data;
        const resp = (yield authService.register(payload)).data;
        message.success(resp && resp.message, 5);
        Router.push('/auth/login');
        yield put(registerFanSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error.message || 'Username or email has been taken.');
        yield put(registerFanFail(error));
      }
    }
  },

  {
    on: registerPerformer,
    * worker(data: any) {
      try {
        const verificationFiles = [{
          fieldname: 'idVerification',
          file: data.payload.idVerificationFile
        }, {
          fieldname: 'documentVerification',
          file: data.payload.documentVerificationFile
        }];
        const payload = _.pick(data.payload, ['name', 'username', 'password', 'gender', 'email', 'firstName', 'lastName', 'country', 'dateOfBirth']);
        const resp = (yield authService.registerPerformer(verificationFiles, payload, () => {
        // put progressing to view
        })).data;
        const settings = yield settingService.valueByKeys(['ondatoEnabled']);
        message.success(resp && resp.message, 5);
        if (settings.ondatoEnabled) {
          Router.push(resp.data.url);
        } else {
          Router.push('/auth/login');
        }
        yield put(registerPerformerSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error.message || 'This Username or email ID has been already taken.', 5);
        yield put(registerPerformerFail(error));
      }
    }
  },

  {
    on: logout,
    * worker() {
      yield authService.removeToken();
      // Router.push('/auth/login');
      window.location.href = '/auth/login';
    }
  },
  {
    on: forgot,
    * worker(data: any) {
      try {
        const { payload } = data;
        const resp = (yield authService.resetPassword(payload)).data;
        message.success(
          'We\'ve sent an email to reset your password, please check your inbox.',
          10
        );
        yield put(forgotSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error((error && error.message) || 'Something went wrong. Please try again later', 5);
        yield put(forgotFail(error));
      }
    }
  }
];

export default flatten([createSagas(authSagas)]);
