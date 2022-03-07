import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

import {
  UsagerOptionsHistoryAction,
  UsagerOptionsHistoryType,
} from "../../_common/model/usager";

export class CreateUsagerOptionsHistoryDto {
  @ApiProperty({
    type: Number,
    required: true,
  })
  public usagerUUID: string;

  @ApiProperty({
    type: Number,
    required: true,
  })
  public userId: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  public structureId: number;

  @ApiProperty({
    type: String,
    required: true,
  })
  public userName;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsIn(["EDIT", "CREATION", "DELETE"])
  public action: UsagerOptionsHistoryAction;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsIn(["transfert", "procuration"])
  public type: UsagerOptionsHistoryType;

  @ApiProperty({
    type: Date,
    required: true,
  })
  public date: Date;

  @ApiProperty({
    type: String,
    required: true,
  })
  public nom: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  public prenom!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public adresse!: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  public actif: boolean;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @IsOptional()
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @IsOptional()
  public dateFin!: Date;

  @ApiProperty({
    type: Date,
    required: false,
  })
  @IsOptional()
  public dateNaissance!: Date;
}
