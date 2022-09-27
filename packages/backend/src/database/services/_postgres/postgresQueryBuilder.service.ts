import { format } from "date-fns";

export const postgresQueryBuilder = {
  formatPostgresDate,
};

function formatPostgresDate(maxCreationDate: Date) {
  return format(maxCreationDate, "yyyy-MM-dd HH:mm:ss");
}
