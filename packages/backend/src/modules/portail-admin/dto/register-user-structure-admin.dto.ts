import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";
import { LowerCaseTransform } from "../../../_common/decorators";
import { UserStructureRole } from "@domifa/common";

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
  @IsNotEmpty()
  @IsEmail()
  @LowerCaseTransform()
  public readonly email!: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: ["admin", "simple", "facteur", "responsable"],
  })
  @IsNotEmpty()
  @IsIn(["admin", "simple", "facteur", "responsable"])
  public readonly role!: UserStructureRole;

  @IsNotEmpty()
  @IsNumber()
  public structureId!: number;
}
