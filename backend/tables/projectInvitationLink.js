import executeTableQuery from "../utils/executeTableQuery.js";

export default function createProjectInvitationLinkTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS project_invitation_links (
   id INT NOT NULL AUTO_INCREMENT,
   project_id VARCHAR(10) NOT NULL,
   email VARCHAR(255) NOT NULL,
   invited_by INT(10) NULL DEFAULT NULL,
   token VARCHAR(255) NOT NULL,
   expires_at DATETIME NOT NULL,
   is_used INT(3) NOT NULL DEFAULT '0',
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (id),
   UNIQUE KEY unique_invitation_token (token)
  )`;

  executeTableQuery(createTableQuery, "project_invitation_links");
}
