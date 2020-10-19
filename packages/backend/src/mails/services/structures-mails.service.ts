import { HttpService, Injectable } from "@nestjs/common";

import { ConfigService } from "../../config";

import { User } from "../../users/user.interface";
import { Structure } from "../../structures/structure-interface";

@Injectable()
export class StructuresMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService
  ) {
    this.domifaAdminMail = this.configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = this.configService.get("DOMIFA_TIPIMAIL_FROM_EMAIL");
  }
}
