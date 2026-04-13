import executeTableQuery from "../utils/executeTableQuery.js";

export default function createProjectTeamTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS project_team (
   id INT NOT NULL AUTO_INCREMENT , 
   project_id VARCHAR(10) NOT NULL,
   user_id INT(11) NOT NULL ,
   invited_by INT(10) NULL DEFAULT NULL,
   is_approved INT(3) NOT NULL DEFAULT '1',
   PRIMARY KEY (id)
   )`;

  executeTableQuery(createTableQuery, "project_team");
}
