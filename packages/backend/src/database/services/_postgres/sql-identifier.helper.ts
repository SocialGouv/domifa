import { myDataSource } from "./appTypeormManager.service";

// Wraps a list of column names into properly escaped SQL identifiers for use
// in a SELECT clause. Delegates to TypeORM's driver-level escape, which is
// dialect-aware (handles double-quoting on Postgres, backticks on MySQL, etc.)
// and doubles any embedded quote — so even an attacker-controlled string can
// never break out of the identifier and inject SQL.
export function joinSelectFields(arr: string[]): string[] {
  return arr.map((attr) => myDataSource.driver.escape(attr));
}
