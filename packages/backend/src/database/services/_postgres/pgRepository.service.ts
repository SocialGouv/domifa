import {
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  SelectQueryBuilder,
} from "typeorm";
import { appLogger } from "../../../util";
import { myDataSource } from "./appTypeormManager.service";

export const pgRepository = {
  get,
};

export function typeOrmSearch<T>(
  search: FindOptionsWhere<T>[] | FindOptionsWhere<T> | ObjectLiteral | string
): FindOptionsWhere<T> {
  return search as unknown as FindOptionsWhere<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function get<T, _DEFAULT_RESULT extends Partial<T> | number = T>(
  entityTarget: EntityTarget<T>
) {
  return {
    typeorm,
    aggregateAsNumber,
    countBy,
    _parseCounts,
  };

  async function typeorm() {
    return myDataSource.getRepository(entityTarget);
  }

  async function aggregateAsNumber({
    expression,
    resultAlias,
    where,
    logSql,
    params,
    alias,
    configure,
  }: {
    expression: string;
    resultAlias: string;
    where?: string | Partial<T>;
    logSql?: boolean;
    params?: { [attr: string]: any };
    alias?: string;
    configure?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>;
  }): Promise<number> {
    const typeormRepository = await typeorm();
    let qb = typeormRepository
      .createQueryBuilder(alias)
      .select(`${expression}`, resultAlias);

    if (where) {
      qb = qb.where(where, params);
    }
    if (configure) {
      qb = configure(qb);
    }
    if (logSql) {
      appLogger.debug(`[pgRepository.aggregateAsNumber] "${qb.getSql()}"`);
    }

    try {
      const result = (await qb.getRawOne())[resultAlias];
      return !result ? 0 : (parseInt(result, 10) as number);
    } catch (err) {
      printQueryError<T>(qb);
      throw err;
    }
  }

  async function countBy<CountBy extends keyof T>({
    alias = "s",
    where,
    params,
    countBy,
    countByAlias,
    countAttribute = "uuid" as keyof T,
    order = {
      count: "ASC",
      countBy: "ASC",
    },
    escapeAttributes = true,
    nullLabel,
    logSql,
  }: {
    alias?: string;
    where?: FindOptionsWhere<T>;
    params?: { [attr: string]: any };
    countBy: CountBy;
    countByAlias?: string;
    countAttribute?: keyof T;
    order?: {
      count?: "ASC" | "DESC";
      countBy?: "ASC" | "DESC";
    };
    escapeAttributes?: boolean;
    nullLabel?: string;
    logSql?: boolean;
  }): Promise<
    (Pick<T, CountBy> & {
      count: number;
    })[]
  > {
    const typeormRepository = await typeorm();
    let qb = typeormRepository
      .createQueryBuilder(alias)
      .select(`COUNT(${escapeAttr(countAttribute, escapeAttributes)})`, "count")
      .addSelect(`${escapeAttr(countBy, escapeAttributes)}`, countByAlias)
      .groupBy(`${alias}.${escapeAttr(countBy, escapeAttributes)}`);

    if (where) {
      qb = qb.where(where, params);
    }
    if (order) {
      const orderBy = Object.keys(order).reduce((acc, key) => {
        // replace "countBy" by countBy name
        acc[
          key === "count" ? key : `${escapeAttr(countBy, escapeAttributes)}`
        ] = order[key];
        return acc;
      }, {} as any);
      qb = qb.orderBy(orderBy);
    }

    if (logSql) {
      appLogger.debug(`[pgRepository.aggregateAsNumber] "${qb.getSql()}"`);
    }

    try {
      const results = await qb.getRawMany();
      return _parseCounts<T, CountBy>(results, {
        label: countByAlias || (countBy as string),
        nullLabel,
      });
    } catch (err) {
      printQueryError<T>(qb);
      throw err;
    }
  }
}

function _parseCounts<T, CountBy extends keyof T>(
  results: any[],
  {
    label,
    nullLabel,
  }: {
    label: string;
    nullLabel?: string;
  }
): (Pick<T, CountBy> & {
  count: number;
})[] {
  return results.map((r) => {
    if (nullLabel && r[label] === null) {
      const res: any = {
        count: parseInt(r.count, 10) as number,
      };
      res[label] = nullLabel;
      return res;
    }
    return {
      ...r,
      count: parseInt(r.count, 10) as number,
    };
  }) as (Pick<T, CountBy> & {
    count: number;
  })[];
}

function printQueryError<T>(qb: SelectQueryBuilder<T>): void {
  appLogger.warn(
    `[pgRepository] invalid query "${qb.getSql()} - ${
      qb.getParameters() ? JSON.stringify(qb.getParameters()) : ""
    }"`
  );
}

function escapeAttr(value: any, enabled = true): string {
  if (enabled) {
    return `"${value}"`;
  }
  return value;
}

export function joinSelectFields(arr: string[]): string[] {
  return arr.map((attr) => `"${attr}"`);
}
