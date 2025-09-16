import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { LowerCaseTransform } from "../../../_common/decorators";
import { UserStructureRole, UserFonction } from "@domifa/common";
import { USER_STRUCTURE_ROLE_ALL } from "../../../_common/model";

export class RegisterUserStructureAdminDto {
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
  @IsNotEmpty()
  @IsIn(Object.keys(UserFonction))
  public readonly fonction!: UserFonction;

  @ApiProperty({
    type: String,
  })
  @MinLength(2)
  @MaxLength(100)
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

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: USER_STRUCTURE_ROLE_ALL,
  })
  @IsNotEmpty()
  @IsIn(USER_STRUCTURE_ROLE_ALL)
  public readonly role!: UserStructureRole;

  @IsNotEmpty()
  @IsNumber()
  public structureId!: number;
}
