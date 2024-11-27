import { merge } from 'lodash';
import { combineReducers } from 'redux';

import auth from './auth/reducers';
import banner from './banner/reducers';
import cart from './cart/reducers';
import comment from './comment/reducers';
import feed from './feed/reducers';
import gallery from './gallery/reducers';
import message from './message/reducers';
import notification from './notification/reducers';
import performer from './performer/reducers';
import photo from './photo/reducers';
import product from './product/reducers';
import settings from './settings/reducers';
import conversation from './stream-chat/reducers';
import streaming from './streaming/reducers';
import ui from './ui/reducers';
import user from './user/reducers';
import video from './video/reducers';
import wallet from './wallet/reducers';

const reducers = merge(
  settings,
  ui,
  user,
  auth,
  performer,
  gallery,
  video,
  photo,
  product,
  comment,
  cart,
  banner,
  message,
  streaming,
  conversation,
  message,
  notification,
  wallet,
  feed
);

export default combineReducers(reducers);
