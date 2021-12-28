import { db } from '../classes/server';

class QueriesService {
  findByToken(token: string) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM registry WHERE token='${token}' AND active=true`, (err, rows) => {
        if (err) {
          return reject('Error getting data');
        }
        return resolve(rows[0]);
      });
    });
  }

  findByPhoneNumber(phoneNumber: string) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM registry WHERE phoneNumber='${phoneNumber}' AND active=true`,
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

  invalidateToken(phoneNumber: string) {
    const insertQuery = `
      UPDATE registry
      SET active = false
      WHERE phoneNumber = "${phoneNumber}";
    `;
    return new Promise((resolve, reject) => {
      db.query(insertQuery, (err, rows) => {
        if (err) {
          return reject('Error invalidating token');
        }
        return resolve('Token invalidated');
      });
    });
  }
}

const queriesService = new QueriesService();
export { queriesService };
