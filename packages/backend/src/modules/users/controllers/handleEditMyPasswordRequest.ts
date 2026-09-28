import { HttpStatus } from "@nestjs/common";
import { Request as ExpressRequest, Response } from "express";

import { UserProfile } from "../../../_common/model";
import { appLogger } from "../../../util";
import { buildSecurityLogRequestContext } from "../../../util/express";
import { EditMyPasswordDto } from "../dto";
import { userStructureSecurityPasswordUpdater } from "../services";

// Shared by the structure and supervisor edit-my-password endpoints — same
// flow, only the authenticated user's profile differs.
export async function handleEditMyPasswordRequest({
  req,
  res,
  userId,
  userProfile,
  editPasswordDto,
}: {
  req: ExpressRequest;
  res: Response;
  userId: number;
  userProfile: UserProfile;
  editPasswordDto: EditMyPasswordDto;
}): Promise<void> {
  try {
    await userStructureSecurityPasswordUpdater.updatePassword({
      userId,
      oldPassword: editPasswordDto.oldPassword,
      newPassword: editPasswordDto.password,
      userProfile,
      requestContext: buildSecurityLogRequestContext(req),
    });
    res.status(HttpStatus.OK).json({ message: "OK" });
  } catch (err) {
    if ((err as Error)?.message === "NEW_PASSWORD_SAME_AS_OLD") {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "NEW_PASSWORD_SAME_AS_OLD" });
      return;
    }
    if ((err as Error)?.message === "NEW_PASSWORD_ALREADY_USED") {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "NEW_PASSWORD_ALREADY_USED" });
      return;
    }
    appLogger.error(err);
    res.status(HttpStatus.BAD_REQUEST).json({ message: "EDIT_PASSWORD_FAIL" });
  }
}
