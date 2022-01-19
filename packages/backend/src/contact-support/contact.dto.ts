import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ContactStatus } from "../_common/model";

export class ContactSupportDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsEmail()
  public email!: string;

  @ApiProperty({
    type: Boolean,
    required: true,
  })
  @IsBoolean()
  public hasAccount!: boolean;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  public name!: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @MinLength(10)
  public content!: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @ValidateIf((o) => o.hasAccount === true)
  @IsNumberString()
  structureId!: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @ValidateIf((o) => o.hasAccount === true)
  @IsNumberString()
  public userId!: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmpty()
  public status!: ContactStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsEmpty()
  public file!: string;
}
