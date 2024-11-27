import { createSagas } from '@lib/redux';
import { commentService } from '@services/index';
import { message } from 'antd';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import {
  createComment, createCommentFail, createCommentSuccess, deleteComment, deleteCommentFail, deleteCommentSuccess,
  getComments, getCommentsFail, getCommentsSuccess, moreComment, moreCommentFail,
  moreCommentSuccess
} from './actions';

const commentSagas = [
  {
    on: getComments,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.search(data.payload);
        yield put(getCommentsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(getCommentsFail(error));
      }
    }
  },
  {
    on: moreComment,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.search(data.payload);
        yield put(moreCommentSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(moreCommentFail(error));
      }
    }
  },
  {
    on: createComment,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield commentService.create(data.payload);
        yield put(createCommentSuccess(resp.data));
        message.success('Commented successfully');
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(createCommentFail(error));
      }
    }
  },
  {
    on: deleteComment,
    * worker(data: IReduxAction<any>) {
      try {
        yield commentService.delete(data.payload._id);
        yield put(deleteCommentSuccess(data.payload));
        message.success('Removed successfully!');
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Error occured, please try again later');
        yield put(deleteCommentFail(error));
      }
    }
  }
];

export default flatten([createSagas(commentSagas)]);
