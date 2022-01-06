import { db } from '../classes/server';

class QueriesService {
  findByToken(token: string) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM registry WHERE token = ? AND active = ?',
        [token, true],
        (err, rows) => {
          if (err) {
            return reject('Error getting data');
          }
          return resolve(rows[0]);
        }
      );
    });
  }

  findByPhoneNumber(phoneNumber: string) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM registry WHERE phoneNumber = ? AND active = ?`,
        [phoneNumber, true],
        (err, rows) => {
          if (err) {
            return reject('Error getting data');
          }
          return resolve(rows[0] ? { token: rows[0].token } : undefined);
        }
      );
    });
  }

  createToken(token: string, phoneNumber: string, indicative: string) {
    const insertQuery = `
      INSERT INTO registry (phoneNumber, indicative, token)
      VALUES (?, ? ,?);
    `;
    return new Promise((resolve, reject) => {
      db.query(insertQuery, [phoneNumber, indicative, token],(err, rows) => {
        if (err) {
          return reject('Error creating registry');
        }
        return resolve({ token });
      });
    });
  }

  invalidateToken(phoneNumber: string) {
    const insertQuery = `
      UPDATE registry
      SET active = false
      WHERE phoneNumber = ?;
    `;
    return new Promise((resolve, reject) => {
      db.query(insertQuery, [phoneNumber] ,(err, rows) => {
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
