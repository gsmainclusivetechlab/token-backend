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
    const selectQuery = `SELECT U.*, 
                               (CASE WHEN (SELECT COUNT(T1.active) 
                                           FROM tokens T1 
                                           WHERE T1.active = true 
                                           AND T.user_id = T1.user_id ) > 0 
                                     THEN true 
                                     ELSE false 
                                END) AS active  
                         FROM tokens T, 
                              users U 
                         WHERE T.user_id=U.id 
                         AND (U.phoneNumber = ? OR T.token = ?)`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(selectQuery, [identifier, identifier], (err, rows) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(
          rows[0]
            ? {
                nickName: rows[0].nickName,
                phoneNumber: rows[0].phoneNumber,
                indicative: rows[0].indicative,
                active: rows[0].active === 1 ? true : false
              }
            : undefined
        );
      });
    });
  }
}

const queriesService = new QueriesService();
export { queriesService as QueriesService };
