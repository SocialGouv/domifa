import { HttpStatus } from "@nestjs/common";
import { AppTestAuthProfile } from "../../util/test";
import { UserStructureRole } from "@domifa/common";

export const expectedResponseStatusBuilder = {
  allowAnonymous,
  allowSuperAdminDomifaOnly,
  allowStructureOnly,
};
function allowSuperAdminDomifaOnly(
  user: AppTestAuthProfile,
  {
    validExpectedResponseStatus = HttpStatus.OK,
  }: { validExpectedResponseStatus?: HttpStatus } = {}
): HttpStatus {
  return !user
    ? HttpStatus.UNAUTHORIZED
    : user?.profile === "super-admin-domifa"
    ? validExpectedResponseStatus
    : HttpStatus.FORBIDDEN;
}
function allowStructureOnly(
  user: AppTestAuthProfile,
  {
    roles,
    validExpectedResponseStatus = HttpStatus.OK,
    allowSuperAdminDomifa,
    validStructureIds,
    invalidStructureIdExpectedResponseStatus = HttpStatus.FORBIDDEN,
  }: {
    roles: UserStructureRole[];
    validExpectedResponseStatus?: HttpStatus;
    allowSuperAdminDomifa?: boolean;
    validStructureIds?: number[];
    invalidStructureIdExpectedResponseStatus?: HttpStatus;
  }
): HttpStatus {
  if (!user) {
    return HttpStatus.UNAUTHORIZED;
  }
  if (allowSuperAdminDomifa && user?.profile === "super-admin-domifa") {
    return validExpectedResponseStatus;
  }
  if (user?.profile === "structure" && roles.includes(user?.structureRole)) {
    if (
      validStructureIds?.length &&
      !validStructureIds.includes(user?.structureId)
    ) {
      return invalidStructureIdExpectedResponseStatus;
    }
    return validExpectedResponseStatus;
  }

  return HttpStatus.FORBIDDEN;
}

function allowAnonymous() {
  return HttpStatus.OK;
}
