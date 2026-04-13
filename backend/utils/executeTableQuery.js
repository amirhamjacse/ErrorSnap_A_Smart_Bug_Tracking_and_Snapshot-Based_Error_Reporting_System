import { con } from "../database/connection.js";

export default function executeTableQuery(tableQuery, table) {
  con.query(tableQuery, function (error, results) {
    if (error) {
      console.log("Error in creating table", error);
      return;
    }

    if (results.warningCount !== 1) {
      console.log(`${table} table created successfully`);
    }
  });
}
