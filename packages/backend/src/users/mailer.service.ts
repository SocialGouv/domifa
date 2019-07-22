import { Injectable } from "@nestjs/common";
import * as mailjet from "node-mailjet";

@Injectable()
export class MailerService {
  public sendConfirmationMail(req, res, next) {
    mailjet.connect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );
  }
}
