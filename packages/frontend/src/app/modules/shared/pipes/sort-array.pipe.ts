import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sortArray",
})
export class SortArrayPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(array: any[], sortKey: any, sortValue: "asc" | "desc"): any[] {
    if (!array || array.length <= 1) {
      return array;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return array.sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === null) {
        return -1;
      }

      let comparison = 0;
      if (valA === valB) {
        return 0;
      } else if (typeof valA === "string") {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === "boolean") {
        comparison = valA === valB ? 0 : valA ? -1 : 1;
      } else if (valA instanceof Date) {
        comparison = valB instanceof Date ? valA.getTime() - valB.getTime() : 1;
      }

      return sortValue === "asc" ? comparison : -comparison;
    });
  }
}
