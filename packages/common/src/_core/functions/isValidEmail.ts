import isEmail from "validator/lib/isEmail";

// Single email rule shared by the frontends (validator lib, same as the
// backend's class-validator @IsEmail)
export const isValidEmail = (value: unknown): boolean =>
  typeof value === "string" && isEmail(value);
