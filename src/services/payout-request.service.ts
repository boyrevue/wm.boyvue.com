import { APIRequest } from './api-request';

class PayoutRequestService extends APIRequest {
  calculate(payload: any) {
    return this.post('/payout-requests/performer/calculate', payload);
  }

  stats() {
    return this.post('/payout-requests/performer/stats');
  }

  search(query: { [key: string]: any }) {
    return this.get(this.buildUrl('/payout-requests/performer/search', query));
  }

  create(body: any) {
    return this.post('/payout-requests/performer', body);
  }

  update(id: string, body: any) {
    return this.put(`/payout-requests/performer/${encodeURIComponent(id)}`, body);
  }

  detail(
    id: string,
    headers: {
      [key: string]: string;
    }
  ): Promise<any> {
    return this.get(`/payout-requests/performer/${encodeURIComponent(id)}/view`, headers);
  }

  checkPending() {
    return this.post('/payout-requests/performer/check-pending');
  }

  totalPayoutRequest() {
    return this.get('/payout-requests/performer/stats/total-requested-price');
  }
}

export const payoutRequestService = new PayoutRequestService();
