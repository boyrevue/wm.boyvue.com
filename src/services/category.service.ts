import { APIRequest } from './api-request';

export class CategoryService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/categories/search', query));
  }
}

export const categoryService = new CategoryService();
