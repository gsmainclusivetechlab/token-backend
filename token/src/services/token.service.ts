import { UserFacingError } from '../classes/errors';
import { Token } from '../utils/token';
import { phone as phoneLib, PhoneResult } from 'phone';
import { queriesService } from './queries.service';
class TokenService {
  async getToken(phone: string) {
    var phoneNumber,
      countryCode = null;
    if (phone.startsWith('+44123456')) {
      phoneNumber = phone;
      countryCode = '+44';
    } else {
      const phoneResult: PhoneResult = this.validatePhone(phone);
      phoneNumber = phoneResult.phoneNumber;
      countryCode = phoneResult.countryCode;
    }

    try {
      const tokenData = await queriesService.findByPhoneNumber(phoneNumber);
      if (tokenData) {
        return tokenData;
      }
    } catch (err: any) {
      throw new UserFacingError(err.message);
    }
    return this.handleTokenGeneration(phoneNumber, countryCode);
  }

  async decode(token: string) {
    try {
      const tokenData = await queriesService.findByToken(token);
      if (tokenData) {
        if (!Token.verifyControlDigit(token, (tokenData as any).indicative)) {
          throw new UserFacingError('Invalid token.');
        }
        return tokenData;
      } else {
        throw new UserFacingError('Invalid token.');
      }
    } catch (err: any) {
      throw new UserFacingError(err.message);
    }
  }

  async invalidate(phone: string) {
    var phoneNumber = null;
    if (phone.startsWith('+44123456')) {
      phoneNumber = phone;
    } else {
      const phoneResult: PhoneResult = this.validatePhone(phone);
      phoneNumber = phoneResult.phoneNumber;
    }

    try {
      const tokenData = await queriesService.findByPhoneNumber(phoneNumber);
      if (!tokenData) {
        throw new UserFacingError(`Phone number doesn't exist`);
      }

      return queriesService.invalidateToken(phoneNumber);
    } catch (err: any) {
      throw new UserFacingError(err.message);
    }
  }

  async renew(phone: string) {
    var phoneNumber,
      countryCode = null;
    if (phone.startsWith('+44123456')) {
      phoneNumber = phone;
      countryCode = '+44';
    } else {
      const phoneResult: PhoneResult = this.validatePhone(phone);
      phoneNumber = phoneResult.phoneNumber;
      countryCode = phoneResult.countryCode;
    }

    try {
      const tokenData = await queriesService.findByPhoneNumber(phoneNumber);
      if (tokenData) {
        await queriesService.invalidateToken(phoneNumber);
      }
      return this.handleTokenGeneration(phoneNumber, countryCode);
    } catch (err: any) {
      throw new UserFacingError(err.message);
    }
  }

  private validatePhone(phone: string) {
    const parsedPhone = phoneLib(phone);
    if (!parsedPhone.isValid) {
      throw new UserFacingError('Invalid phone number.');
    }
    return parsedPhone;
  }

  private async calculateToken(phoneNumber: string, indicative: string) {
    const token = Token.generate(phoneNumber, indicative);
    const isPhoneValid = phoneLib(`+${token}`);
    if (isPhoneValid.isValid) {
      this.calculateToken(phoneNumber, indicative);
    }
    try {
      const tokenData = await queriesService.findByToken(token);
      if (tokenData) {
        await this.calculateToken(phoneNumber, indicative);
      }
      return token;
    } catch (error) {
      throw new UserFacingError(error as string);
    }
  }

  private async handleTokenGeneration(phoneNumber: string, countryCode: string) {
    const noIndicativePhone = phoneNumber.split(countryCode)[1];
    const onlyIndicative = countryCode.split('+')[1];
    const phoneNumberWithoutLastDigit = noIndicativePhone.substring(0, noIndicativePhone.length - 1);
    const token = await this.calculateToken(phoneNumberWithoutLastDigit, onlyIndicative);
    return queriesService.createToken(token, phoneNumber);
  }
}
const tokenService = new TokenService();
export { tokenService };
