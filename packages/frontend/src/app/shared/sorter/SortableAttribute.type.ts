import { SortableAttributeType } from "./SortableAttributeType.type";

export interface SortableAttribute {
  value: string | Date | number;
  type?: SortableAttributeType;
  asc?: boolean;
}
