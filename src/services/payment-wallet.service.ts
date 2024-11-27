import { APIRequest } from './api-request';

class PaymentWalletService extends APIRequest {
  search(param?: any) {
    return this.get(this.buildUrl('/wallet-transactions/user/search', param));
  }

  sendTip(
    performerId: string,
    data: { amount: number; conversationId?: string }
  ) {
    return this.post(`/payment-wallet/send-tip-wallet/${performerId}`, data);
  }

  tipFeed(data: { performerId: string, amount: number; feedId: string }) {
    return this.post('/payment-wallet/tip-feed', data);
  }

  purchaseWallet(payload: { amount: number; paymentGateway: string }) {
    return this.post('/payment/purchase-wallet/custom-amount', payload);
  }

  public sendPaidToken(conversationId: string) {
    return this.post(`/wallet-transactions/pay-wallet/${conversationId}`);
  }

  sendPrivateChat(conversationId: string) {
    // TODO - should use socket or other method?
    return this.post(`/payment-wallet/send-private-chat/${conversationId}`);
  }
}

export const paymentWalletService = new PaymentWalletService();
