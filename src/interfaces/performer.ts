export interface IBanking {
  firstName: string;
  lastName: string;
  SSN: string;
  bankName: string;
  bankAccount: string;
  bankRouting: string;
  bankSwiftCode: string;
  address: string;
  city: string;
  state: string;
  country: string;
  performerId: string;
}

export interface IPerformerStats {
  totalGrossPrice: number;
  totalCommission: number;
  totalNetPrice: number;
  paidPrice: number;
}

export interface IPerformerCommissions {
  monthlySubscriptionCommission: number;
  productSaleCommission: number;
  feedSaleCommission: number;
  videoSaleCommission: number;
  yearlySubscriptionCommission: number;
  tokenTipCommission: number;
  privateChatCommission: number;
}

export interface IPerformer {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  phoneCode: string;
  avatarPath: string;
  avatar: any;
  coverPath: string;
  cover: any;
  gender: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
  languages: string[];
  categoryIds: string[];
  categories: any;
  dateOfBirth: Date;
  butt: string;
  hair: string;
  pubicHair: string;
  bodyType: string;
  ethnicity: string;
  height: string;
  weight: string;
  bio: string;
  eyes: string;
  sexualPreference: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stats: {
    likes: number;
    subscribers: number;
    views: number;
    totalVideos: number;
    totalPhotos: number;
    totalGalleries: number;
    totalProducts: number;
    totalFeeds?: number;
  };
  score?: number;
  isPerformer?: boolean;
  bankingInformation?: IBanking;
  paypalSetting?: any;
  blockCountries?: any;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isOnline?: boolean;
  welcomeVideoId?: string;
  welcomeVideoPath?: string;
  live?: boolean;
  streamingStatus?: string;
  activateWelcomeVideo?: boolean;
  isSubscribed?: boolean;
  verifiedAccount?: boolean;
  verifiedDocument?: boolean;
  privateChatPrice?: number;
  groupChatPrice?: number;
  documentVerification: any;
  idVerification: any;
  status: string;
}

export interface IUpdatePerformer {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  phoneCode: string;
  gender: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
  languages: string[];
  studioId: string;
  categoryIds: string[];
  timezone: string;
  noteForUser: string;
  height: string;
  weight: string;
  bio: string;
  eyes: string;
  sexualPreference: string;
  monthlyPrice: number;
  yearlyPrice: number;
  bankingInformation: IBanking;
  welcomeVideoId: string;
  welcomeVideoPath: string;
  activateWelcomeVideo: boolean
  idVerification?: any;
  documentVerification?: any;
}

export interface IBody {
  heights: { value: string; text: string }[];
  weights: { value: string; text: string }[];
  genders: { value: string; text: string }[];
  sexualOrientations: { value: string; text: string }[];
  ages: { value: string; text: string }[];
  eyes: { value: string; text: string }[];
  butts: { value: string; text: string }[];
  pubicHairs: { value: string; text: string }[];
  hairs: { value: string; text: string }[];
  ethnicities: { value: string; text: string }[];
  bodyTypes: { value: string; text: string }[];
}
