import { IPostSearch } from 'src/interfaces';

import { APIRequest } from './api-request';

export class PostService extends APIRequest {
  search(query: IPostSearch) {
    return this.get(this.buildUrl('/posts/search', query as any));
  }

  findById(id: string) {
    return this.get(`/posts/${encodeURIComponent(id)}`);
  }
}

export const postService = new PostService();
