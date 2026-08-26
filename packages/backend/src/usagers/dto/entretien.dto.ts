import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  StripTagsTransform,
  ValidateIfElseNull,
} from "../../_common/decorators";
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
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @ValidateIfElseNull((o) => o.revenus === true)
  public revenusDetail!: string;

  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_TYPE_MENAGE))
  public typeMenage!: UsagerEntretienTypeMenage;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  public rattachement!: string;

  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_LIEN_COMMUNE))
  public liencommune!: UsagerEntretienLienCommune;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @MaxLength(1000)
  @ValidateIfElseNull((o) => o.liencommune === "AUTRE")
  public liencommuneDetail!: string;

  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_RESIDENCE))
  public residence!: UsagerEntretienResidence;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @ValidateIfElseNull((o) => o.residence === "AUTRE")
  public residenceDetail!: string;

  @IsOptional()
  @IsBoolean()
  public orientation!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @ValidateIfElseNull((o) => o.orientation === true)
  public orientationDetail!: string;

  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_CAUSE_INSTABILITE))
  public cause!: UsagerEntretienCause;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @ValidateIfElseNull((o) => o.cause === "AUTRE")
  public causeDetail!: string;

  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_RAISON_DEMANDE))
  public raison!: UsagerEntretienRaisonDemande;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @ValidateIfElseNull((o) => o.raison === "AUTRE")
  public raisonDetail!: string;

  @IsOptional()
  @IsBoolean()
  public accompagnement!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @ValidateIfElseNull((o) => o.accompagnement === true)
  public accompagnementDetail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @StripTagsTransform()
  public commentaires!: string;

  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_SITUATION_PRO))
  public situationPro!: UsagerEntretienSituationPro;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @MaxLength(1000)
  @ValidateIfElseNull((o) => o.situationPro === "AUTRE")
  public situationProDetail!: string;
}
