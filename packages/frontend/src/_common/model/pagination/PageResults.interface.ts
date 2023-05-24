import { PageMeta } from "./PageMeta.type";

export interface PageResults<T> {
  readonly data: T[];
  readonly meta: PageMeta;
}
