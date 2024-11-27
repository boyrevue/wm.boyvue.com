import { all, spawn } from 'redux-saga/effects';

import authSagas from './auth/sagas';
import bannerSagas from './banner/sagas';
import commentSagas from './comment/sagas';
import feedSagas from './feed/sagas';
import gallerySagas from './gallery/sagas';
import messageSagas from './message/sagas';
import notificationSagas from './notification/sagas';
import performerSagas from './performer/sagas';
import productSagas from './product/sagas';
import streamChatSagas from './stream-chat/sagas';
import userSagas from './user/sagas';
import videoSagas from './video/sagas';

function* rootSaga() {
  yield all(
    [
      ...authSagas,
      ...userSagas,
      ...performerSagas,
      ...videoSagas,
      ...productSagas,
      ...commentSagas,
      ...gallerySagas,
      ...bannerSagas,
      ...messageSagas,
      ...streamChatSagas,
      ...feedSagas,
      ...notificationSagas
    ].map(spawn)
  );
}

export default rootSaga;
