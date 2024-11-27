export interface INotification {
  _id: string,
  userId: string;
  title: string;
  type: string;
  action: string,
  message: string;
  refId: string;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  read?: boolean;
}
