import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsDateString, IsIn, IsNotEmpty } from "class-validator";
import { AyantDroiLienParent } from "../../_common/model";

export class UsagerAyantDroitDto {
  @ApiProperty({
    example: "Dubois",
    description: "Nom",
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public nom!: string;

  @ApiProperty({
    example: "Pierre",
    required: true,
    description: "Prénom",
  })
  @IsNotEmpty()
  public prenom!: string;
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
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
