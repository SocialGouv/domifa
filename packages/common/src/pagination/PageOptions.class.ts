import { Order } from "./PageOrder.enum";

export class PageOptions {
  public order: Order;
  public page: number;
  public take: number;

  constructor(options?: Partial<PageOptions>) {
    this.order = options?.order ?? Order.DESC;
    this.page = options?.page ?? 1;
    this.take = options?.take ?? 5;
  }
}
