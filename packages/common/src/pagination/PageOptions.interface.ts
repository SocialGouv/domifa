import { type Order } from "./PageOrder.enum";

export interface PageOptions {
  order: Order;
  page: number;
  take: number;
}
