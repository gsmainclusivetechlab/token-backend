export type TransactionType =
  | 'billpay'
  | 'deposit'
  | 'disbursement'
  | 'transfer'
  | 'merchantpay'
  | 'inttransfer'
  | 'adjustment'
  | 'reversal'
  | 'withdrawal';

export type TransactionStatus = 'pending' | 'accepted';
export interface TransactionsHeaders {
  transactionType: TransactionType;
  'X-Callback-URL': string;
  'X-Date'?: string;
  'X-CorrelationID'?: string;
  'X-API-Key'?: string;
  'X-User-Bearer'?: string;
  'X-Client-Id'?: string;
  'X-Content-Hash'?: string;
  'X-User-Credential-1'?: string;
  'X-User-Credential-2'?: string;
  'X-Channel'?: string;
  'X-Account-Holding-Institution-Identifier-Type'?: string;
  'X-Account-Holding-Institution-Identifier'?: string;
}
export interface TransactionsBody {
  amount: number; // 200.00
  debitParty: [
    {
      key: string; // accountid
      value: string; // 2999
    }
  ];
  creditParty: [
    {
      key: string; // accountid
      value: string; // 2999
    }
  ];
  currency: string; // RWF
  system: 'mock' | 'live'; //mock or live
  merchantCode: string;
  identifierType: IdentifierType;
  otp: number;
  createdBy: CreatedByOptions;
  createdUsing: CreatedUsingOptions;
}

export interface TransactionsRes {
  serverCorrelationId: string;
  status: string;
  notificationMethod: string;
  objectReference: string;
  pollLimit: number;
}

export interface Transaction {
  id: string;
  phoneNumber: string;
  type: TransactionType;
  callbackUrl: string;
  status: TransactionStatus;
  system: 'mock' | 'live';
  amount: number;
  merchant?: Merchant;
  identifierType: IdentifierType;
  otp: number;
  createdBy: CreatedByOptions;
  createdUsing: CreatedUsingOptions;
}

export interface Merchant {
  code: string;
  name: string;
  available: boolean;
}

export type IdentifierType = 'phoneNumber' | 'token';

export type CreatedByOptions = 'customer' | 'agent' | 'merchant';

export type CreatedUsingOptions = 'SMS' | 'USSD';
