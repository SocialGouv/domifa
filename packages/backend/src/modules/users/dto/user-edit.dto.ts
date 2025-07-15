import { UserFonction } from "@domifa/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
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
  @IsIn(Object.keys(UserFonction))
  @IsString()
  public readonly fonction!: UserFonction;

  @ApiProperty({
    type: String,
  })
  @MinLength(2)
  @MaxLength(255)
  @IsString()
  @ValidateIf((u) => u.fonction === UserFonction.AUTRE)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    if (value) {
      return value.toString().trim();
    }
    return null;
  })
  public readonly fonctionDetail: string | null;

  @IsNotEmpty()
  @IsEmail()
  public readonly email!: string;
}
