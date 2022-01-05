import { Operation } from "./cash-in-out";

export interface CreateOperationBody {
  token: string;
  amount: string;
  type: Operation;
  name: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
  };
  lei: string;
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