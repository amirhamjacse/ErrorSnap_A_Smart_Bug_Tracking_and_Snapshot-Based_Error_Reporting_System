import executeTableQuery from "../utils/executeTableQuery.js";

export default function createDiscordIntegrationTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS discord_integration (
    id INT NOT NULL AUTO_INCREMENT,
    project_id VARCHAR(50) NOT NULL,
    webhook_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_project_id (project_id)
)`;

  executeTableQuery(createTableQuery, "discord_integration");
}
