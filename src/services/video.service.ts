import { APIRequest } from './api-request';

export class VideoService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/performer/performer-assets/videos/search', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/user/performer-assets/videos/search', query)
    );
  }

  delete(id: string) {
    return this.del(`/performer/performer-assets/videos/${encodeURIComponent(id)}`);
  }

  findById(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performer/performer-assets/videos/${encodeURIComponent(id)}/view`, headers);
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/user/performer-assets/videos/${encodeURIComponent(id)}`, headers);
  }

  increaseView(id: string) {
    return this.post(`/user/performer-assets/videos/${encodeURIComponent(id)}/view`);
  }

  update(
    id: string,
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload(`/performer/performer-assets/videos/edit/${encodeURIComponent(id)}`, files, {
      method: 'PUT',
      onProgress,
      customData: payload
    });
  }

  uploadVideo(
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload('/performer/performer-assets/videos/upload', files, {
      onProgress,
      customData: payload
    });
  }

  getFavouriteVideos(payload) {
    return this.get(this.buildUrl('/reactions/videos/favourites', payload));
  }

  getWatchLateVideos(payload) {
    return this.get(this.buildUrl('/reactions/videos/watch-later', payload));
  }

  getPurchasedVideos(payload) {
    return this.get(this.buildUrl('/user/performer-assets/videos/purchased'), payload);
  }
}

export const videoService = new VideoService();
