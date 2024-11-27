import { APIRequest } from './api-request';

export class OrderService extends APIRequest {
  search(payload) {
    return this.get(this.buildUrl('/orders/details/search', payload));
  }

  userSearch(payload) {
    return this.get(this.buildUrl('/orders/users/search', payload));
  }

  detailsSearch(payload) {
    return this.get(this.buildUrl('/orders/users/details/search', payload));
  }

  userSearchProduct(payload) {
    return this.get(this.buildUrl('/orders/users/products/search', payload));
  }

  performersSearchProduct(payload) {
    return this.get(this.buildUrl('/orders/performers/products/search', payload));
  }

  findById(id, headers?: { [key: string]: string }) {
    return this.get(`/orders/details/${encodeURIComponent(id)}`, headers);
  }

  update(id, data) {
    return this.put(`/orders/${encodeURIComponent(id)}/update`, data);
  }

  getDownloadLinkDigital(productId: string) {
    return this.get(
      `/user/performer-assets/products/${productId}/download-link`
    );
  }
}

export const orderService = new OrderService();
