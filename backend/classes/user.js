import { con } from "../database/connection.js";
import bcrypt from "bcrypt";
import Token from "./Token.js";

class User {
  static table = "users";
  static currentUser = {};

  static setCurrentUser(user) {
    this.currentUser = user;
  }

  static getUserWithEmail(email) {
    const query = `SELECT * FROM ${User.table} WHERE email='${email}'`;
    return new Promise((resolve, reject) => {
      con.query(query, function (error, results) {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }

  static register(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");

    return new Promise((resolve, reject) => {
      //hash password
      bcrypt
        .hash(values?.password, 5)
        .then(function (hash) {
          const query = `INSERT INTO ${User.table} (${columns}) VALUES (${placeholders})`;
          const formattedValues = {
            ...values,
            password: hash,
          };
          const params = Object.values(formattedValues);

          con.query(query, params, function (error, results) {
            // create token
            const token = Token.create({ email: values?.email });
            if (error) return reject(error);

            resolve({
              id: results.insertId,
              email: values?.email,
              username: values?.username,
              token,
            });
          });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
}

export default User;
