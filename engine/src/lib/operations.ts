import { MmoOperation, Operation } from "../interfaces/cash-in-out";

enum OperationMap {
  'cash-in' = 'deposit',
  'cash-out' = 'withdrawal',
}

export function GetTypeFromOperation(operation: Operation) {
  return OperationMap[operation]
}

export function GetOperationFromType(type: MmoOperation): Operation {
  return Object.entries(OperationMap).find(([key, val]) => val === type)?.[0] as Operation;
}
