import executeTableQuery from "../utils/executeTableQuery.js";

export default function createBillingTables() {
  const usageMeterMonthlyQuery = `CREATE TABLE IF NOT EXISTS usage_meter_monthly (
    id INT NOT NULL AUTO_INCREMENT,
    project_id VARCHAR(50) NOT NULL,
    period_key VARCHAR(7) NOT NULL,
    errors_logged INT NOT NULL DEFAULT 0,
    sessions_recorded INT NOT NULL DEFAULT 0,
    api_calls INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_project_period (project_id, period_key)
  )`;

  const usageSessionsMonthlyQuery = `CREATE TABLE IF NOT EXISTS usage_sessions_monthly (
    id INT NOT NULL AUTO_INCREMENT,
    project_id VARCHAR(50) NOT NULL,
    period_key VARCHAR(7) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_project_period_session (project_id, period_key, session_id)
  )`;

  executeTableQuery(usageMeterMonthlyQuery, "usage_meter_monthly");
  executeTableQuery(usageSessionsMonthlyQuery, "usage_sessions_monthly");
}
