import { Operation } from "../../interfaces/cash-in-out";

enum OperationMap {
  'cash-in' = 'deposit',
  'cash-out' = 'deposit',
}

export default function GetTypeFromOperation(operation: Operation) {
  return OperationMap[operation]
}