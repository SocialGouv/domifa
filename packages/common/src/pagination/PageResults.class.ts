import { PageMeta } from "./PageMeta.class";

export class PageResults<T> {
  public data: T[];
  public meta: PageMeta;

  constructor(results?: Partial<PageResults<T>>) {
    this.data = results?.data ?? [];
    this.meta = results?.meta ?? new PageMeta();
  }
}
