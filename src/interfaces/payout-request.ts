export interface IPayoutRequest {
  _id: string;
  source: string;
  sourceId: string;
  sourceInfo?: any;
  paymentAccountType: string;
  fromDate: Date;
  toDate: Date;
  requestNote: string;
  adminNote: string
  status: string;
  tokenMustPay: number;
  previousPaidOut: number;
  pendingToken: number;
  createdAt: Date;
  updatedAt:Date;
}
/* eslint-disable no-shadow */
export type PaymentAccounnt = 'banking' | 'paypal'
export enum PAYMENT_ACCOUNT {
  BANKING = 'banking',
  PAYPAL = 'paypal',
}
export type PayoutStatus = 'pending' | 'rejected' | 'done';

export interface PayoutRequestInterface {
  _id: string;
  sourceId: string;
  source: string;
  paymentAccountType: PaymentAccounnt;
  paymentAccountInfo: any;
  requestNote: string;
  adminNote: string;
  status: PayoutStatus;
  requestedPrice: number;
  fromDate: Date;
  toDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
