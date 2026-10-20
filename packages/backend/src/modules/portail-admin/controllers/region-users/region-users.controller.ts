import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiMessage, RegionDepartmentUser } from "@domifa/common";
import { UserAdminAuthenticated } from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { AppUserGuard } from "../../../../auth/guards";
import { DeleteUserDto } from "../../../users/dto";
import { RegisterDepartmentUserDto } from "../../dto";
import { RegionDepartmentUsersService } from "../../services/region-department-users/region-department-users.service";

// Pilotage portal: a DREETS manages the DDETS accounts of its region
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("region")
@Controller("admin/region-users")
export class RegionUsersController {
  constructor(
    private readonly regionDepartmentUsersService: RegionDepartmentUsersService
  ) {}

  @Get("")
  public async getDepartmentUsers(
    @CurrentSupervisor() user: UserAdminAuthenticated
  ): Promise<RegionDepartmentUser[]> {
    return this.regionDepartmentUsersService.findAll(user);
  }

  @Post("")
  public async registerDepartmentUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Body() registerDto: RegisterDepartmentUserDto
  ): Promise<ApiMessage> {
    await this.regionDepartmentUsersService.create(user, registerDto);
    return { message: "OK" };
  }

  @Delete(":uuid")
  public async deleteDepartmentUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: DeleteUserDto
  ): Promise<ApiMessage> {
    await this.regionDepartmentUsersService.softDelete(user, uuid, body.motif);
    return { message: "OK" };
  }
}
