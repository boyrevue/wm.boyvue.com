export interface IPaymentWalletTransaction {
  _id: string;
  originalPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  products: any;
  sourceId: string;
  targetId: string;
  type: string;
  status: string;
}
