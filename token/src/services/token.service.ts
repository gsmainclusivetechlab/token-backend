import { UserFacingError } from '../classes/errors';
import { db } from '../classes/server';
import { Token } from '../utils/token';
import {phone as phoneLib} from 'phone'
class TokenService {
  async encode(phone: string) {
    const parsedPhone = phoneLib(phone);
    if(!parsedPhone.isValid) {
      throw new UserFacingError('Invalid phone number.');
    }
    const {phoneNumber, countryCode} = parsedPhone
    try {
      const tokenData = await this.findByPhoneNumber(phoneNumber);
      if (tokenData) {
        return tokenData;
      }
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    const noIndicativePhone = phoneNumber.split(countryCode)[1];
    const onlyIndicative = countryCode.split('+')[1];
    const phoneNumberWithoutLastDigit = noIndicativePhone.substring(
      0,
      noIndicativePhone.length - 1
    );
    const token = await this.generateToken(
      phoneNumberWithoutLastDigit,
      onlyIndicative
    );
    return this.createToken(token, phoneNumber, countryCode)
  }

  async decode(token: string) {
    try {
      const tokenData = await this.findByToken(token);
      if (tokenData) {
        if(!Token.verifyControlDigit(token, (tokenData as any).indicative)) {
          throw new UserFacingError('Invalid token.');
        }
        return tokenData;
      } else {
        throw new UserFacingError('Invalid token.');
      }
    } catch (error) {
      throw new UserFacingError(error as string);
    }
  }


  private async generateToken(phoneNumber: string, indicative: string) {
    const token = Token.generate(phoneNumber, indicative)
    const isPhoneValid = phoneLib(`+${token}`)
    if (isPhoneValid.isValid) {
      this.generateToken(phoneNumber, indicative);
    }
    try {
      const tokenData = await this.findByToken(token);
      if (tokenData) {
        await this.generateToken(phoneNumber, indicative);
      }
      return token;
    } catch (error) {
      throw new UserFacingError(error as string);
    }
  }

  private findByToken(token: string) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM registry WHERE token='${token}'`, (err, rows) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(rows[0]);
      });
    });
  }

  private findByPhoneNumber(phoneNumber: string) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM registry WHERE phoneNumber='${phoneNumber}'`,
        (err, rows) => {
          if (err) {
            return reject('Error getting data');
          }
          return resolve(rows[0] ? { token: rows[0].token } : undefined);
        }
      );
    });
  }

  private createToken(token: string, phoneNumber: string, indicative: string) {
    const insertQuery = `
      INSERT INTO registry (phoneNumber, indicative, token)
      VALUES ('${phoneNumber}', '${indicative}', '${token}');
    `;
    return new Promise((resolve, reject) => {
      db.query(insertQuery, (err, rows) => {
        if (err) {
          return reject('Error creating registry');
        }
        return resolve({ token });
      });
    });
  }
}
const tokenService = new TokenService();
export { tokenService };
