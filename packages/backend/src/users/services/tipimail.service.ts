import {
  Injectable,
  HttpService,
  Inject,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { User } from "../user.interface";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import * as moment from "moment";

@Injectable()
export class TipimailService {
  public lastWeek: Date;

  constructor(
    @Inject("USER_MODEL") private readonly userModel: Model<User>,
    private httpService: HttpService
  ) {
    this.lastWeek = moment().utc().subtract(7, "days").endOf("day").toDate();
  }

  @Cron(CronExpression.EVERY_15_SECONDS)
  public async cronGuide() {
    // console.log("---- ENTER CRON");
    const user = await this.userModel
      .findOne({
        structureId: 1,
        // createdAt: { $lte: this.lastWeek },
        "mails.guide": false,
      })
      .select("-import -token -users -verified")
      .lean()
      .exec();

    if (!user || user === null) {
      // console.log("---- LEAVE CRON NO STRUCTURE");
      return;
    }

    const lienGuide =
      process.env.FRONT_URL + "assets/files/guide_utilisateur_domifa.pdf";

    const post = {
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "guide-utilisateur",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
              nom: user.prenom,
              lien: lienGuide,
            },
            meta: {},
          },
        ],
      },
      msg: {
        from: {
          personalName: "Domifa",
          address: "contact.domifa@diffusion.social.gouv.fr",
        },
        replyTo: {
          personalName: "Domifa",
          address: "contact.domifa@fabrique.social.gouv.fr",
        },
        subject: "Subject",
        html: "<p>Test</p>",
      },
    };

    this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .subscribe(
        (retour: any) => {
          this.userModel
            .findOneAndUpdate(
              {
                _id: user._id,
              },
              {
                $set: {
                  "mails.guide": true,
                },
              }
            )
            .exec((erreur: any) => {
              // console.log("-- UPDATE MAIL VALUE");
              if (erreur === null) {
                this.cronGuide();
              } else {
                throw new HttpException(
                  "CANNOT_UPDATE_MAIL_GUIDE",
                  HttpStatus.INTERNAL_SERVER_ERROR
                );
              }
            });
        },
        (erreur: any) => {
          throw new HttpException(
            "TIPIMAIL_GUIDE_ERROR",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      );
  }
}
