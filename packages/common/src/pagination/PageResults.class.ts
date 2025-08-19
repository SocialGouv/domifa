import { type PageMeta } from "./PageMeta.interface";

export class PageResults<T> {
  public data: T[];
  public meta: PageMeta;

  constructor(results?: Partial<PageResults<T>>) {
    this.data = results?.data ?? [];
    this.meta = results?.meta ?? {
      page: 1,
      take: 5,
      itemCount: 0,
      pageCount: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }
}
