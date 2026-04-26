import executeTableQuery from "../utils/executeTableQuery.js";

export default function createAuditLogsTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    actor_id INT(11) NULL DEFAULT NULL,
    actor_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NULL DEFAULT NULL,
    summary TEXT NOT NULL,
    metadata LONGTEXT NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )`;

  executeTableQuery(createTableQuery, "audit_logs");
}
