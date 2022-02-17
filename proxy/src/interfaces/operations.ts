import { AccountNameReturn } from './mmo';

export type OperationType = 'cash-in' | 'cash-out' | 'merchant-payment';

export type Action = 'accept' | 'reject';

export type System = 'mock' | 'live';

export type IndentifierType = 'phoneNumber' | 'token';

export type CreatedByOptions = 'customer' | 'agent' | 'merchant';

export type CreatedUsingOptions = 'SMS' | 'USSD';

export interface CreateOperationBody {
  identifier: string;
  identifierType: IndentifierType;
  amount: number;
  type: OperationType;
  customerInfo: AccountNameReturn;
  system: string;
  merchantCode: string;
  createdBy: CreatedByOptions;
  createdUsing: CreatedUsingOptions;
}

export interface CreateOperation extends CreateOperationBody {
  id: string;
}

export interface OperationNotification {
  id: string;
  message: string;
  otp: number;
}
