import { IsOptional } from "class-validator";

export class EntretienDto {
  @IsOptional()
  public domiciliation: boolean = false;

  @IsOptional()
  public revenus: boolean = false;

  @IsOptional()
  public revenusDetail!: string;

  @IsOptional()
  public typeMenage!: string;

  @IsOptional()
  public liencommune!: string;

  @IsOptional()
  public residence!: string;

  @IsOptional()
  public residenceDetail!: string;

  @IsOptional()
  public orientation!: string;

  @IsOptional()
  public orientationDetail!: string;

  @IsOptional()
  public cause!: string;

  @IsOptional()
  public causeDetail!: string;

  @IsOptional()
  public pourquoi!: string;

  @IsOptional()
  public pourquoiDetail!: string;

  @IsOptional()
  public raison!: string;

  @IsOptional()
  public raisonDetail!: string;

  @IsOptional()
  public accompagnement: boolean = false;

  @IsOptional()
  public accompagnementDetail!: string;

  @IsOptional()
  public commentaires!: string;
}
