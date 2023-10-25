import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "orderByDate",
})
export class OrderByDatePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(array: any[], sortOrder: string): any[] {
    if (!array || array.length <= 1) {
      return array;
    }

    return array.sort((a, b) => {
      const dateA = new Date(a.dateDecision);
      const dateB = new Date(b.dateDecision);

      if (sortOrder === "asc") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }
}
