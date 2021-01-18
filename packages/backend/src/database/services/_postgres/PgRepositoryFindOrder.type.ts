export type PgRepositoryFindOrder<T> = {
  [P in keyof T]?: "ASC" | "DESC";
};
