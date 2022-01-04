export enum USSDOperations {
  GetToken = "1",
  DeleteToken = "2",
  CashIn = "3",
  CashOut = "4",
}

export function findKeyByValueUSSDOperations(value: string) {
  return Object.entries(USSDOperations).find(
    ([key, val]) => val === value
  )?.[0];
}
