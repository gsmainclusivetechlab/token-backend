export type OperationType = "cash-in" | "cash-out" | "merchant-payment";

export type Action = "accept" | "reject";

export type MmoOperation = "deposit" | "withdraw";

export type SystemType = "mock" | "live";

export type IndentifierType = "phoneNumber" | "token";

export interface Operation {
  type: OperationType;
  amount: string;
  //phoneNumber?: string;
  system: SystemType;
  merchantCode?: string;
  //token?: string;
  identifier: string;
  identifierType?: IndentifierType;
}
