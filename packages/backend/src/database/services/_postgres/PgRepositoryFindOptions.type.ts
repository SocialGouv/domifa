import { FindOptionsOrder } from "typeorm";

export type PgRepositoryFindOptions<T> = {
  order?: FindOptionsOrder<T>;
  groupBy?: string;
  select?: (keyof T)[] | "ALL";
  maxResults?: number;
  skip?: number;
  throwErrorIfNotFound?: boolean;
};
