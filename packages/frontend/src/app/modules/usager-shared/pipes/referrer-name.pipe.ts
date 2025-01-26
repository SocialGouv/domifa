import { Pipe, PipeTransform } from "@angular/core";
import { ManageUsersService } from "../../manage-users/services/manage-users.service";

@Pipe({
  name: "referrerName",
})
export class ReferrerNamePipe implements PipeTransform {
  constructor(private manageUsersService: ManageUsersService) {}

  transform(referrerId: number | null): string {
    if (!referrerId) {
      return "Aucun référent";
    }
    return this.manageUsersService.referrersMap[referrerId] || "Aucun référent";
  }
}
