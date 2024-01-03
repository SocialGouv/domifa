import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import { StripTagsTransform } from "../../_common/decorators";
import {
  ENTRETIEN_CAUSE_INSTABILITE,
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_SITUATION_PRO,
  ENTRETIEN_TYPE_MENAGE,
  UsagerEntretien,
  UsagerEntretienCause,
  UsagerEntretienLienCommune,
  UsagerEntretienRaisonDemande,
  UsagerEntretienResidence,
  UsagerEntretienSituationPro,
  UsagerEntretienTypeMenage,
} from "@domifa/common";

export class EntretienDto implements Partial<UsagerEntretien> {
  @IsOptional()
  @IsBoolean()
  public domiciliation!: boolean;

  @IsOptional()
  @IsBoolean()
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
  @IsString()
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
  @IsString()
  @StripTagsTransform()
  public liencommuneDetail!: string;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  public residenceDetail!: string;

  @IsOptional()
  @IsBoolean()
  public orientation!: boolean;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  public orientationDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_CAUSE_INSTABILITE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_CAUSE_INSTABILITE))
  public cause!: UsagerEntretienCause;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
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
  @IsString()
  @StripTagsTransform()
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
  @IsString()
  @StripTagsTransform()
  public accompagnementDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  public commentaires!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_SITUATION_PRO),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_SITUATION_PRO))
  public situationPro!: UsagerEntretienSituationPro;
}
