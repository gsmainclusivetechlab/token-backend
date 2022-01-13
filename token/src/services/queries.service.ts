import { db } from '../classes/server';

class QueriesService {
  findByToken(token: string) {
    const selectQuery = 'SELECT * FROM tokens WHERE token = ? AND active = ?';
    return new Promise((resolve, reject) => {
      db.query(selectQuery, [token, true], (err, rows) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(rows[0]);
      });
    });
  }

  findByPhoneNumber(phoneNumber: string) {
    const selectQuery = 'SELECT T.token, U.phoneNumber FROM tokens T, users U WHERE T.user_id=U.id AND T.active=true AND U.phoneNumber= ?';
    return new Promise((resolve, reject) => {
      db.query(selectQuery, [phoneNumber], (err, rows) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(rows[0] ? { token: rows[0].token } : undefined);
      });
    });
  }

  createToken(token: string, phoneNumber: string) {
    const insertQuery = 'INSERT INTO tokens (token, user_id) VALUES (?, (SELECT id FROM users WHERE phoneNumber= ?))';
    return new Promise((resolve, reject) => {
      db.query(insertQuery, [token, phoneNumber], (err, rows) => {
        if (err) {
          return reject('Error creating token');
        }
        return resolve({ token });
      });
    });
  }

  invalidateToken(phoneNumber: string) {
    const updateQuery = 'UPDATE tokens T, users U SET T.active=false WHERE T.user_id=U.id AND U.phoneNumber = ?';
    return new Promise((resolve, reject) => {
      db.query(updateQuery, [phoneNumber], (err, rows) => {
        if (err) {
          return reject('Error invalidating token');
        }
        return resolve({ message: 'Token invalidated' });
      });
    });
  }
}

const queriesService = new QueriesService();
export { queriesService };
