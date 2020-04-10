import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "../user.interface";

@Injectable()
export class TipimailService {
  constructor(private readonly mailerService: MailerService) {}

  public async guideUtilisateur(user: User) {
    return this.mailerService.sendMail({
      to: user.email,
      from: {
        name: "Domifa",
        address: "diffusion@fabrique.social.gouv.fr",
      },
      subject: "Découvrez le guide utilisateur DomiFa !",
      template: "guide_utilisateur", // The `.twig` extension is appended automatically.
      context: {
        nom: user.prenom,
      },
    });
  }
}
