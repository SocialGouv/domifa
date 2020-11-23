export type PgRepositoryFindOptions<T> = {
  order?: {
    [P in keyof T]?: "ASC" | "DESC";
  };
  select?: (keyof T)[] | "ALL";
  maxResults?: number;
  skip?: number;
};
