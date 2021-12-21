import { phone, PhoneValidResult } from 'phone';
import { UserFacingError } from '../classes/errors';
import { v4 } from 'uuid';
import { db } from '../classes/server';
class TokenService {
  async encode(phoneNumber: string) {
    const parsedPhone = this.validatePhoneNumber(phoneNumber);
    try {
      const tokenData = await this.findByPhoneNumber(phoneNumber)
      if(tokenData) {
        return tokenData
      }
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    const token = this.generateToken(parsedPhone);
    try {
      const tokenData = await this.findByToken(token);
      if (tokenData) {
        await this.encode(phoneNumber);
      }
      try {
        return await this.createToken(phoneNumber, token)
      } catch (error) {
        throw new UserFacingError(error as string);
      }
    } catch (error) {
      throw new UserFacingError(error as string);
    }
  }

  async decode() {
    return { decode: true };
  }

  private validatePhoneNumber(phoneNumber: string) {
    const parsedPhone = phone(phoneNumber);
    if (!parsedPhone.isValid) {
      throw new UserFacingError('Invalid phone number');
    }
    return parsedPhone;
  }

  private generateToken(parsedPhone: PhoneValidResult) {
    const uuid = v4();
    const parsedUuid = uuid.split('-').join('');
    return parsedUuid.slice(parsedUuid.length - parsedPhone.phoneNumber.length);
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
      db.query(`SELECT * FROM registry WHERE phoneNumber='${phoneNumber}'`, (err, rows) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(rows[0]);
      });
    });
  }

  private createToken(token: string, phoneNumber: string) {
    const insertQuery = `
      INSERT INTO registry (phoneNumber, token)
      VALUES ('${token}', '${phoneNumber}');
    `;
    return new Promise((resolve, reject) => {
      db.query(insertQuery,
        (err, rows) => {
          if (err) {
            return reject('Error creating registry');
          }
          return resolve(rows[0]);
        }
      );
    });
  }
}
const tokenService = new TokenService();
export { tokenService };
