import { Pipe, PipeTransform } from "@angular/core";
import { compareAttributes } from "../../manage-usagers/utils/sorter";

@Pipe({
  name: "sortArray",
  standalone: true,
})
export class SortArrayPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(array: any[], sortKey: string, sortValue: "asc" | "desc"): any[] {
    if (!array || array.length <= 1) {
      return array;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return array.sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      return compareAttributes(valA, valB, sortValue === "asc");
    });
  }
}
