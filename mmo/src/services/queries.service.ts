import { App } from '../app';
import { AccountNameReturn } from '../interfaces/account-name';

class QueriesService {
  createUserAccount(nickName: string, phoneNumber: string, indicative: string, otp: number) {
    const insertQuery = `
    INSERT INTO users (nickName, phoneNumber, indicative, otp) 
    VALUES (?,?,?,?);`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(insertQuery, [nickName, phoneNumber, indicative, otp], (err, rows) => {
        if (err) {
          return reject('Error creating user');
        }
        return resolve({ message: 'User created' });
      });
    });
  }
  
  deleteUserAccountByOTP(opt: number) {
    const deleteQuery = `DELETE FROM users WHERE otp = ?`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(deleteQuery, [opt], (err, rows) => {
        if (err) {
          return reject('Error deleting user');
        }
        return resolve({ message: 'User deleted' });
      });
    });
  }

  findAccountByPhoneNumberOrToken(identifier: string): Promise<AccountNameReturn | undefined> {
    const storeProcedure = `CALL GetAccount(?)`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(storeProcedure, [identifier], (err, results, fields) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(
          results[0] && results[0][0]
            ? {
                nickName: results[0][0].nickName,
                phoneNumber: results[0][0].phoneNumber,
                indicative: results[0][0].indicative,
                active: results[0][0].active === 1 ? true : false,
                otp: results[0][0].otp,
              }
            : undefined
        );
      });
    });
  }

  findAccountByOTP(otp: number): Promise<AccountNameReturn | undefined> {
    const selectQuery = 'SELECT U.* FROM users U WHERE U.otp=?';
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(selectQuery, [otp], (err, results) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(
          results[0]
            ? {
                nickName: results[0].nickName,
                phoneNumber: results[0].phoneNumber,
                indicative: results[0].indicative,
                otp: results[0].otp,
              }
            : undefined
        );
      });
    });
  }

  deleteAllUsers() {
    const deleteQuery = `DELETE FROM users`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(deleteQuery, (err, rows) => {
        if (err) {
          return reject('Error deleting user');
        }
        return resolve({ message: 'All users deleted' });
      });
    });
  }
}

const queriesService = new QueriesService();
export { queriesService as QueriesService };
