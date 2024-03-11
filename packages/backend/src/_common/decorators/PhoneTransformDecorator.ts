import { Telephone } from "@domifa/common";
import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from "class-transformer";

export function PhoneTransform(
  transformOptions?: TransformOptions
): (target: any, key: string) => void {
  return Transform((sourceData: TransformFnParams) => {
    const value = sourceData.value as Telephone;
    if (!value) {
      return {
        numero: "",
        countryCode: "fr",
      };
    }
    return {
      numero: value?.numero ? value?.numero.replace(/\D/g, "") : "",
      countryCode: value?.countryCode ? value.countryCode.toLowerCase() : "fr",
    };
  }, transformOptions);
}
