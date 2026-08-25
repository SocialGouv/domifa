import { IsDate, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { Trim } from "../../_common/decorators";

export class ProcurationDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Trim()
  public nom!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Trim()
  public prenom!: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateFin!: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateDebut!: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateNaissance!: Date;
}
