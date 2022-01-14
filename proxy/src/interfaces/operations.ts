import { AccountNameReturn } from "./mmo";

export type OperationType = "cash-in" | "cash-out" | "merchant-payment";

export type Action = "accept" | "reject";

export type System = "mock" | "live";

export type IndentifierType = "phoneNumber" | "token";


export interface CreateOperationBody {
  //token: string;
  identifier: string;
  identifierType: IndentifierType;
  amount: string;
  type: OperationType;
  customerInfo: AccountNameReturn;
  system: string;
  merchantCode: string;
}

export interface CreateOperation extends CreateOperationBody{
  id: string;
}

export interface OperationNotification  {
  id: string;
  operationType: OperationType;
  message: string;
}
