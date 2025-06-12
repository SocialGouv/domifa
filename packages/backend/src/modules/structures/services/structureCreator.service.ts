import { HttpException, HttpStatus } from "@nestjs/common";
import {
  userStructureRepository,
  structureRepository,
  StructureTable,
} from "../../../database";

import { StructureDto } from "../dto/structure.dto";
import { getAddress } from "./location.service";
import {
  DEPARTEMENTS_MAP,
  Structure,
  StructureCommon,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { appLogger } from "../../../util";
import { generateSender } from "../../sms/services/generators";
import { newStructureEmailSender } from "../../mails/services/templates-renderers";
import { randomBytes } from "crypto";
import { userStructureCreator } from "../../users/services";
import { UserDto } from "../../users/dto";
import { openDataCitiesRepository } from "../../../database/services/open-data/open-data-cities-repository";

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

  const place = await getAddress(
    `${createdStructure.adresse}, ${createdStructure.ville} ${createdStructure.codePostal}`
  );

  if (place) {
    createdStructure.cityCode = place.properties.citycode;
    createdStructure.longitude = place.geometry.coordinates[0];
    createdStructure.latitude = place.geometry.coordinates[1];
  }

  if (createdStructure?.cityCode) {
    const city = await openDataCitiesRepository.findOneBy({
      cityCode: createdStructure.cityCode,
    });

    if (city?.populationSegment) {
      createdStructure.populationSegment = city?.populationSegment;
    }
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
