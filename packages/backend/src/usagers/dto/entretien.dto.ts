import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
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
    enum: [
      "COUPLE_AVEC_ENFANT",
      "COUPLE_SANS_ENFANT",
      "FEMME_ISOLE_AVEC_ENFANT",
      "FEMME_ISOLE_SANS_ENFANT",
      "HOMME_ISOLE_AVEC_ENFANT",
      "HOMME_ISOLE_SANS_ENFANT",
    ],
  })
  @IsOptional()
  @IsIn([
    "COUPLE_AVEC_ENFANT",
    "COUPLE_SANS_ENFANT",
    "FEMME_ISOLE_AVEC_ENFANT",
    "FEMME_ISOLE_SANS_ENFANT",
    "HOMME_ISOLE_AVEC_ENFANT",
    "HOMME_ISOLE_SANS_ENFANT",
  ])
  public typeMenage!: UsagerEntretienTypeMenage;

  @IsOptional()
  public rattachement!: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: [
      "AUTRE",
      "DOMICILE_MOBILE",
      "HEBERGEMENT_SOCIAL",
      "HEBERGEMENT_TIERS",
      "HOTEL",
      "SANS_ABRI",
    ],
  })
  @IsIn([
    "AUTRE",
    "DOMICILE_MOBILE",
    "HEBERGEMENT_SOCIAL",
    "HEBERGEMENT_TIERS",
    "HOTEL",
    "SANS_ABRI",
  ])
  @IsOptional()
  public residence!: UsagerEntretienResidence;

  @ApiProperty({
    type: String,
    required: false,
    enum: [
      "RESIDENTIEL",
      "PARENTAL",
      "FAMILIAL",
      "PROFESSIONNEL",
      "SOCIAL",
      "AUTRE",
    ],
  })
  @IsIn([
    "RESIDENTIEL",
    "PARENTAL",
    "FAMILIAL",
    "PROFESSIONNEL",
    "SOCIAL",
    "AUTRE",
  ])
  @IsOptional()
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
    enum: [
      "AUTRE",
      "ERRANCE",
      "EXPULSION",
      "HEBERGE_SANS_ADRESSE",
      "ITINERANT",
      "RUPTURE",
      "SORTIE_STRUCTURE",
      "VIOLENCE",
    ],
  })
  @IsIn([
    "AUTRE",
    "ERRANCE",
    "EXPULSION",
    "HEBERGE_SANS_ADRESSE",
    "ITINERANT",
    "RUPTURE",
    "SORTIE_STRUCTURE",
    "VIOLENCE",
  ])
  @IsOptional()
  public cause!: UsagerEntretienCause;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public causeDetail!: string;

  @IsIn(["EXERCICE_DROITS", "PRESTATIONS_SOCIALES", "AUTRE"])
  @ApiProperty({
    type: String,
    required: false,
    enum: ["EXERCICE_DROITS", "PRESTATIONS_SOCIALES", "AUTRE"],
  })
  @IsOptional()
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
