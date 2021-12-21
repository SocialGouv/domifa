import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsNotEmpty } from "class-validator";

import { LogAction } from "../../_common/model/log/LogAction.type";

export class CreateLogDto {
  @ApiProperty({
    example: "1",
    description: "ID de l'utilisateur",
  })
  @IsNotEmpty()
  public userId: number;

  @ApiProperty({
    example: "2",
    description: "référence du domicilié",
  })
  @IsOptional()
  public usagerRef!: number;

  @ApiProperty({
    example: "3",
    description: "ID de la structure",
  })
  @IsNotEmpty()
  public structureId: number;

  @ApiProperty({
    example: "connexion, créer une demande, supprimer une pièce jointe...",
    description: "action de l'utilisateur",
  })
  @IsNotEmpty()
  @IsIn([
    "SUPPRIMER_PIECE_JOINTE",
    "SUPPRIMER_DOMICILIE",
    "RESET_PASSWORD_PORTAIL",
    "DOWNLOAD_PASSWORD_PORTAIL",
  ])
  public action: LogAction;
}
