import { APIRequest } from './api-request';

export class UserService extends APIRequest {
  me(headers?: { [key: string]: string }) {
    return this.get('/users/me', headers);
  }

  updateMe(payload: any) {
    return this.put('/users', payload);
  }

  getAvatarUploadUrl(userId?: string) {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    if (userId) {
      return `${baseApiEndpoint}/users/${userId}/avatar/upload`;
    }
    return `${baseApiEndpoint}/users/avatar/upload`;
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/users/search', query));
  }

  findById(id: string) {
    return this.get(`/users/view/${encodeURIComponent(id)}`);
  }
}

export const userService = new UserService();
