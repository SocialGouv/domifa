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
  }: { roles: UserStructureRole[]; validExpectedResponseStatus?: HttpStatus }
): HttpStatus {
  const expectedResponseStatus = !user
    ? HttpStatus.UNAUTHORIZED
    : user?.profile === "super-admin-domifa" || // le super admin domifa est aussi admin structure, donc il doit avoir accès
      (user?.profile === "structure" && roles.includes(user?.structureRole))
    ? validExpectedResponseStatus
    : HttpStatus.FORBIDDEN;
  return expectedResponseStatus;
}
function allowAnonymous() {
  return HttpStatus.OK;
}
