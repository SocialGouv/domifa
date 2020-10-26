import { Column, Worksheet } from "exceljs";
import { XlCellModel, XlRowModel } from "./XlRowModel.type";

export const xlRenderer = {
  selectWorksheet,
};

export type WorksheetRenderer = ReturnType<typeof selectWorksheet>;

function selectWorksheet(worksheet: Worksheet) {
  return {
    configureColumn,
    renderRow,
    renderCell,
  };

  function configureColumn(columns: Partial<Column>[]) {
    columns.forEach((column, i) => {
      const originalColumn =
        worksheet.columns && worksheet.columns[i]
          ? worksheet.columns[i]
          : undefined;

      const originalColumnWidth = originalColumn
        ? originalColumn.width
        : undefined;
      if (originalColumnWidth !== undefined && column.width === undefined) {
        column.width = originalColumnWidth;
      }
    });

    worksheet.columns = columns;
  }
  function renderRow(
    rowIndex: number,
    rowModel: XlRowModel,
    { insert }: { insert: boolean } = { insert: false }
  ) {
    const row = insertOrGetRow(rowIndex, rowModel, { insert });
    if (rowModel.styles) {
      if (rowModel.values.__ALL__) {
        Object.keys(rowModel.values).forEach((rowId) => {
          const cell = row.getCell(rowId);
          const style = rowModel.styles.__ALL__;
          cell.style = {
            ...row.getCell(rowId).style,
            ...style,
          };
        });
      }
      Object.keys(rowModel.styles)
        .filter((rowId) => rowId !== "__ALL__")
        .forEach((rowId) => {
          const cell = row.getCell(rowId);
          const style = rowModel.styles[rowId];
          cell.style = {
            ...row.getCell(rowId).style,
            ...style,
          };
        });
    }
  }
  function renderCell(
    rowIndex: number,
    colId: string,
    cellModel: XlCellModel,
    { insert }: { insert: boolean } = { insert: false }
  ) {
    const rowModel: XlRowModel = {
      values: {},
      styles: {},
    };
    rowModel.values[colId] = cellModel.value;
    rowModel.styles[colId] = cellModel.style;
    return renderRow(rowIndex, rowModel, {
      insert,
    });
  }
  function insertOrGetRow(
    rowIndex: number,
    rowModel: XlRowModel,
    { insert }: { insert: boolean }
  ) {
    if (insert) {
      return worksheet.insertRow(rowIndex, rowModel.values, "o");
    }
    const row = worksheet.getRow(rowIndex);
    // apply values
    Object.keys(rowModel.values).forEach((rowId) => {
      const cell = row.getCell(rowId);
      cell.value = rowModel.values[rowId];
    });
    return row;
  }
}
