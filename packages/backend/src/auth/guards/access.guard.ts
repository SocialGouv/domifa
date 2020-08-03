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
