export enum USSDOperations {
  GetToken = "1",
  DeleteToken = "2",
  RenewToken = "3",
  CashIn = "4",
  CashOut = "5",
}

export function findKeyByValueUSSDOperations(value: string) {
  return Object.entries(USSDOperations).find(
    ([key, val]) => val === value
  )?.[0];
}
