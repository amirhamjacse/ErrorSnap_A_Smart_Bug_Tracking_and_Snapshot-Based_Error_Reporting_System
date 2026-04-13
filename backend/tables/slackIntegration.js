import executeTableQuery from "../utils/executeTableQuery.js";

export default function createSlackIntegrationTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS slack_integration (
   id INT NOT NULL AUTO_INCREMENT ,
    team_id VARCHAR(50) NOT NULL,
    team_name VARCHAR(255),
    access_token TEXT NOT NULL,
    scope TEXT,
    project_id VARCHAR(50),
    bot_user_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    channel_id VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (id)
)`;

  executeTableQuery(createTableQuery, "slack_integration");
}
