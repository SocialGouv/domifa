import { IsDate, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { Trim } from "../../_common/decorators";

export class ProcurationDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Trim()
  public nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  @Trim()
  public prenom!: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateFin!: Date;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateDebut!: Date;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }: TransformFnParams) => {
    return value ? new Date(value) : null;
  })
  public dateNaissance!: Date;
}
