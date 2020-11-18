import {
  DeepPartial,
  EntityTarget,
  FindConditions,
  ObjectLiteral
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { appTypeormManager } from "../../database/appTypeormManager.service";
import { appLogger } from "../AppLogger.service";
import { PgRepositoryFindOptions } from "./PgRepositoryFindOptions.type";

export const pgRepository = {
  get,
};

function get<T, DEFAULT_RESULT extends Partial<T> | number = T>(
  entityTarget: EntityTarget<T>,
  {
    defaultSelect = "ALL",
  }: {
    defaultSelect?: (keyof T)[] | "ALL";
  }
) {
  return {
    typeorm,
    count,
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
  async function save(entities: DeepPartial<T> | DeepPartial<T>[]) {
    return (await typeorm()).save(entities as DeepPartial<T>);
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
    qb.select(_buildSelectAttributes(options).map((x) => `"${x}"`)).where(
      where,
      params
    );
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
    search?: FindConditions<T>[] | FindConditions<T> | ObjectLiteral | string,
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
    search?: FindConditions<T>[] | FindConditions<T> | ObjectLiteral | string,
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
    options: PgRepositoryFindOptions<T> = {}
  ) {
    const typeormRepository = await typeorm();

    await typeormRepository.update(
      (search as unknown) as FindConditions<T>,
      (data as unknown) as QueryDeepPartialEntity<T>
    );
    return findOne<R>(search, options);
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
  ): (keyof T)[] {
    const select = options.select ? options.select : defaultSelect;
    return select === "ALL"
      ? undefined // returns all
      : select;
  }
  async function deleteByCriteria(search: Partial<T>) {
    const typeormRepository = await appTypeormManager.getRepository(
      entityTarget
    );
    return typeormRepository.delete((search as unknown) as FindConditions<T>);
  }
}
