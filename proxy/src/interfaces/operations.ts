import { Operation } from "./cash-in-out";

export interface CreateOperationBody {
  token: string;
  amount: string;
  type: Operation;
  name: {
    title: 'Dr.';
    firstName: "Ruizao";
    middleName: 'P.';
    lastName: "Escobar";
    fullName: "Rui";
  };
  lei: 'AAAA0012345678901299'
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