export enum SMSOperations {
  GetToken = "GET TOKEN",
  DeleteToken = "DELETE TOKEN",
  CashIn = "CASH IN",
  CashOut = "CASH OUT",
  Pin = "PIN",
  Payment = "PAYMENT"
}

export function findKeyByValueSMSOperations(value: string) {
  return Object.entries(SMSOperations).find(([key, val]) => val === value)?.[0];
}
