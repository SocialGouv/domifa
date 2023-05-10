import { PageMeta } from "./PageMeta.type";

export class PageResults<T> {
  readonly data: T[];
  readonly meta: PageMeta;
}
