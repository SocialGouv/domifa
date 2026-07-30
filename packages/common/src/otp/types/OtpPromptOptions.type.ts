import { OtpErrorCode } from "./OtpErrorCode.type";
import { OtpPurpose } from "./OtpPurpose.type";

export interface OtpPromptOptions {
  purpose: OtpPurpose;
  previousErrorCode?: OtpErrorCode;
}
