export enum SMSOperations {
  GetToken = "GET_TOKEN",
  DeleteToken = "DELETE_TOKEN",
  CashIn = "CASH_IN",
  CashOut = "CASH_OUT",
  Pin = "PIN",
  Payment = "PAYMENT",
}

export function findKeyByValueSMSOperations(value: string) {
  return Object.entries(SMSOperations).find(([key, val]) => val === value)?.[0];
}
