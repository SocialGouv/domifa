import { type PageMeta } from "./PageMeta.interface";

export interface PageResults<T> {
  data: T[];
  meta: PageMeta;
}
