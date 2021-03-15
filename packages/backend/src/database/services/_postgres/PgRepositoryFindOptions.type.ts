import { PgRepositoryFindOrder } from "./PgRepositoryFindOrder.type";

export type PgRepositoryFindOptions<T> = {
  order?: PgRepositoryFindOrder<T>;
  groupBy?: string;
  select?: (keyof T)[] | "ALL";
  maxResults?: number;
  skip?: number;
  throwErrorIfNotFound?: boolean;
};
