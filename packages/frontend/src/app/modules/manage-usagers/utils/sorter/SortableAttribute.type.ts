import { SortableAttributeType } from "./SortableAttributeType.type";

export interface SortableAttribute {
  value: string | Date | number | null;
  type?: SortableAttributeType;
  asc?: boolean;
}
