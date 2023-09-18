import { DEPARTEMENTS_MAP } from "./../../util/territoires/constants/REGIONS_DEPARTEMENTS_MAP.const";
import { HttpException, HttpStatus } from "@nestjs/common";
import * as crypto from "crypto";
import {
  userStructureRepository,
  structureRepository,
  StructureTable,
} from "../../database";
import { newStructureEmailSender } from "../../mails/services/templates-renderers";
import { UserDto } from "../../users/dto/user.dto";
import { userStructureCreator } from "../../users/services/user-structure-creator.service";
import { appLogger } from "../../util/AppLogger.service";
import { Structure, StructureCommon } from "../../_common/model";
import { departementHelper } from "./departement-helper.service";
import { StructureDto } from "../dto/structure.dto";
import { generateSender } from "../../sms/services/generators";
import { getLocation } from "./location.service";

export const structureCreatorService = {
  checkStructureCreateArgs,
  createStructureWithAdminUser,
  checkCreationToken,
};

async function checkStructureCreateArgs(
  structureDto: StructureDto
): Promise<StructureDto> {
  try {
    const departement = departementHelper.getDepartementFromCodePostal(
      structureDto.codePostal
    );
    departementHelper.getRegionCodeFromDepartement(departement);
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
  };

  let address = createdStructure.adresse;
  let position: any = await getLocation(address, createdStructure.codePostal);

  if (!position) {
    address = createdStructure.adresse + ", " + createdStructure.ville;
    position = await getLocation(address);
  }

  if (position) {
    createdStructure.longitude = position.coordinates[0];
    createdStructure.latitude = position.coordinates[1];
  }

  createdStructure.registrationDate = new Date();
  createdStructure.token = crypto.randomBytes(30).toString("hex");

  createdStructure.departement = departementHelper.getDepartementFromCodePostal(
    createdStructure.codePostal
  );

  createdStructure.region = departementHelper.getRegionCodeFromDepartement(
    createdStructure.departement
  );

  createdStructure.timeZone =
    DEPARTEMENTS_MAP[createdStructure.departement].timeZone;

  createdStructure.acceptTerms = new Date();

  return structureRepository.save(createdStructure);
}
