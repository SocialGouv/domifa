import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
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
import { Transform } from "class-transformer";

export class EntretienDto implements Partial<UsagerEntretien> {
  @IsOptional()
  @IsBoolean()
  public domiciliation!: boolean;

  @IsOptional()
  @IsBoolean()
  public revenus!: boolean;

  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.revenus ? value : null
  )
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
    enum: Object.keys(ENTRETIEN_LIEN_COMMUNE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_LIEN_COMMUNE))
  public liencommune!: UsagerEntretienLienCommune;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @MaxLength(1000)
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.liencommune === "AUTRE" && value ? value.toString().trim() : null
  )
  public liencommuneDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: Object.keys(ENTRETIEN_RESIDENCE),
  })
  @IsOptional()
  @IsIn(Object.keys(ENTRETIEN_RESIDENCE))
  public residence!: UsagerEntretienResidence;

  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.residence === "AUTRE" && value ? value.toString().trim() : null
  )
  public residenceDetail!: string;

  @IsOptional()
  @IsBoolean()
  public orientation!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @StripTagsTransform()
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.orientation ? value : null
  )
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
  @MaxLength(1000)
  @StripTagsTransform()
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.cause === "AUTRE" && value ? value.toString().trim() : null
  )
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
  @MaxLength(1000)
  @StripTagsTransform()
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.raison === "AUTRE" && value ? value.toString().trim() : null
  )
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
  @MaxLength(1000)
  @StripTagsTransform()
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.accompagnement && value ? value.toString().trim() : null
  )
  public accompagnementDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
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

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @StripTagsTransform()
  @MaxLength(1000)
  @Transform(({ value, obj }: { value: string; obj: EntretienDto }) =>
    obj.situationPro === "AUTRE" ? value : null
  )
  public situationProDetail!: UsagerEntretienSituationPro;
}
