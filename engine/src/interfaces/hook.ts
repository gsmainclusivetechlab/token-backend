import { CreatedByOptions, CreatedUsingOptions, IdentifierType, MmoOperation, SystemType } from './operation';

export interface SMSWebhookBody {
  phoneNumber: string;
  text: string;
  system: SystemType;
}

export interface USSDWebhookBody {
  phoneNumber: string;
  text: string;
  system: SystemType;
}

export interface MMOWebhookBody {
  type: MmoOperation;
  system: SystemType;
  phoneNumber: string;
  amount: number;
  identifierType: IdentifierType;
  otp: number;
  createdBy: CreatedByOptions;
  createdUsing: CreatedUsingOptions;
  merchantCode: string;
}
