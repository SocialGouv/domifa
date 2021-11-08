import { HttpStatus } from "@nestjs/common";
import { AppTestAuthProfile } from "../../util/test";
import { UserStructureRole } from "../../_common/model";

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
  const expectedResponseStatus = !user
    ? HttpStatus.UNAUTHORIZED
    : user?.profile === "super-admin-domifa"
    ? validExpectedResponseStatus
    : HttpStatus.FORBIDDEN;
  return expectedResponseStatus;
}
function allowStructureOnly(
  user: AppTestAuthProfile,
  {
    roles,
    validExpectedResponseStatus = HttpStatus.OK,
    allowSuperAdminDomifa,
  }: {
    roles: UserStructureRole[];
    validExpectedResponseStatus?: HttpStatus;
    allowSuperAdminDomifa?: boolean;
  }
): HttpStatus {
  const expectedResponseStatus = !user
    ? HttpStatus.UNAUTHORIZED
    : (user?.profile === "structure" && roles.includes(user?.structureRole)) ||
      (allowSuperAdminDomifa && user?.profile === "super-admin-domifa")
    ? validExpectedResponseStatus
    : HttpStatus.FORBIDDEN;
  return expectedResponseStatus;
}
function allowAnonymous() {
  return HttpStatus.OK;
}
