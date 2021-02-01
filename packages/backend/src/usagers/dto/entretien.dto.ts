import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";
import { UsagerEntretien } from "../../database";

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
  public typeMenage!: string;

  @IsOptional()
  public liencommune!: string;

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
  public residence!: string;

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
  public cause!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public causeDetail!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public pourquoi!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public pourquoiDetail!: string;

  @IsOptional()
  public raison!: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  public raisonDetail!: string;

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
