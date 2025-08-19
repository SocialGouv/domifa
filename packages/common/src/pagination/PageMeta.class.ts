import { PageMetaParams } from "./PageItem.interface";

export class PageMeta {
  public page: number;
  public take: number;
  public itemCount: number;
  public pageCount: number;
  public hasPreviousPage: boolean;
  public hasNextPage: boolean;

  constructor(params?: PageMetaParams) {
    if (params) {
      const { itemCount, pageOptions } = params;

      this.page = pageOptions?.page;
      this.take = pageOptions?.take;
      this.itemCount = itemCount;
      this.pageCount = Math.ceil(itemCount / pageOptions.take);
      this.hasPreviousPage = pageOptions.page > 1;
      this.hasNextPage = pageOptions.page < this.pageCount;
    } else {
      this.page = 1;
      this.take = 10;
      this.itemCount = 0;
      this.pageCount = 0;
      this.hasPreviousPage = false;
      this.hasNextPage = false;
    }
  }
}
