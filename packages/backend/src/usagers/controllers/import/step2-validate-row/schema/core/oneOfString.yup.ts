import * as yup from "yup";

export function oneOfString<T extends string>(
  allowedValues: T[],
  {
    transform = (value: any, originalValue: any) => originalValue,
    toUpperCase,
    label,
  }: {
    transform: (value: any, originalValue: any) => T;
    toUpperCase?: boolean;
    label?: string;
  } = {
    transform: (value: any, originalValue: any) => originalValue,
    toUpperCase: true,
  }
) {
  return yup
    .mixed<T>()
    .transform((value, originalValue) => {
      const newOriginalValue =
        toUpperCase !== false && (originalValue as string)?.toUpperCase
          ? (originalValue as string)?.toUpperCase()
          : originalValue;
      return transform(value, newOriginalValue);
    })
    .oneOf(allowedValues)
    .label(label);
}
