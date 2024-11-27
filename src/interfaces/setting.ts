export interface ISettings {
  verotelEnabled: boolean;
  ccbillEnabled: boolean;
  emerchantEnabled: boolean;
  cookiePolicyEnabled: boolean;
  cookiePolicyContentId: string;
  maintenanceMode: boolean;
  popup18Enabled: boolean;
  popup18ContentId: string;
  contactContentId: string;
  metaDescription: string;
  metaKeywords: string;
  currency: string;
  symbol: string;
  rate: number;
  maxWalletTopupAmount: number;
}

export interface IContact {
  email: string;
  message: any;
  name: string;
}

export interface IError {
  statusCode: number;
  message: string;
}
