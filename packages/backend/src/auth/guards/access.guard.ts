import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { UsagersService } from "../../usagers/services/usagers.service";

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly usagersService: UsagersService) {}

  public async canActivate(context: ExecutionContext) {
    const r = context.switchToHttp().getRequest();
    if (r.params.id === undefined || r.user.structureId === undefined) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }
    const usager = await this.usagersService.findById(
      r.params.id,
      r.user.structureId
    );

    if (!usager || usager === null) {
      throw new HttpException("USAGER_NOT_FOUND", HttpStatus.BAD_REQUEST);
    }

    r.usager = usager;
    return r;
  }
}
