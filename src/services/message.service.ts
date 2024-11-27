import { APIRequest } from './api-request';

export class MessageService extends APIRequest {
  getConversations(query?: Record<string, any>) {
    return this.get(this.buildUrl('/conversations', query));
  }

  searchConversations(query?: Record<string, any>) {
    return this.get(this.buildUrl('/conversations/search', query));
  }

  createConversation(data: Record<string, string>) {
    return this.post('/conversations', data);
  }

  getConversationDetail(id: string) {
    return this.get(`/conversations/${encodeURIComponent(id)}`);
  }

  getMessages(conversationId: string, query?: Record<string, any>) {
    return this.get(this.buildUrl(`/messages/conversations/${conversationId}`, query));
  }

  sendMessage(conversationId: string, data: Record<string, any>) {
    return this.post(`/messages/conversations/${conversationId}`, data);
  }

  countTotalNotRead() {
    return this.get('/messages/counting-not-read-messages');
  }

  readAllInConversation(conversationId: string) {
    return this.post(`/messages/read-all/${conversationId}`);
  }

  getMessageUploadUrl() {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    return `${baseApiEndpoint}/messages/private/file`;
  }

  getConversationByStreamId(streamId: string) {
    return this.get(`/conversations/stream/${streamId}`);
  }

  getPublicMessages(conversationId: string, query?: Record<string, any>) {
    return this.get(this.buildUrl(`/messages/conversations/public/${conversationId}`, query));
  }

  sendStreamMessage(conversationId: string, data: Record<string, any>) {
    return this.post(`/messages/stream/conversations/${conversationId}`, data);
  }

  sendPublicStreamMessage(conversationId: string, data: Record<string, any>) {
    return this.post(`/messages/stream/public/conversations/${conversationId}`, data);
  }

  findPublicConversationPerformer(performerId: string) {
    return this.get(`/conversations/stream/public/${performerId}`);
  }

  deleteMessage(id) {
    return this.del(`/messages/${encodeURIComponent(id)}`);
  }

  deleteAllMessageInConversation(conversationId) {
    return this.del(`/messages/${conversationId}/remove-all-message`);
  }

  pinToTop(id: string) {
    return this.post(`/conversations/pin-to-top/${id}`);
  }

  unPinToTop(id: string) {
    return this.post(`/conversations/unpin-to-top/${id}`);
  }
}

export const messageService = new MessageService();
