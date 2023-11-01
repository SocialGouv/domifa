import { PageMeta } from "./PageMeta.type";

export interface PageResults<T> {
  data: T[];
  meta: PageMeta;
}
