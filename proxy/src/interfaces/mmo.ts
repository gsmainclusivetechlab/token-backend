//TODO Refactor
export interface AccountNameReturn {
  name: {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
  };
  lei: string;
}

export interface AccountInfo {
  fullName: string;
  phoneNumber: string;
  indicative: string;
}