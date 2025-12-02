import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ExpressResponse } from "../../../util/express";
import { StructureWithUserDto } from "../dto/structure-with-user.dto";
import { StructureDto } from "../dto/structure.dto";
import { structureCreatorService } from "../services/structureCreator.service";
import { StructuresService } from "../services/structures.service";
import { CodePostalDto } from "../dto";
import { userStructureRepository } from "../../../database";
import { BrevoSenderService } from "../../mails/services/brevo-sender/brevo-sender.service";
import { appLogger } from "../../../util";
import { domifaConfig } from "../../../config";
@Controller("structures")
@ApiTags("structures")
export class StructuresPublicController {
  constructor(
    private readonly structureService: StructuresService,
    private readonly brevoSenderService: BrevoSenderService
  ) {}

  @Post()
  public async postStructure(
    @Body() structureWithUserDto: StructureWithUserDto,
    @Res() res: ExpressResponse
  ) {
    try {
      const { userId } =
        await structureCreatorService.createStructureWithAdminUser(
          structureWithUserDto.structure,
          structureWithUserDto.user
        );

      try {
        const userWithStructure =
          await userStructureRepository.getUserWithStructureByIdForSync(userId);
        if (userWithStructure) {
          await this.brevoSenderService.syncContactToBrevo(userWithStructure);

          await this.brevoSenderService.sendEmailWithTemplate({
            templateId:
              domifaConfig().brevo.templates.userStructureCreatedByAdmin,
            to: [
              {
                email: userWithStructure.email,
                name: `${userWithStructure.prenom} ${userWithStructure.nom}`,
              },
            ],
            params: {
              prenom: userWithStructure.prenom,
            },
          });
        }
      } catch (error) {
        appLogger.warn(
          `Échec de la synchronisation Brevo pour l'utilisateur ${userId}`,
          error
        );
      }

      return res.status(HttpStatus.OK).json("OK");
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json("CREATE_STRUCTURE_FAIL");
    }
  }

  @Post("pre-post")
  public prePostStructure(@Body() structureDto: StructureDto) {
    return structureCreatorService.checkStructureCreateArgs(structureDto);
  }

  @Post("code-postal")
  public async getByCity(@Body() codePostalDto: CodePostalDto) {
    return await this.structureService.findAllLight(codePostalDto);
  }
}
