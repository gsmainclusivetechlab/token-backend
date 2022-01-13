import { App } from '../app';

class QueriesService {
  createUserAccount(fullName: string, phoneNumber: string, indicative: string) {
    const insertQuery = `
    INSERT INTO users (fullName, phoneNumber, indicative) 
    VALUES (?,?,?);`;
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(insertQuery, [fullName, phoneNumber, indicative], (err, rows) => {
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
      App.getDBInstance().query(deleteQuery, [phoneNumber],(err, rows) => {
        if (err) {
          return reject('Error deleting user');
        }
        return resolve({ message: 'User deleted' });
      });
    });
  }

  findAccountByPhoneNumberOrToken(identifier: string) {
    const selectQuery = 'SELECT U.* FROM tokens T, users U WHERE T.user_id=U.id AND T.active=true AND (U.phoneNumber = ? OR T.token = ?)';
    return new Promise((resolve, reject) => {
      App.getDBInstance().query(
        selectQuery,
        [identifier, identifier],
        (err, rows) => {
          if (err) {
            return reject('Error getting data');
          }
          return resolve(
            rows[0]
              ? {
                  fullName: rows[0].fullName,
                  phoneNumber: rows[0].phoneNumber,
                  indicative: rows[0].indicative,
                }
              : undefined
          );
        }
      );
    });
  }
}

const queriesService = new QueriesService();
export { queriesService as QueriesService };
