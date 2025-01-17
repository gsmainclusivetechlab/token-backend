export interface AccountNameQueryParams {
  identifierType: string;
  identifier: string;
  'X-Date'?: string;
  'X-API-Key'?: string;
  'X-User-Bearer'?: string;
  'X-Client-Id'?: string;
  'X-Content-Hash'?: string;
  'X-User-Credential-1'?: string;
  'X-User-Credential-2'?: string;
  'X-Channel'?: string;
  'X-Account-Holding-Institution-Identifier-Type'?: string;
  'X-Account-Holding-Institution-Identifier'?: string;
}

export interface CreateAccountReturn {
  nickName: string;
  phoneNumber: string;
  indicative: string;
  otp: number;
}

export interface AccountNameReturn {
  nickName: string;
  phoneNumber: string;
  indicative: string;
  active?: boolean;
  otp: number;
}

export interface AccountNameError {
  errorCategory: string;
  errorCode: string;
  errorDescription: string;
  errorDateTime: string;
  errorParameters: [
    {
      key: string;
      value: string;
    }
  ];
}
