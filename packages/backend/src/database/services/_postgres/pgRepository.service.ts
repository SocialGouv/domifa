import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindConditions,
  ObjectLiteral,
  OrderByCondition,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { appLogger } from "../../../util";
import { appTypeormManager } from "./appTypeormManager.service";
import { PgRepositoryFindOptions } from "./PgRepositoryFindOptions.type";

export const pgRepository = {
  get,
};

export function typeOrmSearch<T>(
  search: FindConditions<T>[] | FindConditions<T> | ObjectLiteral | string
): Partial<T> {
  return (search as unknown) as Partial<T>;
}

function get<T, DEFAULT_RESULT extends Partial<T> | number = T>(
  entityTarget: EntityTarget<T>,
  {
    defaultSelect = "ALL",
    entityManager,
  }: {
    defaultSelect?: (keyof T)[] | "ALL";
    entityManager?: EntityManager;
  } = {
    defaultSelect: "ALL",
  }
) {
  return {
    typeorm,
    count,
    aggregateAsNumber,
    max,
    countBy,
    save,
    findOne,
    findMany,
    updateOne,
    updateMany,
    deleteByCriteria,
    findOneWithQuery,
    findManyWithQuery,
  };

  async function typeorm() {
    return appTypeormManager.getRepository(entityTarget, entityManager);
  }
  async function save<E extends DeepPartial<T> | DeepPartial<T>[]>(
    entities: E
  ): Promise<E> {
    return (await typeorm()).save(entities as any);
  }

  async function count(
    {
      countAttribute = "uuid",
      logSql,
      params,
      where,
    }: {
      where?: Partial<T>;
      countAttribute?: string;
      logSql?: boolean;
      params?: { [attr: string]: any };
    } = {
      countAttribute: "uuid",
    }
  ): Promise<number> {
    return aggregateAsNumber({
      expression: `COUNT("${countAttribute}")`,
      resultAlias: "count",
      where,
      logSql,
      params,
    });
  }

  async function max({
    maxAttribute,
    logSql = false,
    params = {},
    where,
    alias,
  }: {
    where?: Partial<T>;
    maxAttribute: string;
    logSql?: boolean;
    params?: { [attr: string]: any };
    alias?: string;
  }): Promise<number> {
    return aggregateAsNumber({
      alias,
      expression: `MAX("${maxAttribute}")`,
      resultAlias: "max",
      where,
      logSql,
      params,
    });
  }

  async function aggregateAsNumber({
    expression,
    resultAlias,
    where,
    logSql,
    params,
    alias,
  }: {
    expression: string;
    resultAlias: string;
    where?: Partial<T>;
    logSql?: boolean;
    params?: { [attr: string]: any };
    alias?: string;
  }): Promise<number> {
    const typeormRepository = await typeorm();
    let qb = typeormRepository
      .createQueryBuilder(alias)
      .select(`${expression}`, resultAlias);

    if (where) {
      qb = qb.where(where, params);
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

  function escapeAttr(value: any, enabled = true): string {
    if (enabled) {
      return `"${value}"`;
    }
    return value;
  }

  async function countBy<CountBy extends keyof T>({
    where,
    countBy,
    countByAlias,
    countAttribute = "uuid" as keyof T,
    order = {
      count: "ASC",
      countBy: "ASC",
    },
    escapeAttributes = true,
    nullLabel,
  }: {
    where?: Partial<T>;
    countBy: CountBy;
    countByAlias?: string;
    countAttribute?: keyof T;
    order?: {
      count?: "ASC" | "DESC";
      countBy?: "ASC" | "DESC";
    };
    escapeAttributes?: boolean;
    nullLabel?: string;
  }): Promise<
    (Pick<T, CountBy> & {
      count: number;
    })[]
  > {
    const typeormRepository = await typeorm();
    let qb = typeormRepository
      .createQueryBuilder("s")
      .select(`COUNT(${escapeAttr(countAttribute, escapeAttributes)})`, "count")
      .addSelect(`${escapeAttr(countBy, escapeAttributes)}`, countByAlias)
      .groupBy(`s.${escapeAttr(countBy, escapeAttributes)}`);

    if (where) {
      qb = qb.where(where);
    }
    if (order) {
      const orderBy = Object.keys(order).reduce((acc, key) => {
        // replace "countBy" by countBy name
        acc[
          key === "count" ? key : `${escapeAttr(countBy, escapeAttributes)}`
        ] = order[key];
        return acc;
      }, {} as OrderByCondition);
      qb = qb.orderBy(orderBy);
    }

    try {
      const results = await qb.getRawMany();
      return results.map((r) => {
        const label = countByAlias ? countByAlias : countBy;
        if (nullLabel && r[label] === null) {
          const res = {
            count: parseInt(r.count, 10) as number,
          } as any;
          res[label] = nullLabel;
          return res;
        }
        return {
          ...r,
          count: parseInt(r.count, 10) as number,
        };
      }) as any;
    } catch (err) {
      printQueryError<T>(qb);
      throw err;
    }
  }

  async function findManyWithQuery<R = DEFAULT_RESULT>({
    where,
    params = {},
    ...options
  }: {
    where: string;
    params?: { [attr: string]: any };
    logSql?: boolean;
  } & PgRepositoryFindOptions<T>): Promise<R[]> {
    const typeormRepository = await typeorm();

    const qb = typeormRepository.createQueryBuilder();
    const select = _buildSelectAttributesQB(options, { addQuotes: true });
    qb.select(select as any).where(where, params);
    if (options.groupBy) {
      qb.groupBy(options.groupBy);
    }
    if (options.order) {
      qb.orderBy(options.order);
    }

    if (options.logSql) {
      appLogger.debug(`[pgRepository] "${qb.getSql()}"`);
    }
    if (options.skip) {
      qb.skip(options.skip);
    }
    if (options.maxResults) {
      qb.limit(options.maxResults);
    }
    try {
      return await qb.execute();
    } catch (err) {
      printQueryError<T>(qb);
      throw err;
    }
  }
  async function findOneWithQuery<R = DEFAULT_RESULT>(
    args: {
      where: string;
      params: { [attr: string]: any };
      logSql?: boolean;
    } & PgRepositoryFindOptions<T>
  ): Promise<R> {
    const res = await findManyWithQuery<R>({
      ...args,
      maxResults: 1,
    });
    if (res.length > 0) {
      return res[0];
    }
  }

  async function findOne<R = DEFAULT_RESULT>(
    search?: Partial<T>,
    options: PgRepositoryFindOptions<T> = {}
  ): Promise<R> {
    const typeormRepository = await typeorm();

    const res = await typeormRepository.findOne({
      select: _buildSelectAttributes(options),
      where: search,
      order: options.order,
    });
    return (res as unknown) as R;
  }

  async function findMany<R = DEFAULT_RESULT>(
    search: Partial<T>,
    options: PgRepositoryFindOptions<T> = {}
  ): Promise<R[]> {
    const typeormRepository = await typeorm();

    const res = await typeormRepository.find({
      select: _buildSelectAttributes(options),
      where: search,
      order: options.order,
      skip: options.skip,
      take: options.maxResults,
    });
    return (res as unknown) as R[];
  }

  async function updateOne<R = DEFAULT_RESULT>(
    search: Partial<T>,
    data: Partial<T>,
    options: PgRepositoryFindOptions<T> & { returnSearch?: Partial<T> } = {}
  ) {
    const typeormRepository = await typeorm();

    const { affected } = await typeormRepository.update(
      (search as unknown) as FindConditions<T>,
      (data as unknown) as QueryDeepPartialEntity<T>
    );
    if (affected === 1) {
      return findOne<R>(
        options?.returnSearch ? options?.returnSearch : search,
        options
      );
    }
    return undefined;
  }

  async function updateMany<R = DEFAULT_RESULT>(
    search: Partial<T>,
    data: Partial<T>,
    options: PgRepositoryFindOptions<T> = {}
  ) {
    const typeormRepository = await typeorm();

    await typeormRepository.update(
      (search as unknown) as FindConditions<T>,
      (data as unknown) as QueryDeepPartialEntity<T>
    );
    return findMany<R>(search, options);
  }

  function _buildSelectAttributes(
    options: PgRepositoryFindOptions<T> = {}
  ): (keyof T)[] | undefined {
    const select = options.select ? options.select : defaultSelect;
    const attributes =
      select === "ALL"
        ? undefined // returns all
        : select;

    return attributes;
  }
  function _buildSelectAttributesQB(
    options: PgRepositoryFindOptions<T> = {},
    { addQuotes }: { addQuotes: boolean }
  ): string[] | string {
    const select = options.select ? options.select : defaultSelect;
    const attributes =
      select === "ALL"
        ? undefined // returns all
        : select;
    if (attributes && Array.isArray(attributes) && addQuotes) {
      return (attributes as (keyof T)[]).map((x) => `"${x}"`);
    }
    return attributes as any;
  }
  async function deleteByCriteria(search: Partial<T>): Promise<number> {
    const typeormRepository = await typeorm();
    const res = await typeormRepository.delete(
      (search as unknown) as FindConditions<T>
    );
    return res.affected;
  }
}
function printQueryError<T>(qb) {
  appLogger.warn(
    `[pgRepository] invalid query "${qb.getSql()} - ${
      qb.getParameters() ? JSON.stringify(qb.getParameters()) : ""
    }"`
  );
}
