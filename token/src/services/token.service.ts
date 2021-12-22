import { phone, PhoneValidResult } from 'phone';
import { UserFacingError } from '../classes/errors';
import { v4 } from 'uuid';
import { db } from '../classes/server';
class TokenService {
  async encode(phoneNumber: string) {
    const parsedPhone = this.validatePhoneNumber(phoneNumber);
    try {
      const tokenData = await this.findByPhoneNumber(phoneNumber);
      if (tokenData) {
        return tokenData;
      }
    } catch (error) {
      throw new UserFacingError(error as string);
    }
    const token = await this.generateToken(phoneNumber);
    try {
      return await this.createToken(token, phoneNumber);
    } catch (error) {
      throw new UserFacingError(error as string);
    }
  }

  async decode(token: string) {
    try {
      const tokenData = await this.findByToken(token);
      if (tokenData) {
        return tokenData;
      } else {
        throw new UserFacingError('Invalid token.');
      }
    } catch (error) {
      throw new UserFacingError(error as string);
    }
  }

  private validatePhoneNumber(phoneNumber: string) {
    const parsedPhone = phone(phoneNumber);
    if (!parsedPhone.isValid) {
      throw new UserFacingError('Invalid phone number.');
    }
    return parsedPhone;
  }

  private async generateToken(phoneNumber: string) {
    const uuid = v4();
    const parsedUuid = uuid.split('-').join('');
    const token = parsedUuid.slice(parsedUuid.length - phoneNumber.length);
    const tokenData = await this.findByToken(token);
    try {
      if (tokenData) {
        await this.generateToken(phoneNumber);
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

  private createToken(token: string, phoneNumber: string) {
    const insertQuery = `
      INSERT INTO registry (phoneNumber, token)
      VALUES ('${phoneNumber}', '${token}');
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
