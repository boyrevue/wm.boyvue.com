import { createSagas } from '@lib/redux';
import { productService } from '@services/index';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import {
  listProducts, listProductsFail, listProductsSuccess, moreProduct,
  moreProductFail, moreProductSuccess
} from './actions';

const productSagas = [
  {
    on: listProducts,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield productService.userSearch(data.payload);
        yield put(listProductsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(listProductsFail(error));
      }
    }
  },
  {
    on: moreProduct,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield productService.userSearch(data.payload);
        yield put(moreProductSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreProductFail(error));
      }
    }
  }
];

export default flatten([createSagas(productSagas)]);
