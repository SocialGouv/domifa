import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EmailDto } from "../../users/dto/email.dto";
import { BrevoSenderService } from "../services/brevo-sender/brevo-sender.service";
import { appLogger } from "../../../util";

@Controller("newsletter")
@ApiTags("newsletter")
export class NewsletterPublicController {
  constructor(private readonly brevoSenderService: BrevoSenderService) {}

  @Post("subscribe")
  @HttpCode(HttpStatus.OK)
  async subscribe(@Body() { email }: EmailDto): Promise<void> {
    try {
      await this.brevoSenderService.subscribeToNewsletter(email);
    } catch (error) {
      appLogger.warn(
        `Erreur lors de l'inscription newsletter pour ${email}`,
        error
      );
    }
  }
}
