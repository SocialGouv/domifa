import { DomifaEnv, DomifaEnvKey } from "../model";

export const configParser = {
  parseBoolean,
  parseInteger,
  parseString,
};

function parseBoolean(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    defaultValue,
  }: {
    required?: boolean;
    defaultValue?: boolean;
  } = {
    required: true,
  }
): boolean {
  const value = parseString(envConfig, key, {
    required,
    defaultValue:
      defaultValue === true || defaultValue === false
        ? `${defaultValue}`
        : undefined,
  });
  return !!value && value.trim() === "true";
}

function parseInteger(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    defaultValue,
  }: {
    required?: boolean;
    defaultValue?: number;
  } = {
    required: true,
  }
): number {
  const value = parseString(envConfig, key, {
    required,
    defaultValue:
      defaultValue !== null && defaultValue !== undefined
        ? `${defaultValue}`
        : undefined,
  });
  if (value !== undefined) {
    return parseInt(value.trim(), 10);
  }
  return undefined;
}

function parseString<T extends string>(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey,
  {
    required = true,
    validValues,
    defaultValue,
  }: {
    required?: boolean;
    validValues?: T[];
    defaultValue?: T;
  } = {
    required: true,
  }
) {
  let value = envConfig[key] as T;
  if (!value || value.trim().length === 0) {
    value = defaultValue;
  }

  if (!value && required) {
    // tslint:disable-next-line: no-console
    console.error(`[configParser] missing required env value "${key}"`);
    throw new Error("Missing required env value");
  }

  if (value && validValues && !validValues.includes(value)) {
    // tslint:disable-next-line: no-console
    console.error(
      `[configParser] invalid env value "${key}" (allowed: ${validValues
        .map((x) => `"${x}"`)
        .join(",")})`
    );
    throw new Error("Invalid env value");
  }
  return value;
}
