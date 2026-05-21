export default async function runMigration(db) {
  // Re-create the table without NOT NULL constraints to support CRDT sync
  db.execQuery(`
    DROP TABLE IF EXISTS custom_budget_periods;

    CREATE TABLE custom_budget_periods (
      id TEXT PRIMARY KEY,
      month TEXT UNIQUE,
      start_date TEXT,
      end_date TEXT,
      tombstone INTEGER DEFAULT 0
    );
  `);
}
