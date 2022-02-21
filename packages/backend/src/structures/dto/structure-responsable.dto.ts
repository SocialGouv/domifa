import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";

export class StructureResponsableDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public readonly fonction: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public readonly nom: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value ? value.toString().trim() : null;
  })
  public readonly prenom: string;
}
