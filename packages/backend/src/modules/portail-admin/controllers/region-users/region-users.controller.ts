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
import { ApiMessage, RegionManagedUser } from "@domifa/common";
import { UserAdminAuthenticated } from "../../../../_common/model";
import {
  AllowUserProfiles,
  AllowUserSupervisorRoles,
} from "../../../../auth/decorators";
import { CurrentSupervisor } from "../../../../auth/decorators/current-supervisor.decorator";
import { AppUserGuard } from "../../../../auth/guards";
import { DeleteUserDto } from "../../../users/dto";
import { RegisterRegionUserDto } from "../../dto";
import { RegionUsersService } from "../../services/region-users/region-users.service";

// Pilotage portal: a DREETS manages the DDETS and DREETS accounts of its region
@UseGuards(AuthGuard("jwt"), AppUserGuard)
@AllowUserProfiles("supervisor")
@AllowUserSupervisorRoles("region")
@Controller("admin/region-users")
export class RegionUsersController {
  constructor(private readonly regionUsersService: RegionUsersService) {}

  @Get("")
  public async getDepartmentUsers(
    @CurrentSupervisor() user: UserAdminAuthenticated
  ): Promise<RegionManagedUser[]> {
    return this.regionUsersService.findAll(user);
  }

  @Post("")
  public async registerDepartmentUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Body() registerDto: RegisterRegionUserDto
  ): Promise<ApiMessage> {
    await this.regionUsersService.create(user, registerDto);
    return { message: "OK" };
  }

  @Delete(":uuid")
  public async deleteDepartmentUser(
    @CurrentSupervisor() user: UserAdminAuthenticated,
    @Param("uuid", new ParseUUIDPipe()) uuid: string,
    @Body() body: DeleteUserDto
  ): Promise<ApiMessage> {
    await this.regionUsersService.softDelete(user, uuid, body.motif);
    return { message: "OK" };
  }
}
