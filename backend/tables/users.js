import executeTableQuery from "../utils/executeTableQuery.js";

export default function createUserTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.users (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(200) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`;

  executeTableQuery(createTableQuery, "users");
}
