import { CellValue, Style } from "exceljs";

export type XlCellStyle = Style;
export type XlCellValue = CellValue;

export type XlRowModel = {
  values?: {
    [rowId: string]: XlCellValue;
  };
  styles?: {
    [rowId: string]: Partial<XlCellStyle>;
  };
};

export type XlCellModel = {
  value?: XlCellValue;
  style?: Partial<XlCellStyle>;
};
