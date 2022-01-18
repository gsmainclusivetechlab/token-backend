import { MmoOperation, OperationType } from "../interfaces/operation";


enum OperationMap {
  'cash-in' = 'deposit',
  'cash-out' = 'withdrawal',
  'merchant-payment' = 'merchantpay'
}

export function GetTypeFromOperation(operation: OperationType) {
  return OperationMap[operation]
}

export function GetOperationFromType(type: MmoOperation): OperationType {
  return Object.entries(OperationMap).find(([key, val]) => val === type)?.[0] as OperationType;
}
