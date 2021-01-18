import {
  DeepPartial,
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
  }: {
    defaultSelect?: (keyof T)[] | "ALL";
  } = {
    defaultSelect: "ALL",
  }
) {
  return {
    typeorm,
    count,
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
    return appTypeormManager.getRepository(entityTarget);
  }
  async function save<E extends DeepPartial<T> | DeepPartial<T>[]>(
    entities: E
  ): Promise<E> {
    return (await typeorm()).save(entities as any);
  }

  async function count(
    search?: Partial<T>,
    countAttribute = "uuid"
  ): Promise<number> {
    const typeormRepository = await typeorm();
    let qb = typeormRepository
      .createQueryBuilder()
      .select(`COUNT("${countAttribute}")`, "count");

    if (search) {
      qb = qb.where(search);
    }

    try {
      const result = await qb.getRawOne();
      return parseInt(result.count, 10) as number;
    } catch (err) {
      appLogger.warn(`[pgRepository] invalid query "${qb.getSql()}"`);
      throw err;
    }
  }

  async function countBy<CountBy extends keyof T>({
    where,
    countBy,
    countAttribute = "uuid" as keyof T,
    order = {
      count: "ASC",
      countBy: "ASC",
    },
  }: {
    where?: Partial<T>;
    countBy: CountBy;
    countAttribute?: keyof T;
    order?: {
      count?: "ASC" | "DESC";
      countBy?: "ASC" | "DESC";
    };
  }): Promise<
    (Pick<T, CountBy> & {
      count: number;
    })[]
  > {
    const typeormRepository = await typeorm();
    let qb = typeormRepository
      .createQueryBuilder("s")
      .select(`COUNT("${countAttribute}")`, "count")
      .addSelect(`"${countBy}"`)
      .groupBy(`s."${countBy}"`);

    if (where) {
      qb = qb.where(where);
    }
    if (order) {
      const orderBy = Object.keys(order).reduce((acc, key) => {
        // replace "countBy" by countBy name
        acc[key === "count" ? key : `"${countBy}"`] = order[key];
        return acc;
      }, {} as OrderByCondition);
      qb = qb.orderBy(orderBy);
    }

    try {
      const results = await qb.getRawMany();
      return results.map((r) => ({
        ...r,
        count: parseInt(r.count, 10) as number,
      })) as any;
    } catch (err) {
      appLogger.warn(`[pgRepository] invalid query "${qb.getSql()}"`);
      throw err;
    }
  }

  async function findManyWithQuery<R = DEFAULT_RESULT>({
    where,
    params = {},
    ...options
  }: {
    where: string;
    params: { [attr: string]: any };
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
      appLogger.warn(`[pgRepository] invalid query "${qb.getSql()}"`);
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
