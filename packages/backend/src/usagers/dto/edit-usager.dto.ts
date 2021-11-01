import { ApiProperty } from "@nestjs/swagger";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from "class-validator";
import {
  Usager,
  UsagerAyantDroit,
  UsagerSexe,
  UsagerTypeDom,
} from "../../_common/model";

export class EditUsagerDto implements Partial<Usager> {
  @ApiProperty()
  @IsIn(["homme", "femme"])
  public sexe!: UsagerSexe;

  @ApiProperty()
  @IsOptional()
  public langue!: string;

  @ApiProperty()
  @IsOptional()
  public customRef!: string;

  @ApiProperty()
  @IsNotEmpty()
  public nom!: string;

  @ApiProperty()
  @IsNotEmpty()
  public prenom!: string;

  @ApiProperty()
  @IsOptional()
  public surnom!: string;

  @ApiProperty()
  @IsNotEmpty()
  public dateNaissance!: Date;

  @ApiProperty()
  @IsNotEmpty()
  public villeNaissance!: string;

  @ApiProperty()
  @IsOptional()
  public email!: string;

  @ApiProperty()
  @IsOptional()
  public phone!: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public etapeDemande!: number;

  // TODO: améliorer le DTO ici
  @ApiProperty()
  @IsOptional()
  public ayantsDroits!: UsagerAyantDroit[];

  // TODO: réactiver une fois le point fait sur les impacts d'avoir le choxi du type de DOm
  // @ApiProperty()
  // @IsOptional()
  // @IsIn(["RENOUVELLEMENT", "PREMIERE_DOM"])
  // public typeDom!: UsagerTypeDom;

  // @ValidateIf((o) => o.typeDom === "RENOUVELLEMENT")
  // @IsNotEmpty()
  // public datePremiereDom!: Date;
}
