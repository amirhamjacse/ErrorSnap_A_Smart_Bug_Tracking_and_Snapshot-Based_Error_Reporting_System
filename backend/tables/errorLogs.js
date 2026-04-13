import executeTableQuery from "../utils/executeTableQuery.js";

export default function createErrorLogsTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.errorlogs (
    id VARCHAR(50) NOT NULL , 
    message VARCHAR(100) NOT NULL ,
    project_id VARCHAR(50) NOT NULL ,
    source VARCHAR(100) NOT NULL ,
    lineno INT(5) NULL DEFAULT NULL ,
    colno INT(5) NULL DEFAULT NULL ,
    stack LONGTEXT NOT NULL , 
    browser VARCHAR(20) NOT NULL ,
    os VARCHAR(20) NOT NULL,
    image VARCHAR(255) NULL DEFAULT NULL,
    status TINYINT NOT NULL COMMENT '0 = unresolved; 1 = pending; 2 = resolved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    assignee_id INT(11) DEFAULT NULL COMMENT 'ID of the user assigned to address the error',
    PRIMARY KEY (id)
    )`;

  executeTableQuery(createTableQuery, "errorlogs");
}
