import { App } from '../app';
import { AccountNameReturn } from '../interfaces/account-name';

class QueriesService {
  createUserAccount(nickName: string, phoneNumber: string, indicative: string) {
    const insertQuery = `
    INSERT INTO users (nickName, phoneNumber, indicative) 
    VALUES (?,?,?);`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(insertQuery, [nickName, phoneNumber, indicative], (err, rows) => {
        if (err) {
          return reject('Error creating user');
        }
        return resolve({ message: 'User created' });
      });
    });
  }

  deleteUserAccount(phoneNumber: string) {
    const deleteQuery = `DELETE FROM users WHERE phoneNumber = ?`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(deleteQuery, [phoneNumber], (err, rows) => {
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
              }
            : undefined
        );
      });
    });
  }
}

const queriesService = new QueriesService();
export { queriesService as QueriesService };
