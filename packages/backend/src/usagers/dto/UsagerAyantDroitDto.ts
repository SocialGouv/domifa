import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsIn, IsNotEmpty } from "class-validator";
import { AyantDroiLienParent } from "../../_common/model";

export class UsagerAyantDroitDto {
  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsNotEmpty()
  public nom!: string;

  @ApiProperty({
    example: "Pierre",
    required: true,
    description: "Prénom",
  })
  @IsNotEmpty()
  public prenom!: string;

  @ApiProperty({
    example: "Dudu",
    required: true,
    description: "Surnom",
  })
  @IsNotEmpty()
  @IsIn(["AUTRE", "CONJOINT", "ENFANT", "PARENT"])
  public lien: AyantDroiLienParent;

  @ApiProperty({
    example: "Pierre",
    description: "Prénom",
    type: Date,
  })
  @IsNotEmpty()
  @IsDateString()
  public dateNaissance!: Date;
}
