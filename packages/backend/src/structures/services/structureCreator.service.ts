import { HttpException, HttpStatus } from "@nestjs/common";
import {
  userStructureRepository,
  structureRepository,
  StructureTable,
} from "../../database";
import { UserDto } from "../../users/dto/user.dto";
import { userStructureCreator } from "../../users/services/user-structure-creator.service";
import { StructureDto } from "../dto/structure.dto";
import { getLocation } from "./location.service";
import {
  DEPARTEMENTS_MAP,
  Structure,
  StructureCommon,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { appLogger } from "../../util";
import { generateSender } from "../../modules/sms/services/generators";
import { Point } from "geojson";
import { newStructureEmailSender } from "../../modules/mails/services/templates-renderers";
import { randomBytes } from "crypto";

export const structureCreatorService = {
  checkStructureCreateArgs,
  createStructureWithAdminUser,
  checkCreationToken,
};

function checkStructureCreateArgs(structureDto: StructureDto): StructureDto {
  try {
    const departement = getDepartementFromCodePostal(structureDto.codePostal);
    getRegionCodeFromDepartement(departement);
  } catch (err) {
    appLogger.warn(
      `[StructuresService] error validating postal code "${structureDto.codePostal}"`
    );
    throw new HttpException("REGION_PROBLEM", HttpStatus.BAD_REQUEST);
  }

  return structureDto;
}

async function createStructureWithAdminUser(
  structureDto: StructureDto,
  userDto: UserDto
): Promise<{ structureId: number; userId: number }> {
  const existingUser = await userStructureRepository.findOneBy({
    email: userDto.email,
  });

  if (existingUser) {
    throw new HttpException("EMAIL_EXIST", HttpStatus.BAD_REQUEST);
  }

  const structure = await createStructure(structureDto);

  const { user } = await userStructureCreator.createUserWithPassword(userDto, {
    structureId: structure.id,
    role: "admin",
  });

  if (!user || !structure) {
    throw new HttpException(
      "STRUCTURE_OR_USER_NOT_FOUND",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  delete user.password;

  await newStructureEmailSender.sendMail({ structure, user });

  return { structureId: structure.id, userId: user.id };
}

async function checkCreationToken({
  uuid,
  token,
}: {
  uuid: string;
  token: string;
}): Promise<StructureCommon | null> {
  try {
    const structure = await structureRepository.findOneByOrFail({
      uuid,
      token,
    });

    await structureRepository.update(
      { uuid, token },
      { token: null, verified: true }
    );

    return await structureRepository.findOneBy({
      uuid: structure.uuid,
    });
  } catch (e) {
    return null;
  }
}

async function createStructure(structureDto: StructureDto) {
  delete structureDto.readCgu;
  delete structureDto.acceptCgu;

  const createdStructure: Structure = new StructureTable(structureDto);

  createdStructure.sms = {
    senderName: generateSender(createdStructure.nom),
    senderDetails: generateSender(createdStructure.nom),
    enabledByDomifa: true,
    enabledByStructure: false,
    schedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
    },
  };

  let address = createdStructure.adresse;
  let position: Point | null = await getLocation(
    address,
    createdStructure.codePostal
  );

  if (!position) {
    address = `${createdStructure.adresse}, ${createdStructure.ville}`;
    position = await getLocation(address);
  }

  if (position) {
    createdStructure.longitude = position.coordinates[0];
    createdStructure.latitude = position.coordinates[1];
  }

  createdStructure.registrationDate = new Date();
  createdStructure.token = randomBytes(30).toString("hex");

  createdStructure.departement = getDepartementFromCodePostal(
    createdStructure.codePostal
  );

  createdStructure.region = getRegionCodeFromDepartement(
    createdStructure.departement
  );

  createdStructure.departmentName =
    DEPARTEMENTS_MAP[createdStructure.departement].departmentName;
  createdStructure.regionName =
    DEPARTEMENTS_MAP[createdStructure.departement].regionName;

  createdStructure.timeZone =
    DEPARTEMENTS_MAP[createdStructure.departement].timeZone;

  createdStructure.acceptTerms = new Date();

  return structureRepository.save(createdStructure);
}
