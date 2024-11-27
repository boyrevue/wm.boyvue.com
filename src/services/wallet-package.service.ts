/* eslint-disable linebreak-style */
/* eslint-disable indent */
import { APIRequest } from './api-request';

export class WalletPackageService extends APIRequest {
  search(query) {
    return this.get(this.buildUrl('/wallet-package', query as any));
  }
}

export const walletPackageService = new WalletPackageService();
