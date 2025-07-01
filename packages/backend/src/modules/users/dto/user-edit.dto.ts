import { USER_FONCTION_LABELS_LIST } from "@domifa/common/src/users/user-structure/constants/USER_FONCTION_LABELS.const";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class UserEditDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly prenom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly nom!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @MinLength(2)
  @MaxLength(100)
  @IsIn(USER_FONCTION_LABELS_LIST)
  @IsString()
  public readonly fonction!: string;

  @ApiProperty({
    type: String,
  })
  @MinLength(2)
  @MaxLength(255)
  @IsString()
  @IsOptional()
  public readonly detailFonction: string | null;

  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;
}
