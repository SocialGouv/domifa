import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import {
  ENTRETIEN_CAUSE,
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_TYPE_MENAGE,
} from "../../_common/model";
import {
  UsagerEntretien,
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienTypeMenage,
} from "../../_common/model/usager/entretien";

export class EntretienDto implements UsagerEntretien {
  @IsOptional()
  public domiciliation!: boolean;

  @IsOptional()
  public revenus!: boolean;

  @IsOptional()
  public revenusDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_TYPE_MENAGE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_TYPE_MENAGE))
  public typeMenage!: UsagerEntretienTypeMenage;

  @IsOptional()
  public rattachement!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_RESIDENCE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_RESIDENCE))
  public residence!: UsagerEntretienResidence;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_LIEN_COMMUNE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_LIEN_COMMUNE))
  public liencommune!: UsagerEntretienLienCommune;

  @IsOptional()
  public liencommuneDetail!: string;

  @IsOptional()
  public residenceDetail!: string;

  @IsOptional()
  public orientation!: boolean;

  @IsOptional()
  public orientationDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_CAUSE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_CAUSE))
  public cause!: UsagerEntretienCause;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public causeDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_RAISON_DEMANDE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_RAISON_DEMANDE))
  public raison!: UsagerEntretienRaisonDemande;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public raisonDetail!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsOptional()
  public accompagnement!: boolean;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public accompagnementDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public commentaires!: string;
}
