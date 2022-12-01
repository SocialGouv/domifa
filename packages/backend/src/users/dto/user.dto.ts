import { Transform, TransformFnParams } from "class-transformer";
import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from "class-validator";
import { IsValidPassword } from "../../_common/decorators";
import { StructureCommon } from "../../_common/model";

export class UserDto {
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly prenom!: string;

  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly nom!: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    return value.toString().trim();
  })
  public readonly email!: string;

  @IsNotEmpty()
  @IsValidPassword()
  public readonly password!: string;

  @IsEmpty()
  public readonly structureId?: number;

  @IsEmpty()
  public structure?: StructureCommon;
}
