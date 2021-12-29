import { UserFacingError } from '../classes/errors';
import { AccountNameError } from '../interfaces/account-name';
class MmoService {
  async getAccountName(phoneNumber: string): Promise<{} | AccountNameError> {
    if (phoneNumber === '+233207212676') {
      return {};
    } else {
      return {
        errorCategory: 'identification',
        errorCode: 'identifierError',
        errorDescription: 'Account does not exist',
        errorDateTime: new Date().toISOString(),
        errorParameters: [
          {
            key: 'providedValue',
            value: phoneNumber,
          },
        ],
      };
    }
  }
}
const mmoService = new MmoService();
export { mmoService };
