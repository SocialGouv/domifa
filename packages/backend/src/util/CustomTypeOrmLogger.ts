import { Logger, LoggerOptions, QueryRunner } from "typeorm";
import { appLogger } from "./AppLogger.service";

/**
 * Adapted from TypeOrm AdvancedConsoleLogger.ts using our own appLogger
 */
export class CustomTypeOrmLogger implements Logger {
  constructor(private options?: LoggerOptions) {}

  /**
   * Logs query and parameters used in it.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    if (
      this.options === "all" ||
      this.options === true ||
      (Array.isArray(this.options) && this.options.indexOf("query") !== -1)
    ) {
      appLogger.info("sql_query", { context: { query, parameters } });
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner
  ) {
    if (
      this.options === "all" ||
      this.options === true ||
      (Array.isArray(this.options) && this.options.indexOf("error") !== -1)
    ) {
      appLogger.error("sql_query failed", {
        context: { query, parameters, error },
      });
    }
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner
  ) {
    appLogger.error("slow sql_query", {
      context: { query, parameters, execution_time: time },
    });
  }

  /**
   * Logs events from the schema build process.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    if (
      this.options === "all" ||
      (Array.isArray(this.options) && this.options.indexOf("schema") !== -1)
    ) {
      appLogger.info(message);
    }
  }

  /**
   * Logs events from the migration run process.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logMigration(message: string, _queryRunner?: QueryRunner) {
    appLogger.info(message);
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(
    level: "log" | "info" | "warn",
    message: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner
  ) {
    switch (level) {
      case "log":
        if (
          this.options === "all" ||
          (Array.isArray(this.options) && this.options.indexOf("log") !== -1)
        )
          appLogger.info(message);
        break;
      case "info":
        if (
          this.options === "all" ||
          (Array.isArray(this.options) && this.options.indexOf("info") !== -1)
        )
          appLogger.info(message);
        break;
      case "warn":
        if (
          this.options === "all" ||
          (Array.isArray(this.options) && this.options.indexOf("warn") !== -1)
        )
          appLogger.warn(message);
        break;
    }
  }
}
