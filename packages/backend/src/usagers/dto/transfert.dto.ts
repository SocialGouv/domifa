import { IsBoolean, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";

export class TransfertDto {
  @IsOptional()
  @IsBoolean()
  public actif!: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(10)
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public adresse!: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateDebut!: Date;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  public dateFin!: Date;
}
