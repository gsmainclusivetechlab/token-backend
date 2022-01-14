export interface AccountNameReturn {
  fullName: string;
  phoneNumber: string;
  indicative: string;
}

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