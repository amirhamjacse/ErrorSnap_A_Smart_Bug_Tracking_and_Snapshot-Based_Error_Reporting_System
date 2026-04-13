import executeTableQuery from "../utils/executeTableQuery.js";

export default function createProjectTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS project (
   id VARCHAR(50) NOT NULL ,
   user_id INT(11) NOT NULL ,
   name VARCHAR(50) NOT NULL ,
   description TEXT NOT NULL ,
   last_error_at TIMESTAMP NULL DEFAULT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (id)
   )`;

  executeTableQuery(createTableQuery, "project");
}
