import moment = require("moment");

export const postgresQueryBuilder = {
  formatPostgresDate,
};

function formatPostgresDate(maxCreationDate: Date) {
  return moment(maxCreationDate).format("yyyy-MM-DD HH:mm:ss");
}
