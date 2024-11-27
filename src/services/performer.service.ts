import { APIRequest } from './api-request';

export class PerformerService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/search', query));
  }

  topModels() {
    return this.get('/ranking-performers');
  }

  me(headers?: { [key: string]: string }) {
    return this.get('/performers/me', headers);
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performers/${encodeURIComponent(id)}`, headers);
  }

  getAvatarUploadUrl() {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return `${baseApiEndpoint}/performers/avatar/upload`;
  }

  getCoverUploadUrl() {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return `${baseApiEndpoint}/performers/cover/upload`;
  }

  getVideoUploadUrl() {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return `${baseApiEndpoint}/performers/welcome-video/upload`;
  }

  updateMe(id: string, payload: any) {
    return this.put(`/performers/${encodeURIComponent(id)}`, payload);
  }

  increaseView(id: string) {
    return this.post(`/performers/${encodeURIComponent(id)}/inc-view`);
  }

  checkSubscribe(id: string) {
    return this.post(`/performers/${encodeURIComponent(id)}/check-subscribe`);
  }

  updateBanking(id: string, payload: any) {
    return this.put(`/performers/${encodeURIComponent(id)}/banking-settings`, payload);
  }

  updatePaymentGateway(id, payload) {
    return this.put(`/performers/${encodeURIComponent(id)}/payment-gateway-settings`, payload);
  }

  updatePaypal(id, payload) {
    return this.put(`/performers/${encodeURIComponent(id)}/paypal-settings`, payload);
  }

  getDocumentUploadUrl() {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return `${baseApiEndpoint}/performers/documents/upload`;
  }

  getCommissions() {
    return this.get('/performers/commissions');
  }
}

export const performerService = new PerformerService();
