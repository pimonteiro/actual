export default async function runMigration(db) {
  // Drop if it exists to fix the NOT NULL constraints from previous failed attempts
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
