import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { AyantDroit } from "../interfaces/ayant-droit";

export class EditUsagerDto {
  @ApiProperty()
  @IsIn(["homme", "femme"])
  public sexe!: string;

  @ApiProperty()
  @IsOptional()
  public langue!: string;

  @ApiProperty()
  @IsOptional()
  public customId!: string;

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

  @ApiProperty()
  @IsOptional()
  @IsIn(["RENOUVELLEMENT", "PREMIERE"])
  public typeDom!: string;

  @ApiProperty()
  @IsOptional()
  public preference!: {
    email: boolean;
    phone: boolean;
  };

  @ApiProperty()
  @IsOptional()
  public ayantsDroits!: AyantDroit[];
}
