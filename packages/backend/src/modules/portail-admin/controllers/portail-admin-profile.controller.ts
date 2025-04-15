import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
  CurrentUser,
} from "../../../auth/decorators";
import { AppUserGuard } from "../../../auth/guards";
import { USER_SUPERVISOR_ROLES } from "../../../_common/model/users/user-supervisor";
import { portailAdminProfilBuilder } from "../services/portail-admin-profil-builder.service";
import { UserAdminAuthenticated } from "../../../_common/model";

@Controller("portail-admins/profile")
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles(...USER_SUPERVISOR_ROLES)
@ApiTags("portail-admins-profile")
export class PortailAdminProfileController {
  @Get("me")
  @HttpCode(HttpStatus.OK)
  public async meAdmin(@CurrentUser() currentUser: UserAdminAuthenticated) {
    return await portailAdminProfilBuilder.build({
      userId: currentUser._userId,
    });
  }
}
