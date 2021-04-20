import * as yup from "yup";

export function oneOfString<T extends string>(
  allowedValues: T[],
  {
    toUpperCase,
    label,
  }: {
    toUpperCase?: boolean;
    label?: string;
  } = {
    toUpperCase: true,
  }
) {
  return yup
    .mixed<T>()
    .transform((value, originalValue) =>
      toUpperCase !== false
        ? (originalValue as string)?.toUpperCase()
        : originalValue
    )
    .oneOf(allowedValues)
    .label(label);
}
