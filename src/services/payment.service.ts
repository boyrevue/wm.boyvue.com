import { APIRequest } from './api-request';

export class PaymentService extends APIRequest {
  subscribe(payload: any) {
    return this.post('/payment/subscribe/performers', payload);
  }

  getListTransactions(payload) {
    return this.get(this.buildUrl('/payment/transactions', payload));
  }

  userSearchTransactions(payload) {
    return this.get(this.buildUrl('/transactions/user/search', payload));
  }

  purchaseVideo(payload) {
    return this.post('/payment/purchase-video', payload);
  }

  purchaseVideoWallet(payload) {
    return this.post('/payment-wallet/purchase-video', payload);
  }

  purchaseProducts(products: any) {
    return this.post('/payment/purchase-products', products);
  }

  purchaseProductsWallet(products: any) {
    return this.post('/payment-wallet/purchase-products', products);
  }

  purchaseSinglePhoto(photo: any) {
    return this.post('/payment/purchase-single-photo', photo);
  }

  applyCoupon(code: any) {
    return this.post(`/coupons/${code}/apply-coupon`);
  }

  cancelSubscription(id: string) {
    return this.post(`/subscriptions/cancel/${encodeURIComponent(id)}`);
  }

  tipPerformer(data) {
    return this.post('/payment/send-tip', data);
  }

  purchaseMessage(id, payload) {
    return this.post(`/payment/purchase-message/${encodeURIComponent(id)}`, payload);
  }

  purchaseWalletPackage(payload: {
    walletPackageId: string;
    paymentGateway: string;
  }) {
    return this.post('/payment/purchase-tokens', payload);
  }

  purchaseFeed(payload) {
    return this.post('/payment/purchase-feed', payload);
  }

  purchaseFeedWallet(feedId: string) {
    return this.post('/payment-wallet/purchase-feed', { feedId });
  }
}

export const paymentService = new PaymentService();
