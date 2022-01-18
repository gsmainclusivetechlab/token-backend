import { AccountNameReturn } from "./mmo";

export type OperationType = "cash-in" | "cash-out" | "merchant-payment";

export type Action = "accept" | "reject";

export type MmoOperation = "deposit" | "withdraw" | "merchantpay";

export type SystemType = "mock" | "live";

export type IdentifierType = "phoneNumber" | "token";

export interface Operation {
  type: OperationType;
  amount: number;
  system: SystemType;
  merchantCode?: string;
  identifier: string;
  identifierType?: IdentifierType;
  customerInfo: AccountNameReturn;
}
