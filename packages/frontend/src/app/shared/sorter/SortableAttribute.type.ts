import { SortableAttributeType } from './SortableAttributeType.type';

export interface SortableAttribute {
  value: any;
  type?: SortableAttributeType;
  asc?: boolean;
}