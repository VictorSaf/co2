import type { KYCStatus, RiskLevel } from './kyc';

export type User = {
  id: string;
  username: string;
  balance: number; // in EUR
  kycStatus?: KYCStatus;
  riskLevel?: RiskLevel;
};

export type CertificateType = 'CEA' | 'EUA';

export type CertificateStatus = 'Available' | 'Converting' | 'Verified';

export type Certificate = {
  id: string;
  type: CertificateType;
  amount: number; // in tons of CO2
  price: number; // in EUR per ton
  status: CertificateStatus;
  seller?: string;
  purchasedAt?: Date;
  conversionStartedAt?: Date;
  conversionCompletedAt?: Date;
  verifiedAt?: Date;
};

export type Portfolio = {
  certificates: Certificate[];
  totalCEA: number;
  totalEUA: number;
  convertingCEA: number;
};

export type MarketOffer = {
  id: string;
  sellerId: string;
  sellerName: string;
  type: CertificateType;
  amount: number;
  price: number;
  timestamp: Date;
};

export type Transaction = {
  id: string;
  buyerId: string;
  sellerId: string;
  certificateType: CertificateType;
  amount: number;
  price: number;
  totalValue: number;
  timestamp: Date;
};

export type MarketStatistics = {
  averagePriceCEA: number;
  averagePriceEUA: number;
  volumeCEA: number;
  volumeEUA: number;
  priceHistory: {
    date: Date;
    priceCEA: number;
    priceEUA: number;
  }[];
};

export type CO2Emissions = {
  total: number;
  remaining: number;
  surrendered: number;
};