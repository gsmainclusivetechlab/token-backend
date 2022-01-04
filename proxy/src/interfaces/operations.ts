import { Operation } from "./cash-in-out";

export interface CreateOperationBody {
  token: string;
  amount: string;
  type: Operation;
}

interface CreateOperation extends CreateOperationBody{
  id: string;
}

interface Notification {
  id: string;
  message: string;
}

export interface SendOperation {
  operations: CreateOperation[];
  notifications: Notification[];
}