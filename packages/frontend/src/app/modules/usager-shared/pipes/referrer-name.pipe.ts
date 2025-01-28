import { Pipe, PipeTransform } from "@angular/core";
import { ManageUsersService } from "../../manage-users/services/manage-users.service";
import { map, Observable } from "rxjs";
@Pipe({
  name: "referrerName",
})
export class ReferrerNamePipe implements PipeTransform {
  constructor(private manageUsersService: ManageUsersService) {}

  transform(referrerId: number | null): Observable<string> {
    return this.manageUsersService.referrersMap$.pipe(
      map((referrersMap) => {
        if (!referrerId) {
          return "Aucun référent";
        }
        return referrersMap[referrerId] || "Aucun référent";
      })
    );
  }
}
