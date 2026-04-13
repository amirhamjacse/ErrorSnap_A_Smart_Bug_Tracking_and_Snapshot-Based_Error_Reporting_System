import executeTableQuery from "../utils/executeTableQuery.js";

export default function createSourcemapHistoryTable() {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS sourcemap_history (
  id INT NOT NULL AUTO_INCREMENT , 
  project_id VARCHAR(50) NOT NULL , 
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
  PRIMARY KEY (id),
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
  )`;

  executeTableQuery(createTableQuery, "sourcemap_history");
}
