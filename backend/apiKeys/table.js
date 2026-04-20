import executeTableQuery from "../utils/executeTableQuery.js";

export default function createProjectApiKeysTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS project_api_keys (
    id INT NOT NULL AUTO_INCREMENT,
    project_id VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    key_suffix VARCHAR(10) NOT NULL,
    rate_limit_per_minute INT NOT NULL DEFAULT 60,
    is_active TINYINT NOT NULL DEFAULT 1,
    requests_in_window INT NOT NULL DEFAULT 0,
    window_started_at DATETIME NULL DEFAULT NULL,
    last_used_at DATETIME NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_api_key_hash (api_key_hash)
  )`;

  executeTableQuery(createTableQuery, "project_api_keys");
}