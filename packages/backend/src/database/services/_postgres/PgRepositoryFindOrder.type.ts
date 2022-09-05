export type PgRepositoryFindOrder<T> = {
  [P in keyof T]?: "ASC" | "DESC" | "NULLS FIRST" | "NULLS LAST";
};
